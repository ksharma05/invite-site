"""Contact-sheet stitcher for scripts/hero-beat-sheet.mjs.

Takes a manifest of frame PNGs (plus labels) and lays them out in a readable,
grid-aligned sheet with one caption per cell, so a human can review a whole
animation in a single image. Called from Node; not meant to be run by hand.

stdout carries one JSON object; progress/diagnostics go to stderr.
"""

import argparse
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

# Terracotta/cream theme, so the review sheet reads like the site itself.
BG = (251, 244, 236)  # --color-surface
INK = (74, 59, 47)  # readable warm dark
GOLD = (138, 106, 29)  # --color-gold-deep
RULE = (217, 182, 140)  # --color-border
LABEL_H = 26
GUTTER = 10
HEADER_H = 46


def pick_font(size):
    for path in (
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/verdana.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # older Pillow takes no size
        return ImageFont.load_default()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", required=True, help="JSON file: {title, cell_w, cols, frames:[{path,label,sub}]}")
    ap.add_argument("--out", required=True)
    ap.add_argument("--cell-w", type=int, default=420)
    ap.add_argument("--cols", type=int, default=0, help="0 = choose automatically")
    args = ap.parse_args()

    with open(args.manifest, "r", encoding="utf-8") as fh:
        spec = json.load(fh)

    frames = [f for f in spec.get("frames", []) if f.get("path") and os.path.isfile(f["path"])]
    if not frames:
        print(json.dumps({"ok": False, "error": "manifest listed no readable frames"}))
        return 1

    cell_w = int(spec.get("cell_w") or args.cell_w)
    # scale each tile to cell_w, keeping aspect; rows are as tall as their tallest tile
    tiles = []
    for f in frames:
        im = Image.open(f["path"])
        im.load()
        im = im.convert("RGB")
        w, h = im.size
        tw = cell_w
        th = max(1, int(round(h * cell_w / w)))
        tiles.append((im.resize((tw, th), Image.LANCZOS), f))

    n = len(tiles)
    cols = args.cols or (6 if n >= 24 else (4 if n >= 12 else min(n, 3)))
    cols = max(1, min(cols, n))
    rows = (n + cols - 1) // cols

    cell_h = max(t.size[1] for t, _ in tiles) + LABEL_H
    width = cols * cell_w + (cols + 1) * GUTTER
    height = HEADER_H + rows * cell_h + (rows + 1) * GUTTER

    sheet = Image.new("RGB", (width, height), BG)
    d = ImageDraw.Draw(sheet)
    title_font = pick_font(20)
    label_font = pick_font(14)
    small_font = pick_font(12)

    title = spec.get("title", "hero beat sheet")
    d.text((GUTTER + 4, 12), title, font=title_font, fill=INK)
    meta = spec.get("meta") or ""
    if meta:
        d.text((GUTTER + 4, 30), meta, font=small_font, fill=GOLD)
    d.line([(0, HEADER_H - 1), (width, HEADER_H - 1)], fill=GOLD, width=2)

    for idx, (tile, f) in enumerate(tiles):
        r, c = divmod(idx, cols)
        x = GUTTER + c * (cell_w + GUTTER)
        y = HEADER_H + GUTTER + r * (cell_h + GUTTER)
        d.text((x + 2, y + 4), f.get("label", ""), font=label_font, fill=INK)
        sub = f.get("sub")
        if sub:
            d.text((x + cell_w - 118, y + 6), sub, font=small_font, fill=GOLD)
        ty = y + LABEL_H
        sheet.paste(tile, (x, ty))
        d.rectangle([x, ty, x + tile.size[0] - 1, ty + tile.size[1] - 1], outline=RULE, width=1)

    os.makedirs(os.path.dirname(os.path.abspath(args.out)) or ".", exist_ok=True)
    sheet.save(args.out, "PNG", optimize=True)
    size = os.path.getsize(args.out)
    print(
        json.dumps(
            {
                "ok": True,
                "out": os.path.abspath(args.out),
                "dims": f"{sheet.size[0]}x{sheet.size[1]}",
                "bytes": size,
                "frames": n,
                "cols": cols,
                "rows": rows,
                "dropped": len(spec.get("frames", [])) - n,
            }
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
