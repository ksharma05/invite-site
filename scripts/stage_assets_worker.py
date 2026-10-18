"""Pixel worker behind scripts/stage-assets.mjs.

Two modes:

  --mode=process  detect the sheet in a photo, crop a pure-paper band, grade it
                  to the site palette, keep the fibre tooth, make opposite
                  edges wrap-ish, encode AVIF/WebP/JPEG under a byte budget,
                  and write the files.
  --mode=verify   decode files that are already on disk and report measured
                  dims / bytes / mean hex / warmth / saturation, so the caller
                  can prove the output instead of trusting this script.

Diagnostics go to stderr; stdout carries exactly one JSON document. Run via
Node, not by hand.

Why the pixel work lives in Python: Pillow here genuinely decodes and encodes
AVIF and WebP (features.check -> True), whereas `sharp` in this repo is only a
transitive dependency of next, not declared in package.json, so an upgrade
could remove it without notice.
"""

import argparse
import io
import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

LUMA = np.array([0.299, 0.587, 0.114])

# Site palette (src/app/globals.css, terracotta theme).
TARGET_LOW = (225, 209, 184)  # #e1d1b8  measured tone of the real paper
TARGET_HIGH = (236, 217, 196)  # #ecd9c4  --color-surface-alt
MIN_WARMTH = 15.0  # final mean R-B
MIN_SATURATION_PCT = 1.0  # any value > 0 rules out neutral grey
BRIGHT_LUM = (200.0, 242.0)  # "keep it bright": paper-white luminance window

# Quality ladders, tried in order, first hit under budget wins.
LADDER = {
    # Pillow 12 wants subsampling as "4:2:0" (the default), so it is omitted.
    "AVIF": [dict(quality=q, speed=6) for q in (62, 56, 50, 45, 40, 35, 30, 26, 22, 18, 15, 12)],
    "WEBP": [
        dict(quality=q, method=6) for q in (80, 74, 68, 62, 56, 50, 44, 38, 32, 27, 22, 18)
    ],
    "JPEG": [
        dict(quality=q, optimize=True, progressive=True) for q in (82, 76)
    ],
}


def collected_of(fn):
    """Notes gathered by the `note` closure (see main())."""
    return getattr(fn, "lines", [])


def backdrop_colour(rgb):
    """Median colour of the outer ring of the frame = the studio surround."""
    h, w, _ = rgb.shape
    r = max(1, min(h, w) // 50)
    ring = np.concatenate(
        [
            rgb[:r].reshape(-1, 3),
            rgb[-r:].reshape(-1, 3),
            rgb[:, :r].reshape(-1, 3),
            rgb[:, -r:, :].reshape(-1, 3),
        ]
    )
    return np.median(ring, axis=0)


def largest_inscribed_box(mask):
    """Largest all-True axis-aligned rectangle (maximal AREA, so it prefers a
    big solid paper block over a tall thin sliver). O(h*w)."""
    h, w = mask.shape
    heights = np.zeros(w, dtype=np.int64)
    best, best_box = 0, (0, 0, 0, 0)
    for y in range(h):
        heights = np.where(mask[y], heights + 1, 0)
        stack = []
        for x in range(w + 1):
            cur = heights[x] if x < w else 0
            start = x
            while stack and stack[-1][1] >= cur:
                sx, sh = stack.pop()
                area = int(sh) * (x - sx)
                if area > best:
                    best, best_box = area, (int(sx), int(y - sh + 1), int(x), int(y + 1))
                start = sx
            stack.append((start, cur))
    return best_box, best


def detect_paper(rgb, back, thresholds, note):
    """Self-calibrating, two-step.

    Step 1: threshold the distance-from-backdrop at several fixed strengths and
    keep the largest inscribed box found. Step 2: measure the median distance
    inside that box (that region is certainly paper whatever the photo's
    exposure) and re-run at 25% of it, clamped to a floor. The fraction is
    deliberately LOW: the brightly lit top edge of a cream sheet sits close to a
    white surround, and an aggressive threshold there would throw away real
    paper - and quietly bias the crop toward the darker, shadowed bottom half.
    Edge safety comes from the geometric inset plus verify_pure_paper()."""
    dist = np.abs(rgb - back).sum(-1)
    scan = []
    for thr in thresholds:
        box, area = largest_inscribed_box(dist > thr)
        scan.append({"threshold": thr, "box": [int(v) for v in box], "area": int(area)})
        note(
            f"detect: thr={thr:>3} paper={float((dist > thr).mean()) * 100:5.1f}% "
            f"box={box} area={area}"
        )
    cand = max((s for s in scan if s["area"] > 0), key=lambda s: s["area"], default=None)
    if cand is None:
        return None, scan, dist
    stage1 = tuple(cand["box"])

    x0, y0, x1, y1 = stage1
    pad = max(1, int(0.05 * min(x1 - x0, y1 - y0)))
    core = dist[y0 + pad : y1 - pad, x0 + pad : x1 - pad]
    core_med = float(np.median(core))
    final_thr = max(10.0, 0.25 * core_med)
    box, area = largest_inscribed_box(dist > final_thr)
    if area <= 0:
        box, area = stage1, cand["area"]
    note(
        "detect: core paper distance {:.1f} -> final threshold {:.1f} (25% of core, floor 10) "
        "-> box {} area={}".format(core_med, final_thr, box, area)
    )
    return (
        {"box": tuple(box), "area": int(area), "core_median_dist": core_med,
         "final_threshold": final_thr, "stage1_box": list(stage1)},
        scan,
        dist,
    )


def verify_pure_paper(a, dist_crop, core_med, note, check_backdrop=True, subject="crop"):
    """Hard guarantee that the surround cannot survive into an output: audit the
    real crop. Returns (ok, measurements, problems) - caller exits non-zero."""
    a = np.asarray(a, dtype=np.float64)
    mx, mn = a.max(-1), a.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    mean = a.reshape(-1, 3).mean(0)
    backdrop_like = (
        float((dist_crop <= max(8.0, 0.20 * core_med)).mean() * 100) if check_backdrop else 0.0
    )
    neutral = float(np.mean((np.abs(a[..., 0] - a[..., 2]) <= 2) & (sat <= 0.01)) * 100)
    lum = a @ LUMA
    checks = {
        "backdrop_like_pct": round(backdrop_like, 3),
        "neutral_grey_pct": round(neutral, 3),
        "warmth_rb": round(float(mean[0] - mean[2]), 2),
        "saturation_pct": round(float(sat.mean() * 100), 2),
        "lum_mean": round(float(lum.mean()), 1),
    }
    problems = []
    if check_backdrop and checks["backdrop_like_pct"] > 0.5:
        problems.append(
            f"{checks['backdrop_like_pct']}% of the crop still matches the backdrop colour"
        )
    if checks["neutral_grey_pct"] > 1.0:
        problems.append(f"{checks['neutral_grey_pct']}% neutral-grey pixels in the crop")
    if checks["warmth_rb"] < MIN_WARMTH:
        problems.append(f"warmth R-B {checks['warmth_rb']} < required {MIN_WARMTH}")
    if checks["saturation_pct"] <= MIN_SATURATION_PCT:
        problems.append(f"saturation {checks['saturation_pct']}% is too close to grey")
    if not (BRIGHT_LUM[0] <= checks["lum_mean"] <= BRIGHT_LUM[1]):
        problems.append(
            f"mean luminance {checks['lum_mean']} outside bright-paper window {BRIGHT_LUM}"
        )
    note(
        "audit({}): backdrop-like {}% neutral-grey {}% warmth {} sat {}% lum {} -> {}".format(
            subject, checks["backdrop_like_pct"], checks["neutral_grey_pct"], checks["warmth_rb"],
            checks["saturation_pct"], checks["lum_mean"],
            "PASS" if not problems else "FAIL: " + "; ".join(problems),
        )
    )
    return (not problems), checks, problems


def inset_box(box, w, h, fraction):
    x0, y0, x1, y1 = box
    dx, dy = int(round((x1 - x0) * fraction)), int(round((y1 - y0) * fraction))
    nx0, ny0 = x0 + dx, y0 + dy
    nx1, ny1 = x1 - dx, y1 - dy
    return (max(0, min(nx0, w - 1)), max(0, min(ny0, h - 1)),
            max(nx0 + 1, min(w, nx1)), max(ny0 + 1, min(h, ny1)))


def pick_band(box, aspect):
    """Largest landscape band at `aspect` (width/height), centred in the box."""
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    cw = bw
    ch = int(round(cw / aspect))
    if ch > bh:
        ch = bh
        cw = int(round(ch * aspect))
    ox = x0 + (bw - cw) // 2
    oy = y0 + (bh - ch) // 2
    return (ox, oy, ox + cw, oy + ch)


# ------------------------------------------------------------------ metrics


def smooth_1d(v, sigma):
    """Gaussian blur of a 1-D profile with edge padding (numpy only)."""
    if sigma <= 0 or v.shape[0] < 3:
        return v.copy()
    radius = max(1, int(np.ceil(3 * sigma)))
    ext = np.concatenate([v[::-1][:radius], v, v[::-1][-radius:]])
    x = np.arange(-radius, radius + 1, dtype=np.float64)
    k = np.exp(-(x * x) / (2 * sigma * sigma))
    k /= k.sum()
    out = np.empty_like(v)
    for c in range(v.shape[1]):
        out[:, c] = np.convolve(ext[:, c], k, mode="valid")
    return out


def stats(rgb):
    a = np.asarray(rgb, dtype=np.float64)
    mx, mn = a.max(-1), a.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    mean = a.reshape(-1, 3).mean(0)
    lum = a @ LUMA
    lap = np.abs(
        -4.0 * lum[1:-1, 1:-1] + lum[:-2, 1:-1] + lum[2:, 1:-1] + lum[1:-1, :-2] + lum[1:-1, 2:]
    ).mean()
    sl = max(1, a.shape[0] // 5)
    top, bottom = float((a[:sl] @ LUMA).mean()), float((a[-sl:] @ LUMA).mean())
    return {
        "mean_rgb": [round(float(v), 1) for v in mean],
        "mean_hex": "#{:02x}{:02x}{:02x}".format(*[int(round(v)) for v in mean]),
        "warmth_rb": round(float(mean[0] - mean[2]), 2),
        "saturation_pct": round(float(sat.mean() * 100), 2),
        "lum_mean": round(float(lum.mean()), 1),
        "lum_top_bottom": [round(top, 1), round(bottom, 1)],
        "lum_spread": round(abs(top - bottom), 1),
        "neutral_grey_pct": round(
            float(np.mean((np.abs(a[..., 0] - a[..., 2]) <= 2) & (sat <= 0.01)) * 100), 3
        ),
        "tooth_lap_mean": round(float(lap), 2),
        "min": [int(v) for v in a.reshape(-1, 3).min(0)],
        "max": [int(v) for v in a.reshape(-1, 3).max(0)],
    }


def edge_mismatch(a):
    """How far opposite edges are from wrapping: mean |L1| between matched
    edge strips, per axis. Lower is a better tile."""
    a = np.asarray(a, dtype=np.float64)
    d = max(2, min(a.shape[:2]) // 60)
    v = float(np.abs(a[:, :d] - a[:, -d:]).mean())
    hh = float(np.abs(a[:d] - a[-d:]).mean())
    return {"lr_l1": round(v, 2), "tb_l1": round(hh, 2), "worst": round(max(v, hh), 2), "probe_d": d}


# -------------------------------------------------------------- processing


def to_u8(a):
    return np.clip(np.rint(a), 0, 255).astype(np.uint8)


def grade(a, target_lo, target_hi, note):
    """Per-channel gain toward the palette midpoint, capped tightly so the tile
    stays bright and never picks up a dark or moody push."""
    src = np.asarray(a, dtype=np.float64)
    mean = src.reshape(-1, 3).mean(0)
    want = (np.array(target_lo, np.float64) + np.array(target_hi, np.float64)) / 2.0
    gains = np.clip(want / np.maximum(mean, 1.0), 0.94, 1.08)
    out = src * gains
    lum = (out @ LUMA).mean()
    if lum < BRIGHT_LUM[0] or lum > BRIGHT_LUM[1]:
        adjust = float(np.clip(((BRIGHT_LUM[0] + BRIGHT_LUM[1]) / 2.0) / max(lum, 1.0), 0.95, 1.05))
        out = out * adjust
        note(f"grade: brightness guard x{adjust:.3f} (luminance was {lum:.1f})")
    note(
        "grade: mean {} ->{} (gain {} / target {})".format(
            [round(float(v), 1) for v in mean],
            [round(float(v), 1) for v in out.reshape(-1, 3).mean(0)],
            [round(float(g), 3) for g in gains],
            "#{:02x}{:02x}{:02x}".format(*[int(v) for v in np.round(want)]),
        )
    )
    return out


def apply_light(a, target_spread, note):
    """Force a gentle, even TOP-DOWN light last, after edge matching.

    A tile whose top and bottom edges wrap cannot also carry a vertical
    luminance gradient - the two demands are geometrically opposed, and
    match_edges() deliberately flattens top-to-bottom to get the seam. For a
    wide hero band, horizontal wrap (left<->right) is what actually matters, so
    the lighting wins and the vertical seam is allowed to relax to a few
    luminance units. Direction is forced (top brighter) rather than inferred:
    inferring it from edge strips reads the photo's bright bottom rim as 'light
    from below' and hands you an upside-down grade.
    """
    a = np.asarray(a, dtype=np.float64)
    h = a.shape[0]
    sl = max(1, h // 5)
    top = float((a[:sl] @ LUMA).mean())
    bottom = float((a[-sl:] @ LUMA).mean())
    current = top - bottom  # signed; negative == bottom currently brighter
    half = (target_spread - current) / 2.0  # ramp amplitude, top +half / bottom -half
    cap = max(2.0, target_spread / 2.0)
    capped = float(np.clip(half, -cap, cap))
    ramp = np.linspace(capped, -capped, h, dtype=np.float64)[:, None, None]
    tint = np.array([1.004, 1.0, 0.996], dtype=np.float64)[None, None, :]
    out = a + ramp * tint
    ntop = float((out[:sl] @ LUMA).mean())
    nbot = float((out[-sl:] @ LUMA).mean())
    note(
        "light: forced top-down ramp (top {:.1f} ->{:.1f}, bottom {:.1f} ->{:.1f}); "
        "spread {} ->{} lum, amplitude {} lum{}".format(
            top, ntop, bottom, nbot, round(current, 1), round(ntop - nbot, 1),
            round(capped, 2), " (CAPPED, would have needed {:.2f})".format(half) if abs(half) > cap + 0.01 else "",
        )
    )
    return out


def match_edges(a, lowpass_sigma_frac, note):
    """Make opposite edges wrap by subtracting a smooth 0->1 ramp that follows
    the low-passed difference profile of the two edges.

    For the vertical seam: let p(y) = a(w-1,y) - a(0,y). Subtracting
    s(x)*p(y), s(0)=0 and s(w-1)=1, leaves the two edge columns equal by
    construction. The correction is purely additive and low-frequency, so it
    cannot smooth, shift or mirror the fibre tooth - it only nudges local tone.
    """
    a = np.asarray(a, dtype=np.float64)
    h, w, _ = a.shape
    d = max(2, min(h, w) // 60)
    before = edge_mismatch(a)
    mean_in = a.reshape(-1, 3).mean(0)

    # vertical seam (left/right differ along y)
    left = a[:, :d].mean(1)          # (h,3)
    right = a[:, -d:].mean(1)        # (h,3)
    p = smooth_1d(right - left, max(2.0, h * lowpass_sigma_frac))
    s = np.linspace(0.0, 1.0, w, dtype=np.float64)[None, :, None]
    a = a - s * p[:, None, :]

    # horizontal seam (top/bottom differ along x), recomputed on the result
    top = a[:d].mean(0)              # (w,3)
    bottom = a[-d:].mean(0)
    q = smooth_1d(bottom - top, max(2.0, w * lowpass_sigma_frac))
    t = np.linspace(0.0, 1.0, h, dtype=np.float64)[:, None, None]
    a = a - t * q[None, :, :]

    # the two ramps also drag the global tone slightly; restore the input mean
    mean_out = a.reshape(-1, 3).mean(0)
    a = a + (mean_in - mean_out)[None, None, :]
    after = edge_mismatch(a)
    note(
        "edges: wrap mismatch L1  lr {} ->{}  tb {} ->{}  (low-pass sigma {:.0f}px; "
        "mean {} ->{} after tone restore)".format(
            before["lr_l1"], after["lr_l1"], before["tb_l1"], after["tb_l1"],
            h * lowpass_sigma_frac,
            "#{:02x}{:02x}{:02x}".format(*[int(round(v)) for v in mean_in]),
            "#{:02x}{:02x}{:02x}".format(*[int(round(v)) for v in a.reshape(-1, 3).mean(0)]),
        )
    )
    return a, before, after


def resize_periodic(a, ow, oh):
    """Lanczos resize that does not create a border artefact: pad by wrapping
    (so the filter sees the image's own opposite edges), resize, crop back."""
    h, w, _ = a.shape
    pad = 4
    wrapped = np.concatenate(
        [a[-pad:], a, a[:pad]], axis=0
    )
    wrapped = np.concatenate([wrapped[:, -pad:], wrapped, wrapped[:, :pad]], axis=1)
    im = Image.fromarray(to_u8(wrapped), "RGB").resize(
        (int(round((w + 2 * pad) * ow / w)), int(round((h + 2 * pad) * oh / h))), Image.LANCZOS
    )
    b = np.asarray(im, dtype=np.float64)
    sx, sy = pad * ow / w, pad * oh / h
    b = b[int(round(sy)) : int(round(sy)) + oh, int(round(sx)) : int(round(sx)) + ow]
    if b.shape[0] != oh or b.shape[1] != ow:  # rounding guard
        b = np.asarray(Image.fromarray(to_u8(b), "RGB").resize((ow, oh), Image.LANCZOS), np.float64)
    return b


def restore_tooth(a, percent, radius, note, ref_lap):
    """A light unsharp mask (threshold 2) brings back micro-contrast the resize
    took. Capped so it never reaches 'heavy' territory."""
    before = float(stats(a)["tooth_lap_mean"])
    # Pillow 12 requires integer radius/percent/threshold for UnsharpMask.
    img = Image.fromarray(to_u8(a), "RGB").filter(
        ImageFilter.UnsharpMask(
            radius=int(round(radius)), percent=int(min(percent, 60)), threshold=2
        )
    )
    out = np.asarray(img, dtype=np.float64)
    after = stats(out)
    note(
        "tooth: laplacian {} ->{} (ref cropped-source {}), unsharp radius={} percent={} threshold=2".format(
            round(before, 2), after["tooth_lap_mean"], ref_lap, radius, min(percent, 60)
        )
    )
    return out


def encode_under_budget(img, fmt, budget_bytes, label, note):
    tried = []
    for kw in LADDER[fmt]:
        buf = io.BytesIO()
        img.save(buf, fmt, **kw)
        data = buf.getvalue()
        tried.append({"settings": {k: v for k, v in kw.items()}, "bytes": len(data)})
        if budget_bytes is None or len(data) <= budget_bytes:
            note(f"{label}: {len(data)} bytes at {fmt} {kw} (after {len(tried)} attempt(s))")
            return data, kw, tried, False
    last = LADDER[fmt][-1]
    buf = io.BytesIO()
    img.save(buf, fmt, **last)
    data = buf.getvalue()
    note(
        f"{label}: OVER BUDGET - {len(data)} bytes at {fmt} {last}; "
        f"budget {budget_bytes} not met even at the ladder floor"
    )
    return data, dict(last, over_budget=True), tried, True


# ------------------------------------------------------------------- modes


def do_process(args, note):
    src_path = args.source
    if not os.path.isfile(src_path):
        return {"ok": False, "error": f"source not found: {src_path}"}, 2
    try:
        im = Image.open(src_path)
        im.load()
    except Exception as err:
        return {"ok": False, "error": f"cannot decode source {src_path}: {err}"}, 2

    fmt_used = im.format
    if im.mode not in ("RGB",):
        note(f"source mode {im.mode} -> RGB")
    src = np.asarray(im.convert("RGB"), dtype=np.float64)
    H, W, _ = src.shape
    note(f"source {src_path}: {W}x{H} decoded as {fmt_used}")

    back = backdrop_colour(src)
    det, scan, dist = detect_paper(src, back, (6, 10, 14, 18, 22, 26, 32, 40), note)
    if det is None:
        return {
            "ok": False,
            "error": (
                "no paper region detected against backdrop #{:02x}{:02x}{:02x}: every threshold "
                "found an empty inscribed box, so the sheet does not contrast the surround "
                "(or the frame is all one colour)".format(*[int(v) for v in back])
            ),
            "threshold_scan": scan,
        }, 3

    raw_box = det["box"]
    safe = inset_box(raw_box, W, H, args.inset)
    if safe[2] - safe[0] < 32 or safe[3] - safe[1] < 32:
        return {"ok": False, "error": f"safe box degenerate after {args.inset:.0%} inset: {safe}"}, 4
    band = pick_band(safe, args.aspect)
    crop = src[band[1] : band[3], band[0] : band[2]]
    crop_dist = dist[band[1] : band[3], band[0] : band[2]]
    note(
        "detect: backdrop #{:02x}{:02x}{:02x} (R-B {:.1f}) box {} = {:.1f}% of frame; "
        "safe box (inset {:.0f}%) {}".format(
            *[int(v) for v in back], float(back[0] - back[2]), raw_box,
            det["area"] / (W * H) * 100, args.inset * 100, safe,
        )
    )
    note(f"crop: band {band} -> {crop.shape[1]}x{crop.shape[0]} at AR {args.aspect:.3f}")

    crop_stats = stats(crop)
    ref_teeth = crop_stats["tooth_lap_mean"]

    # Gate 1: the crop must already be paper only - no surround, no deckle edge.
    crop_ok, crop_audit, crop_problems = verify_pure_paper(
        crop, crop_dist, det["core_median_dist"], note, check_backdrop=True, subject="crop"
    )
    if not crop_ok:
        # Refuse to write: a tile carrying grey surround or a torn edge is off
        # theme, so an output file like that is worse than no output file.
        return {
            "ok": False,
            "error": "cropped region is not pure paper: " + "; ".join(crop_problems),
            "hint": ("the deckle edge or backdrop survived the crop - raise --inset (try "
                     "{:.2f}) or lower --aspect, or pass a photo where the sheet fills the frame"
                     ).format(min(0.20, args.inset * 2)),
            "source": os.path.abspath(src_path),
            "decoded_format": fmt_used,
            "source_dims": f"{W}x{H}",
            "backdrop_hex": "#{:02x}{:02x}{:02x}".format(*[int(v) for v in back]),
            "raw_box": list(raw_box),
            "safe_box": list(safe),
            "band": list(band),
            "band_dims": f"{crop.shape[1]}x{crop.shape[0]}",
            "crop_stats": crop_stats,
            "crop_audit": crop_audit,
            "threshold_scan": scan,
            "written": [],
            "notes": collected_of(note),
        }, 5

    work = grade(crop, TARGET_LOW, TARGET_HIGH, note)
    # match edge TONE first, then lay the light on top: equalising opposite
    # edges is by construction a top/bottom flattener, so doing the falloff
    # before it silently erases the gradient. --flat-tile skips the falloff.
    work, seam_before, seam_after = match_edges(work, args.lowpass_frac, note)
    work = grade(work, TARGET_LOW, TARGET_HIGH, note)  # re-assert mean after ramps
    if args.flat_tile:
        note("light: --flat-tile -> texture kept perfectly level, vertical seam stays tight")
    else:
        work = apply_light(work, args.falloff_lum, note)

    budget = int(args.budget_kb * 1024)
    written, per_size = [], []
    budget_problems = []
    width_list = sorted({int(x) for x in args.widths.split(",")})
    smallest_width = min(width_list)
    for long_edge in sorted(width_list, reverse=True):
        if args.aspect >= 1:
            ow, oh = long_edge, max(1, int(round(long_edge / args.aspect)))
        else:
            oh, ow = long_edge, max(1, int(round(long_edge * args.aspect)))
        scale = ow / crop.shape[1]
        note(f"render {long_edge}: {ow}x{oh} (scale x{scale:.3f} of the cropped band)")
        tile = resize_periodic(work, ow, oh)
        if scale < 1.0:
            tile = restore_tooth(tile, args.sharpen, radius=1.0, note=note, ref_lap=ref_teeth)
        else:
            tile = restore_tooth(tile, args.sharpen, radius=1.6, note=note, ref_lap=ref_teeth)
            note(f"render {long_edge}: UPSCALED x{scale:.2f} - fibre tooth {ref_teeth} (source) vs {stats(tile)['tooth_lap_mean']} here")

        pre_resize_teeth = stats(tile)["tooth_lap_mean"]
        final_stats = stats(tile)
        # Gate 2: colour + budget, measured on the pixels that are actually
        # shipping. (backdrop-distance is checked on the crop in gate 1)
        tile_ok, tile_audit, tile_problems = verify_pure_paper(
            tile, None, 0.0, note, check_backdrop=False, subject=f"tile {ow}x{oh}"
        )
        if not tile_ok:
            raise SystemExit(
                json.dumps({"ok": False, "error": f"output tile {ow}x{oh} failed the colour audit",
                            "problems": tile_problems, "measured": final_stats})
            )
        seam_final = edge_mismatch(tile)
        plan = []
        for fmt, ext in (("AVIF", "avif"), ("WEBP", "webp")):
            img = Image.fromarray(to_u8(tile), "RGB")
            data, kw, tried, over = encode_under_budget(img, fmt, budget, f"{long_edge}{ext}", note)
            path = os.path.join(args.out_dir, f"{args.prefix}-{long_edge}.{ext}")
            os.makedirs(args.out_dir, exist_ok=True)
            with open(path, "wb") as fh:
                fh.write(data)
            written.append({"path": path, "bytes": len(data)})
            plan.append({"format": fmt, "ext": ext, "path": path, "bytes": len(data),
                         "settings": kw, "tried": tried, "over_budget": over})
            if over:
                plan[-1]["budget_bytes"] = budget
        # JPEG fallback: ONE file only, on the smallest width (the brief asks for
        # stage-720.jpg). AVIF/WebP carry the byte budget; JPEG is exempt but
        # still walks the ladder so it cannot come out absurdly heavy.
        if long_edge == smallest_width:
            img = Image.fromarray(to_u8(tile), "RGB")
            data, kw, tried, over = encode_under_budget(
                img, "JPEG", None, f"{long_edge}jpg", note
            )
            path = os.path.join(args.out_dir, f"{args.prefix}-{long_edge}.jpg")
            with open(path, "wb") as fh:
                fh.write(data)
            written.append({"path": path, "bytes": len(data)})
            plan.append({"format": "JPEG", "ext": "jpg", "path": path, "bytes": len(data),
                         "settings": kw, "tried": tried, "over_budget": False,
                         "budget_exempt": True})

        per_size.append({
            "long_edge": long_edge,
            "dims": f"{ow}x{oh}",
            "upscale_factor": round(scale, 3),
            "final_stats": final_stats,
            "seam_before": seam_before,
            "seam_after_tile": seam_final,
            "tooth": {"cropped_source": ref_teeth, "on_tile": pre_resize_teeth,
                      "final": final_stats["tooth_lap_mean"]},
            "encodes": plan,
            "colour_audit": tile_audit,
        })
        for enc in plan:
            if enc.get("over_budget"):
                budget_problems.append(
                    f"{os.path.basename(enc['path'])}: {enc['bytes']} bytes > {budget} budget "
                    f"even at the floor of the quality ladder"
                )

    ok = not budget_problems
    return {
        "ok": ok,
        "budget_problems": budget_problems,
        "source": os.path.abspath(src_path),
        "decoded_format": fmt_used,
        "source_dims": f"{W}x{H}",
        "backdrop_hex": "#{:02x}{:02x}{:02x}".format(*[int(v) for v in back]),
        "raw_box": list(raw_box),
        "raw_box_pct_frame": round(det["area"] / (W * H) * 100, 1),
        "safe_box": list(safe),
        "band": list(band),
        "band_dims": f"{crop.shape[1]}x{crop.shape[0]}",
        "inset": args.inset,
        "aspect": round(args.aspect, 3),
        "crop_stats": crop_stats,
        "crop_audit": crop_audit,
        "crop_audit_problems": crop_problems,
        "threshold_scan": scan,
        "per_size": per_size,
        "written": written,
        "targets": {
            "low": "#{:02x}{:02x}{:02x}".format(*TARGET_LOW),
            "high": "#{:02x}{:02x}{:02x}".format(*TARGET_HIGH),
            "min_warmth": MIN_WARMTH,
            "budget_bytes": budget,
        },
        "notes": collected_of(note),
    }, 0 if ok else 6


def do_verify(args, note):
    rows = []
    for p in args.files:
        row = {"path": p, "exists": os.path.isfile(p)}
        if not row["exists"]:
            row["error"] = "missing"
            rows.append(row)
            continue
        row["bytes"] = os.path.getsize(p)
        try:
            im = Image.open(p)
            im.load()
            a = np.asarray(im.convert("RGB"), dtype=np.float64)
            row["format"] = im.format
            row["dims"] = f"{a.shape[1]}x{a.shape[0]}"
            row["long_edge"] = max(a.shape[0], a.shape[1])
            row.update({k: v for k, v in stats(a).items() if k not in ("min", "max")})
        except Exception as err:
            row["error"] = f"decode failed: {err}"
        rows.append(row)
    return {"ok": True, "mode": "verify", "rows": rows}, 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=("process", "verify"), default="process")
    ap.add_argument("--source")
    ap.add_argument("--out-dir", default="public/hero")
    ap.add_argument("--prefix", default="stage")
    ap.add_argument("--widths", default="1280,720")
    ap.add_argument("--aspect", type=float, default=4.0 / 3.0)
    ap.add_argument("--inset", type=float, default=0.05)
    ap.add_argument("--budget-kb", type=float, default=60.0)
    ap.add_argument("--falloff-lum", type=float, default=6.0)
    ap.add_argument("--lowpass-frac", type=float, default=0.05)
    ap.add_argument("--sharpen", type=float, default=32.0)
    ap.add_argument(
        "--flat-tile",
        action="store_true",
        help="no lighting gradient: tighter wrap at the cost of a flatter, less real-paper look",
    )
    ap.add_argument("--no-grade", action="store_true")
    ap.add_argument("--files", nargs="*", default=[])
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    collected = []

    def note(msg):
        collected.append(msg)
        if not args.quiet:
            print(msg, file=sys.stderr, flush=True)

    note.lines = collected
    if args.mode == "verify":
        result, code = do_verify(args, note)
    else:
        if not args.source:
            result, code = {"ok": False, "error": "--source is required for --mode=process"}, 2
        else:
            result, code = do_process(args, note)
    print(json.dumps(result))
    return code


if __name__ == "__main__":
    sys.exit(main())
