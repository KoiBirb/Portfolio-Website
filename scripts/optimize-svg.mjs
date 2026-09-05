import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const optimizePathData = (pathData) =>
  pathData
    .replace(/(-?\d+)\.0+(?=[\s,MLHVCSQTAZmlhvcsqtaz]|$)/gu, "$1")
    .replace(/(-?\d+\.\d*?[1-9])0+(?=[\s,MLHVCSQTAZmlhvcsqtaz]|$)/gu, "$1")
    .replace(/\s+/gu, " ")
    .replace(/\s*([MLHVCSQTAZmlhvcsqtaz])\s*/gu, "$1")
    .replace(/\s+(-)/gu, "$1")
    .replace(/(^|[\sA-Za-z-])0\.(\d+)/gu, "$1.$2")
    .replace(/(^|[\sA-Za-z])-0\.(\d+)/gu, "$1-.$2")
    .trim();

// Restrict numeric and whitespace changes to path data: text and other
// attributes can contain meaningful spacing and decimal strings.
export const optimizeSvg = (source) =>
  source
    .replace(/^<\?xml[^>]*>\s*/u, "")
    .replace(/^<!DOCTYPE[^>]*>\s*/u, "")
    .replace(
      /(<path\b[^>]*?\s)d="([^"]*)"/gu,
      (_, prefix, pathData) => `${prefix}d="${optimizePathData(pathData)}"`,
    )
    .trim();

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = new URL("../public/firewatch-tower.svg", import.meta.url);
  const source = await readFile(file, "utf8");
  const optimized = `${optimizeSvg(source)}\n`;
  if (source !== optimized) await writeFile(file, optimized, "utf8");
  console.log(`SVG: ${Buffer.byteLength(source)} → ${Buffer.byteLength(optimized)} bytes`);
}
