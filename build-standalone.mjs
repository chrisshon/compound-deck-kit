#!/usr/bin/env node
// Inline a modular deck (linked CSS + external engine JS) into a single
// self-contained .html so it works offline from a double-clicked file://.
// Usage: node build-standalone.mjs <input.html> [output.html]
// The assets/ + themes/ folders remain the source library this reads from.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const input = process.argv[2];
const output = process.argv[3] || input; // default: overwrite in place
if (!input) { console.error("need an input html path"); process.exit(1); }

const baseDir = dirname(resolve(input));
let html = readFileSync(input, "utf8");

// Only operate on <head> so example code shown inside slides isn't touched.
const headEnd = html.indexOf("</head>");
if (headEnd === -1) { console.error("no </head> found"); process.exit(1); }
let head = html.slice(0, headEnd);
const rest = html.slice(headEnd);

// Stash HTML comments (incl. multi-line) so commented-out usage examples are
// never inlined, then restore them verbatim afterward.
const comments = [];
head = head.replace(/<!--[\s\S]*?-->/g, (m) => { comments.push(m); return ` C${comments.length - 1} `; });

const readRel = (p) => readFileSync(resolve(baseDir, p), "utf8");
// Escape the closing tag inside a payload, else a literal </style> or </script>
// (e.g. in a source file's usage-doc comment) closes the inline block early and
// dumps the rest into the body as live HTML.
const safeCss = (t) => t.replace(/<\/style>/gi, "<\\/style>");
const safeJs = (t) => t.replace(/<\/script>/gi, "<\\/script>");

// Single pass over the ORIGINAL head: inline each active stylesheet <link> here,
// but DEFER external <script src> to the end of <body> — an inline <script> in
// <head> runs during head parse (before slides exist) since `defer` is ignored
// on inline scripts, so the engine must run after the DOM is built.
const deferredJs = [];
const TAG = /^.*?(?:<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?>|<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>).*$/gm;
head = head.replace(TAG, (line, cssHref, jsSrc) => {
  try {
    if (cssHref) return `  <style>\n${safeCss(readRel(cssHref))}\n  </style>`;
    if (jsSrc) { deferredJs.push(readRel(jsSrc)); return ""; }
  } catch (e) { console.warn("skip (not found):", cssHref || jsSrc); return line; }
  return line;
});

head = head.replace(/ C(\d+) /g, (_, i) => comments[+i]);

// Append the inlined engine just before </body> so it runs after the slides.
let out = head + rest;
if (deferredJs.length) {
  const block = deferredJs.map((t) => `<script>\n${safeJs(t)}\n</script>`).join("\n");
  out = out.includes("</body>") ? out.replace("</body>", block + "\n</body>") : out + "\n" + block;
}
writeFileSync(output, out);
console.log(`inlined → ${output} (${out.length} bytes, ${deferredJs.length} engine script(s) → end of body)`);
