import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { projects } from "../src/data/projects.ts";
import { readAudioSettings } from "../src/lib/audioSettings.ts";
import { backgroundSong } from "../src/config.ts";
import { optimizeSvg } from "../scripts/optimize-svg.mjs";

test("projects have unique identifiers, existing images and valid section links", async () => {
  assert.equal(new Set(projects.map(({ number }) => number)).size, projects.length);
  for (const project of projects) {
    assert.ok(project.slides.length > 0, project.title);
    for (const slide of project.slides) {
      await access(new URL(`../public/${slide.image}`, import.meta.url));
    }
    for (const section of project.details?.sections ?? []) {
      if (section.imageIndex === undefined) continue;
      assert.ok(Number.isInteger(section.imageIndex));
      assert.ok(section.imageIndex >= -1 && section.imageIndex < project.slides.length);
    }
  }
});

test("audio settings tolerate corrupt and inaccessible storage", (t) => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  let stored = null;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: { getItem: () => stored } },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
  });
  const defaults = { muted: false, volume: backgroundSong.volume };
  assert.deepEqual(readAudioSettings(), defaults);
  for (stored of ["{", "null", "42", '{"volume":null}', '{"volume":"bad"}']) {
    assert.deepEqual(readAudioSettings(), defaults);
  }
  stored = '{"muted":true,"volume":0.6}';
  assert.deepEqual(readAudioSettings(), { muted: true, volume: 0.6 });
  stored = '{"volume":5}';
  assert.equal(readAudioSettings().volume, 1);
  stored = '{"volume":-2}';
  assert.equal(readAudioSettings().volume, 0);
  window.localStorage.getItem = () => {
    throw new Error("Storage blocked");
  };
  assert.deepEqual(readAudioSettings(), defaults);
});

test("SVG optimization preserves text, spacing and non-path attributes", () => {
  const source =
    '<svg><text xml:space="preserve">1.00  units</text><path data-id="keep  1.00" d="M 0.50 1.00 L -0.50 2.00 Z"/></svg>';
  const optimized = optimizeSvg(source);
  assert.ok(optimized.includes('<text xml:space="preserve">1.00  units</text>'));
  assert.ok(optimized.includes('data-id="keep  1.00"'));
  assert.ok(optimized.includes('d="M.5 1L-.5 2Z"'));
  assert.equal(optimizeSvg(optimized), optimized);
});

test("SVG optimization is idempotent on the actual artwork", async () => {
  const source = await readFile(new URL("../public/firewatch-tower.svg", import.meta.url), "utf8");
  const optimized = optimizeSvg(source);
  assert.equal(optimizeSvg(optimized), optimized);
  assert.ok(Buffer.byteLength(optimized) <= Buffer.byteLength(source));
});
