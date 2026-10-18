/**
 * Hero "stage" texture prep.
 *
 * Turns one photo of handmade paper into tiny, web-ready, on-theme stage
 * textures under public/hero/. Detection, cropping, grading, edge matching and
 * encoding happen in scripts/stage_assets_worker.py because Pillow is the tool
 * in this repo that provably encodes AVIF *and* WebP; `sharp` here is only a
 * transitive dependency of next, not a declared one, so nothing we depend on
 * for a build artefact should assume it exists.
 *
 *   node scripts/stage-assets.mjs [sourcePath] [more worker flags...]
 *
 * Defaults to the paper photo under .abacusai/temp/. Every AVIF/WebP is held
 * to a 60 KB budget (see --budget-kb). The table printed at the end is measured
 * by decoding the files that are actually on disk, not reported by the encoder.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WORKER = join(ROOT, "scripts", "stage_assets_worker.py");
const DEFAULT_SOURCE = join(
  ROOT,
  ".abacusai",
  "temp",
  "b4b8e0b4-2d14-4c85-991e-11607cfb73bc.png"
);
const OUT_DIR = join(ROOT, "public", "hero");
const BUDGET_KB = 60;
const FORMATS = [
  { fmt: "avif", kind: "AVIF", budgeted: true },
  { fmt: "webp", kind: "WEBP", budgeted: true },
];
const FALLBACK = { fmt: "jpg", kind: "JPEG", budgeted: false };

const PY = findPython();

function findPython() {
  for (const candidate of ["python", "python3", "py"]) {
    const probe = spawnSync(candidate, ["-c", "import PIL, numpy"], {
      encoding: "utf8",
      windowsHide: true,
    });
    if (probe.status === 0) return candidate;
  }
  return null;
}

/** Run the worker and parse the single JSON document it writes to stdout. */
function runWorker(args, { echo = true } = {}) {
  const proc = spawnSync(PY, [WORKER, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    cwd: ROOT,
    windowsHide: true,
  });
  if (proc.error) {
    fail(`could not run "${PY}": ${proc.error.message}`);
  }
  if (echo && proc.stderr) process.stderr.write(proc.stderr);
  // The worker reports progress on stderr and prints exactly one compact
  // (single-line) JSON document as the last line of stdout.
  let json = null;
  const lines = (proc.stdout || "").split(/\r?\n/).filter((l) => l.trim().length);
  for (let i = lines.length - 1; i >= 0 && !json; i--) {
    const line = lines[i].trim();
    if (!line.startsWith("{")) continue;
    try {
      json = JSON.parse(line);
    } catch {
      /* not the result line; keep scanning upwards */
    }
  }
  if (!json) {
    fail(
      `worker exited ${proc.status} without a JSON result.\n--- stderr ---\n${proc.stderr || "(none)"}`
    );
  }
  return { json, status: proc.status };
}

function fail(message) {
  console.error(`\nSTAGE-ASSETS FAILED\n${message}`);
  process.exitCode = 1;
  throw exitNow();
}

function exitNow() {
  // Thrown to unwind; process.exitCode already set.
  return new Error("__exit__");
}

function bytes(n) {
  return `${n.toLocaleString("en-US")} B`;
}

function pad(value, width, right = false) {
  const s = String(value);
  return right ? s.padStart(width) : s.padEnd(width);
}

/** Compact, verifiable summary table measured from the written files. */
function printTable(rows, budgetBytes) {
  const cols = [
    ["file", 22],
    ["dims", 10],
    ["bytes", 11],
    ["mean", 9],
    ["R-B", 7],
    ["sat%", 7],
    ["grey%", 8],
    ["fmt", 6],
  ];
  const line = (ch) => cols.map(([, w]) => ch.repeat(w + 2)).join("");
  console.log("");
  console.log(line("-"));
  console.log(cols.map(([h, w]) => ` ${pad(h, w)} `).join(""));
  console.log(line("-"));
  for (const r of rows) {
    const cells = [
      pad(r.file, 22),
      pad(r.dims || "?", 10),
      pad(bytes(r.bytes), 11, true),
      pad(r.mean_hex || "?", 9),
      pad(r.warmth_rb ?? "?", 7, true),
      pad(r.saturation_pct ?? "?", 7, true),
      pad(r.neutral_grey_pct ?? "?", 8, true),
      pad(r.format || "?", 6),
    ];
    console.log(cells.map((c) => ` ${c} `).join(""));
  }
  console.log(line("-"));
  const budgetRows = rows.filter((r) => r.budgeted);
  const over = budgetRows.filter((r) => r.bytes > budgetBytes);
  const worst = Math.max(...budgetRows.map((r) => r.bytes));
  console.log(
    `budget: ${budgetBytes.toLocaleString("en-US")} B (${BUDGET_KB} KB) per AVIF/WebP -> ` +
      `${over.length === 0 ? "ALL WITHIN" : "OVER BUDGET: " + over.map((r) => r.file).join(", ")} ` +
      `(largest ${bytes(worst)}, ${((worst / budgetBytes) * 100).toFixed(1)}% of budget)`
  );
  console.log(
    "colour: warmth (mean R-B) must be >= 15 and saturation > 0 (never neutral grey); " +
      `JPEG fallback is exempt from the byte budget.`
  );
  console.log(line("-"));
  return over;
}

// --- CLI: first positional is the source; flags may be `--name=value` or
// `--name value`, so tokenize pairs properly. (A naive "starts with --" split
// would swallow values like `--aspect 1.7778` into positionals and hand the
// worker a bare flag with no argument.)
const argv = process.argv.slice(2);
const positional = [];
const flags = new Map();
for (let i = 0; i < argv.length; i++) {
  const tok = argv[i];
  if (!tok.startsWith("--")) {
    positional.push(tok);
    continue;
  }
  const eq = tok.indexOf("=");
  if (eq !== -1) {
    flags.set(tok.slice(0, eq), tok.slice(eq + 1));
    continue;
  }
  const next = argv[i + 1];
  if (next !== undefined && !next.startsWith("--")) {
    flags.set(tok, next);
    i += 1;
  } else {
    flags.set(tok, true);
  }
}
const SOURCE = positional[0] || DEFAULT_SOURCE;
if (positional.length > 1) {
  console.error(`(ignoring extra positional args: ${positional.slice(1).join(" ")})`);
}

const flagValue = (name) => {
  const v = flags.get(name);
  return v === undefined || v === true ? null : String(v);
};
const PREFIX = flagValue("--prefix") || "stage";
const WIDTHS = (flagValue("--widths") || "1280,720")
  .split(",")
  .map((w) => Number(w.trim()))
  .filter((n) => Number.isFinite(n) && n > 0);
if (!WIDTHS.length) {
  fail(`--widths produced no usable numbers (got "${flagValue("--widths")}")`);
}

// --prefix/--widths are consumed here and re-emitted explicitly; everything
// else forwards untouched, always as `--name=value` so nothing arrives bare.
const MANAGED = new Set(["--prefix", "--widths"]);
const forwardFlags = [...flags.entries()]
  .filter(([name]) => !MANAGED.has(name))
  .map(([name, value]) => (value === true ? name : `${name}=${value}`));

// --- stage 1: detect, crop, grade, encode ----------------------------------
const { json: result } = runWorker(
  [
    "--mode=process",
    "--source",
    SOURCE,
    "--out-dir",
    OUT_DIR,
    "--prefix",
    PREFIX,
    "--widths",
    WIDTHS.join(","),
    "--budget-kb",
    String(BUDGET_KB),
    ...forwardFlags,
  ],
  { echo: true }
);

if (!result.ok) {
  const hint = result.hint ? `\nhint: ${result.hint}` : "";
  fail(
    `${result.error}\nsource: ${SOURCE}\nmeasured: ${JSON.stringify(
      result.crop_audit || result.threshold_scan || {},
      null,
      2
    )}${hint}`
  );
}

console.log(
  `\ndetected paper box ${(result.raw_box || []).join(", ")} ` +
    `(${result.raw_box_pct_frame}% of frame; backdrop ${result.backdrop_hex}) ` +
    `\ncropped pure-paper band ${result.band.join(", ")} -> ${result.band_dims} at AR ${result.aspect}, ` +
    `mean ${result.crop_stats.mean_hex}, warmth R-B ${result.crop_stats.warmth_rb}, ` +
    `neutral-grey ${result.crop_audit.neutral_grey_pct}%`
);
for (const size of result.per_size || []) {
  for (const enc of size.encodes || []) {
    if (enc.budget_exempt) continue;
    const q = enc.settings?.quality;
    console.log(
      `used: ${enc.ext.padEnd(4)} ${String(size.dims).padEnd(9)} ${String(q).padStart(3)} quality ` +
        `(ladder tried ${enc.tried.length}) -> ${enc.bytes.toLocaleString("en-US")} B` +
        (enc.over_budget ? "  ** OVER BUDGET **" : "")
    );
  }
}

// --- stage 2: re-measure what is actually on disk ---------------------------
const expected = [];
for (const w of WIDTHS) {
  for (const f of FORMATS) expected.push({ file: `${PREFIX}-${w}.${f.fmt}`, budgeted: f.budgeted });
}
// one JPEG fallback only, on the smallest width
expected.push({ file: `${PREFIX}-${WIDTHS[WIDTHS.length - 1]}.${FALLBACK.fmt}`, budgeted: false });

const { json: verify } = runWorker(
  ["--mode=verify", "--quiet", "--files", ...expected.map((e) => join(OUT_DIR, e.file))],
  { echo: false }
);

const rows = [];
const missing = [];
for (let i = 0; i < expected.length; i++) {
  const spec = expected[i];
  const row = verify.rows[i] || {};
  if (!row.exists || row.error) {
    missing.push(`${spec.file}${row.error ? ` (${row.error})` : ""}`);
    continue;
  }
  rows.push({ ...spec, ...row });
}

const budgetBytes = BUDGET_KB * 1024;
console.log(`\nmeasured from disk (${rows.length}/${expected.length} files):`);
const over = printTable(rows, budgetBytes);

// per-size dims, straight from the decoded files
for (const w of WIDTHS) {
  const hit = rows.find((r) => r.file === `${PREFIX}-${w}.webp`);
  if (hit) console.log(`  ${w}: ${hit.dims} (${hit.long_edge}px long edge)`);
}

if (missing.length) {
  fail(`expected outputs were not all produced: ${missing.join(", ")}`);
}
if (over.length) {
  fail(
    `byte budget exceeded by ${over.map((r) => `${r.file} (${bytes(r.bytes)})`).join(", ")} - ` +
      "the worker's quality ladder should have gone further; re-run with --budget-kb or investigate"
  );
}
const cold = rows.filter((r) => r.budgeted && r.warmth_rb < 15);
if (cold.length) {
  fail(
    `warmth below 15 (R-B) on ${cold.map((r) => `${r.file}=${r.warmth_rb}`).join(", ")} - ` +
      "output would read as neutral grey, which is off theme"
  );
}
const greys = rows.filter((r) => r.budgeted && r.neutral_grey_pct > 1);
if (greys.length) {
  fail(`neutral grey survives in ${greys.map((r) => r.file).join(", ")}`);
}

console.log(
  `\nOK - ${expected.length} hero stage files in public/hero from ${result.decoded_format} source ` +
    `${result.source_dims}, paper mean target ${result.targets.low}..${result.targets.high}, ` +
    `all budgeted formats <= ${BUDGET_KB} KB.`
);
if ((result.per_size || []).some((s) => s.upscale_factor > 1.2)) {
  const worstSize = result.per_size.reduce((a, b) =>
    b.upscale_factor > a.upscale_factor ? b : a
  );
  console.log(
    `note: largest tile is a ${worstSize.upscale_factor}x upscale of the cropped paper - fibre ` +
      `detail will be softer than a photo where the sheet fills the frame`
  );
}
