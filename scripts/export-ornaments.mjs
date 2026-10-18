/**
 * Export the ornament artwork to standalone `.svg` files under `public/ornaments/`.
 *
 * The artwork is authored once in `src/components/ornaments/artwork/` (TS). This
 * script imports that same registry and writes real, openable `.svg` documents —
 * previewable in a browser and editable in a vector tool.
 *
 * Run:   node --experimental-strip-types scripts/export-ornaments.mjs
 * (wired as `npm run ornaments:export` in package.json)
 *
 * Each file is validated as well-formed XML before being written.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ornamentCatalogue } from "../src/components/ornaments/artwork/index.ts";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "ornaments");

/** Well-formedness check: comment-stripping tag-stack tokenizer. */
function validateXml(xml) {
  let work = xml.replace(/<!--[\s\S]*?-->/g, "");
  const stack = [];
  const tagRe = /<(\/?)([A-Za-z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^<>]*)*)(\/?)>?/g;
  let m;
  while ((m = tagRe.exec(work)) !== null) {
    const raw = m[0];
    const closing = m[1] === "/";
    const name = m[2];
    const selfClosing = closing ? false : /\/\s*>\s*$/.test(raw);
    if (closing) {
      const top = stack.pop();
      if (top !== name) {
        throw new Error(`XML mismatch: closing </${name}> but expected </${top}>`);
      }
    } else if (!selfClosing) {
      stack.push(name);
    }
  }
  if (stack.length) {
    throw new Error(`XML not closed: <${stack[stack.length - 1]}>`);
  }
}

await mkdir(outDir, { recursive: true });
console.log("Exporting ornaments →", outDir);

for (const ornament of ornamentCatalogue) {
  const { name, viewBox, defs, body } = ornament;
  const filename = `${name}.svg`;
  const doc =
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${viewBox}">` +
    (defs ? `<defs>${defs}</defs>` : "") +
    body +
    `</svg>`;

  try {
    validateXml(doc);
  } catch (err) {
    console.error(`  ✗ ${filename}: ${err.message}`);
    process.exitCode = 1;
    continue;
  }
  await writeFile(join(outDir, filename), doc, "utf8");
  console.log(`  ✓ ${filename}`);
}

console.log("Done.");
