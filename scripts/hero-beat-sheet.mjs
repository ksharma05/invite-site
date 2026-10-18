/**
 * Hero beat sheet — screenshot the hero at a grid of animation times and stitch
 * one labelled contact sheet so a human can review the whole shot at a glance.
 *
 *   node scripts/hero-beat-sheet.mjs
 *   node scripts/hero-beat-sheet.mjs --times=0,0.05,0.33,1.5 --cols=4
 *   node scripts/hero-beat-sheet.mjs --url="file:///C:/tmp/hero.html" --selector="#hero-stage"
 *
 * Defaults follow the other section-1 helpers (scripts/section1-capture.cjs,
 * scripts/section1-hero-probe.cjs): same pinned chromium executablePath, the
 * same http://localhost:3000/?side=bride&lang=en target, and output into
 * visual-check/. 86 beats at 0.1s = the full 8.6s stop-motion assembly.
 *
 * Time seeding, in order of preference (all three are tried every beat):
 *   1. window.__heroSeek(t)  - an explicit seek hook, if the hero exposes one
 *   2. Web Animations API    - pause + set currentTime on document.getAnimations()
 *   3. --hero-time custom property, for CSS-driven timelines
 * If none of them exist the script says so loudly instead of quietly emitting
 * 86 identical frames and calling it a review sheet; --require-seek makes that
 * a hard failure.
 *
 * Writes NOTHING unless a full sheet can be produced: an unreachable server, a
 * missing hero element or a failed capture exits non-zero with a plain message
 * and no half-built image. The stitch itself is scripts/stitch_beat_sheet.py.
 */

import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import https from "node:https";

const require = createRequire(import.meta.url);

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

// --- conventions copied from scripts/section1-capture.cjs / -hero-probe.cjs --
const EXE = "C:/Users/singh/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const DEFAULT_URL = "http://localhost:3000/?side=bride&lang=en";
const PRIMARY_SELECTOR = "#hero-stage";
const FALLBACK_SELECTOR = 'section[aria-labelledby="hero-heading"]';
const OUT = join(ROOT, "visual-check", "hero-beat-sheet.png");
const STITCHER = join(HERE, "stitch_beat_sheet.py");

// 86-beat grid at 0.1s intervals over 8.6s.
const DEFAULT_BEATS = 86;
const DEFAULT_STEP = 0.1;

/** Exit non-zero with a plain message and never a partial deliverable. */
function die(message, code = 1) {
  console.error(`\nHERO-BEAT-SHEET FAILED\n${message}`);
  process.exitCode = code;
}

function parseArgs(argv) {
  const opts = {
    url: DEFAULT_URL,
    selector: null,
    useFallback: true,
    times: null,
    beats: DEFAULT_BEATS,
    step: DEFAULT_STEP,
    width: 1280,
    height: 900,
    out: OUT,
    cols: 0,
    cellW: 420,
    requireSeek: false,
    leaveFrames: false,
  };
  const flags = new Set(["--require-seek", "--leave-frames", "--no-fallback", "--help"]);
  for (const arg of argv) {
    const eq = arg.indexOf("=");
    const key = eq === -1 ? arg : arg.slice(0, eq);
    const val = eq === -1 ? true : arg.slice(eq + 1);
    if (!arg.startsWith("--")) {
      if (opts.selector === null) opts.selector = arg;
      continue;
    }
    switch (key) {
      case "--url": opts.url = String(val); break;
      case "--selector": opts.selector = String(val); break;
      case "--times":
        opts.times = String(val)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => Number(s));
        break;
      case "--beats": opts.beats = Number(val); break;
      case "--step": opts.step = Number(val); break;
      case "--width": opts.width = Number(val); break;
      case "--height": opts.height = Number(val); break;
      case "--out": opts.out = resolve(String(val)); break;
      case "--cols": opts.cols = Number(val); break;
      case "--cell-w": opts.cellW = Number(val); break;
      case "--no-fallback": opts.useFallback = false; break;
      case "--require-seek": opts.requireSeek = true; break;
      case "--leave-frames": opts.leaveFrames = true; break;
      case "--help": return { help: true, opts };
      default:
        if (!flags.has(key)) console.error(`(ignoring unknown flag ${key})`);
    }
  }
  return { help: false, opts };
}

/** GET the target with a short timeout; resolve true/false, never throw. */
function reachable(url, timeoutMs = 3000) {
  return new Promise((done) => {
    let settled = false;
    const finish = (v) => {
      if (!settled) {
        settled = true;
        done(v);
      }
    };
    let mod;
    try {
      const u = new URL(url);
      mod = u.protocol === "https:" ? https : http;
      if (u.protocol !== "http:" && u.protocol !== "https:") return finish(true); // file: etc.
    } catch {
      return finish(false);
    }
    const req = mod.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      finish(res.statusCode < 500);
    });
    req.on("timeout", () => {
      req.destroy();
      finish(false);
    });
    req.on("error", () => finish(false));
  });
}

function findPython() {
  for (const candidate of ["python", "python3", "py"]) {
    const probe = spawnSync(candidate, ["-c", "import PIL"], { encoding: "utf8", windowsHide: true });
    if (probe.status === 0) return candidate;
  }
  return null;
}

function timeGrid(opts) {
  if (opts.times && opts.times.length) {
    const bad = opts.times.filter((t) => !Number.isFinite(t) || t < 0);
    if (bad.length) throw new Error(`--times contains invalid value(s): ${bad.join(", ")}`);
    return opts.times;
  }
  if (!Number.isInteger(opts.beats) || opts.beats < 1) throw new Error(`--beats must be a positive integer, got ${opts.beats}`);
  if (!(opts.step > 0)) throw new Error(`--step must be > 0, got ${opts.step}`);
  // 0.0, 0.1, ... over the full duration; last beat lands just short of the end.
  return Array.from({ length: opts.beats }, (_, i) => Number((i * opts.step).toFixed(4)));
}

/** Ask the page which seeding mechanism actually exists. */
async function seedAt(page, t) {
  return page.evaluate((time) => {
    const info = { seekHook: false, wapi: 0, cssVar: false };
    if (typeof window.__heroSeek === "function") {
      try {
        window.__heroSeek(time);
        info.seekHook = true;
      } catch (err) {
        info.seekError = String(err && err.message ? err.message : err);
      }
    }
    if (document.getAnimations) {
      const anims = document.getAnimations();
      for (const a of anims) {
        try {
          a.pause();
          a.currentTime = time * 1000;
          info.wapi += 1;
        } catch {
          /* CSS transitions reject currentTime; ignore */
        }
      }
    }
    const root = document.documentElement;
    root.style.setProperty("--hero-time", `${time}s`);
    info.cssVar = root.style.getPropertyValue("--hero-time") === `${time}s`;
    // give the compositor one frame to settle before the screenshot
    return new Promise((r) => requestAnimationFrame(() => r(info)));
  }, t);
}

async function main() {
  const { help, opts } = parseArgs(process.argv.slice(2));
  if (help) {
    console.log(
      [
        "usage: node scripts/hero-beat-sheet.mjs [options]",
        "",
        `  --url=<url>          target page (default ${DEFAULT_URL}; file: URLs allowed)`,
        `  --selector=<css>     hero element (default ${PRIMARY_SELECTOR})`,
        "  --no-fallback        do not retry with the <section> fallback selector",
        "  --times=0.1,0.2,...  explicit beat times in seconds",
        `  --beats=<n> --step=<s>  grid when --times is absent (default ${DEFAULT_BEATS} x ${DEFAULT_STEP}s)`,
        "  --width=<px> --height=<px>  viewport (default 1280x900)",
        `  --out=<path>         sheet path (default visual-check/hero-beat-sheet.png)`,
        "  --cols=<n> --cell-w=<px>   sheet layout",
        "  --require-seek       fail instead of warning when no seek mechanism exists",
        "  --leave-frames       keep the per-beat PNGs for debugging",
      ].join("\n")
    );
    return 0;
  }

  let times;
  try {
    times = timeGrid(opts);
  } catch (err) {
    return die(err.message);
  }

  // --- target must exist before we do anything with side effects ------------
  if (/^file:/i.test(opts.url)) {
    let path;
    try {
      path = new URL(opts.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
    } catch {
      path = opts.url.replace(/^file:\/*\/?/, "");
    }
    if (!existsSync(resolve(path))) {
      return die(`target file not found:\n  ${opts.url}\n  (resolved to ${resolve(path)})`);
    }
  } else {
    const ok = await reachable(opts.url);
    if (!ok) {
      let port = "3000";
      try {
        port = new URL(opts.url).port || "3000";
      } catch {
        /* leave default */
      }
      return die(
        `no dev server answering at ${opts.url}.\n` +
          `  Start it first:  npm run dev     (then re-run this script)\n` +
          `  Nothing was written - a beat sheet needs real frames to be worth looking at.\n` +
          `  If it is up on another port:  node scripts/hero-beat-sheet.mjs --url="http://localhost:<port>/?side=bride&lang=en"`
      );
    }
  }

  if (existsSync(EXE) !== true) {
    return die(
      `pinned chromium not found:\n  ${EXE}\n` +
        `  (the section-1 helpers use this same path; install Playwright browsers with "npx playwright install chromium")`
    );
  }
  const py = findPython();
  if (!py) return die(`no Python with Pillow found (tried python, python3, py) - needed to stitch the sheet`);
  if (!existsSync(STITCHER)) return die(`missing stitch helper: ${STITCHER}`);

  let { chromium } = require("playwright");
  let browser;
  let frameDir;
  const frames = [];
  let selector = opts.selector || PRIMARY_SELECTOR;

  try {
    browser = await chromium.launch({ executablePath: EXE });
    // no-preference: we are reviewing motion, so the reduced-motion path must not
    // freeze the assembly into its final state.
    const context = await browser.newContext({
      viewport: { width: opts.width, height: opts.height },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await page.goto(opts.url, { waitUntil: "networkidle" });

    // --- locate the hero: primary, then documented fallback ----------------
    let hero = page.locator(selector);
    let count = await hero.count();
    if (count === 0 && opts.useFallback && !(opts.selector && opts.selector !== PRIMARY_SELECTOR)) {
      console.log(`  ${selector} not present yet - falling back to ${FALLBACK_SELECTOR}`);
      selector = FALLBACK_SELECTOR;
      hero = page.locator(selector);
      count = await hero.count();
    }
    await hero.scrollIntoViewIfNeeded().catch(() => {});
    if (count === 0) {
      return die(
        `no element matched the hero selector, so there is nothing to photograph.\n` +
          `  tried: ${selector}\n` +
          (opts.useFallback ? "" : "  (fallback disabled with --no-fallback)\n") +
          `  The stop-motion hero may not be wired up yet - ${PRIMARY_SELECTOR} is the agreed id.\n` +
          `  Nothing was written.`
      );
    }
    if (count > 1) console.log(`  note: ${count} elements match "${selector}" - using the first`);

    // --- probe seeding once, before the expensive loop ---------------------
    const probe = await seedAt(page, times[0]);
    const seeded = probe.seekHook || probe.wapi > 0 || probe.cssVar;
    if (!seeded) {
      console.log(
        "  WARNING: no seek mechanism found (no window.__heroSeek, no running animations).\n" +
          "           Every beat will be the SAME frame. The hero animation is probably not\n" +
          "           implemented yet, so this sheet can only review layout, not timing."
      );
    } else {
      console.log(
        `  seek: __heroSeek=${probe.seekHook ? "yes" : "no"} ` +
          `animations=${probe.wapi} cssVar=${probe.cssVar ? "yes" : "no"}`
      );
    }
    if (opts.requireSeek && !seeded) {
      return die("--require-seek set but the page offers no way to scrub time. Nothing was written.");
    }

    frameDir = mkdtempSync(join(tmpdir(), "hero-beat-"));
    const box = await hero.boundingBox();
    console.log(
      `\ncapturing ${times.length} beat(s) of "${selector}"` +
        (box ? `  [${Math.round(box.width)}x${Math.round(box.height)}px]` : "") +
        ` over ${times[times.length - 1].toFixed(2)}s`
    );
    for (let i = 0; i < times.length; i++) {
      const t = times[i];
      const info = await seedAt(page, t);
      if (info.seekError) throw new Error(`__heroSeek(${t}) threw: ${info.seekError}`);
      const path = join(frameDir, `beat-${String(i).padStart(3, "0")}.png`);
      await hero.screenshot({ path });
      frames.push({
        path,
        label: `beat ${i + 1}/${times.length}  t=${t.toFixed(2)}s`,
        sub: `anim ${info.wapi}${info.seekHook ? " +seek" : ""}`,
      });
      if ((i + 1) % 12 === 0 || i === times.length - 1) console.log(`  ... ${i + 1}/${times.length}`);
    }
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    if (browser) await browser.close().catch(() => {});
    if (frameDir) rmSync(frameDir, { recursive: true, force: true });
    return die(`capture aborted: ${message}\n  Nothing was written.`);
  }

  try {
    if (browser) await browser.close().catch(() => {});

    // --- stitch ------------------------------------------------------------
  const manifestPath = join(frameDir, "manifest.json");
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        title: `Hero beat sheet  ${frames.length} beats / ${times[times.length - 1].toFixed(1)}s`,
        meta: `${opts.url}   selector: ${selector}   viewport ${opts.width}x${opts.height}   reduced-motion: no-preference`,
        cell_w: opts.cellW,
        cols: opts.cols,
        frames,
      },
      null,
      2
    ),
    "utf8"
  );

  const stitch = spawnSync(py, [STITCHER, "--manifest", manifestPath, "--out", opts.out], {
    encoding: "utf8",
    cwd: ROOT,
    windowsHide: true,
  });
  if (stitch.stderr) process.stderr.write(stitch.stderr);
  let sheet = null;
  try {
    const out = (stitch.stdout || "").trim();
    sheet = JSON.parse(out.slice(out.lastIndexOf("{"), out.lastIndexOf("}") + 1));
  } catch {
    /* handled below */
  }
  if (stitch.status !== 0 || !sheet || !sheet.ok) {
    if (!opts.leaveFrames && frameDir) rmSync(frameDir, { recursive: true, force: true });
    return die(
      `stitching failed (exit ${stitch.status}): ${(sheet && sheet.error) || stitch.stdout || stitch.stderr || "no output"}\n` +
        `  ${frames.length} frames were captured but no sheet was written.`
    );
  }

  console.log(`\n${"beat sheet".padEnd(22)} ${sheet.dims}  ${sheet.bytes.toLocaleString("en-US")} B`);
  console.log(`${"frames".padEnd(22)} ${sheet.frames} (${sheet.rows} rows x ${sheet.cols} cols) -> ${sheet.out}`);
  const sizes = frames.map((f) => (existsSync(f.path) ? statSync(f.path).size : NaN)).filter(Number.isFinite);
  if (sizes.length) {
    const uniq = new Set(sizes);
    console.log(`${"frame bytes".padEnd(22)} min ${Math.min(...sizes).toLocaleString("en-US")} max ${Math.max(...sizes).toLocaleString("en-US")}`);
    if (uniq.size === 1 && sizes.length > 1) {
      console.log(
        "  NOTE: every frame is byte-identical - the animation did not advance between\n" +
          "        beats. Check the seek hook; this sheet shows the final state only."
      );
    }
  }
  if (!opts.leaveFrames) {
    rmSync(frameDir, { recursive: true, force: true });
  } else {
    console.log(`${"frames kept".padEnd(22)} ${frameDir}`);
  }
    console.log(`\nOK - reviewed sheet at ${resolve(opts.out)}`);
    return 0;
  } finally {
    // The per-beat PNGs are scratch; only --leave-frames keeps them.
    if (frameDir && !opts.leaveFrames) rmSync(frameDir, { recursive: true, force: true });
  }
}

main()
  .then((code) => {
    if (code) process.exitCode = code;
  })
  .catch((err) => {
    console.error(`\nHERO-BEAT-SHEET FAILED\nunexpected error: ${err && err.stack ? err.stack : err}`);
    process.exitCode = 1;
  });
