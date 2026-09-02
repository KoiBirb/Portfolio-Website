import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../public/firewatch-tower.svg", import.meta.url);
const source = await readFile(file, "utf8");

const optimizePathData = (pathData) => pathData
  .replace(/\s+/gu, " ")
  .replace(/\s*([MLHVCSQTAZmlhvcsqtaz])\s*/gu, "$1")
  .replace(/\s+(-)/gu, "$1")
  .replace(/(^|[\sA-Za-z-])0\.(\d+)/gu, "$1.$2")
  .replace(/(^|[\sA-Za-z])-0\.(\d+)/gu, "$1-.$2")
  .trim();

const optimized = source
  .replace(/^<\?xml[^>]*>\s*/u, "")
  .replace(/^<!DOCTYPE[^>]*>\s*/u, "")
  .replace(/\r?\n|\t/gu, " ")
  .replace(/\s{2,}/gu, " ")
  .replace(/>\s+</gu, "><")
  .replace(/\s+\/>/gu, "/>")
  .replace(/(-?\d+)\.0+(?=[\s,MLHVCSQTAZmlhvcsqtaz"<])/gu, "$1")
  .replace(/(-?\d+\.\d*?[1-9])0+(?=[\s,MLHVCSQTAZmlhvcsqtaz"<])/gu, "$1")
  .replace(/\bd="([^"]*)"/gu, (_, pathData) => `d="${optimizePathData(pathData)}"`)
  .trim();

await writeFile(file, `${optimized}\n`, "utf8");
