import { test, expect } from "@playwright/test";

const activeImage = (viewport) =>
  viewport.locator('.carousel-slide:not([aria-hidden]) [data-zoom-active="true"] img');
const transform = (viewport) =>
  activeImage(viewport).evaluate((image) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(image).transform);
    return { scale: matrix.a, x: matrix.e, y: matrix.f };
  });
async function wheel(viewport, deltaY, ctrlKey = false) {
  await viewport.evaluate(
    (element, { deltaY, ctrlKey }) => {
      const frame = element.querySelector(
        '.carousel-slide:not([aria-hidden]) [data-zoom-active="true"]',
      );
      const rect = frame.getBoundingClientRect();
      frame.dispatchEvent(
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width * 0.7,
          clientY: rect.top + rect.height * 0.4,
          deltaY,
          ctrlKey,
        }),
      );
    },
    { deltaY, ctrlKey },
  );
}

test("image zoom is limited to details and full-screen viewers", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const card = page.locator(".project-card").first();
  await card.scrollIntoViewIfNeeded();
  const viewport = card.locator(".carousel-viewport");
  await expect(activeImage(viewport)).toHaveClass(/is-loaded/);
  const normalPageWheelPrevented = await viewport.evaluate((element) => {
    const frame = element.querySelector(
      '.carousel-slide:not([aria-hidden]) [data-zoom-active="true"]',
    );
    const rect = frame.getBoundingClientRect();
    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      deltaY: -200,
    });
    frame.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(normalPageWheelPrevented).toBe(false);
  await expect.poll(() => transform(viewport)).toEqual({ scale: 1, x: 0, y: 0 });
  await viewport.focus();
  await page.keyboard.press("Enter");
  const enlarged = page.locator(".lightbox-viewport");
  await wheel(enlarged, -200);
  await expect.poll(async () => (await transform(enlarged)).scale).toBeGreaterThan(1);
  await wheel(enlarged, 10000);
  await expect.poll(() => transform(enlarged)).toEqual({ scale: 1, x: 0, y: 0 });
  await page.keyboard.press("Escape");
  await expect(enlarged).toHaveCount(0);
  await card.getByRole("button", { name: "More info", exact: true }).click();
  const detailViewport = page.locator(".project-detail .carousel-viewport");
  await expect(activeImage(detailViewport)).toHaveClass(/is-loaded/);
  const dimensions = await activeImage(detailViewport).evaluate((image) => ({
    width: image.clientWidth,
    height: image.clientHeight,
  }));
  await wheel(detailViewport, -200);
  await expect.poll(async () => (await transform(detailViewport)).scale).toBeGreaterThan(1);
  const zoomed = await transform(detailViewport);
  expect(zoomed.x).toBeCloseTo(dimensions.width * 0.2 * (1 - zoomed.scale), 0);
  expect(zoomed.y).toBeCloseTo(-dimensions.height * 0.1 * (1 - zoomed.scale), 0);
});

test("two-finger touch zoom supports panning without changing slides or opening the viewer", async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Requires touchscreen");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const card = page.locator(".project-card").first();
  const normalViewport = card.locator(".carousel-viewport");
  await normalViewport.scrollIntoViewIfNeeded();
  await expect(activeImage(normalViewport)).toHaveClass(/is-loaded/);
  const normalBox = await normalViewport.boundingBox();
  const normalX = normalBox.x + normalBox.width / 2;
  const normalY = normalBox.y + normalBox.height / 2;
  const client = await context.newCDPSession(page);
  const touch = (type, points) =>
    client.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map(([id, px, py]) => ({ id, x: px, y: py })),
    });
  await touch("touchStart", [
    [1, normalX - 30, normalY],
    [2, normalX + 30, normalY],
  ]);
  await touch("touchMove", [
    [1, normalX - 70, normalY],
    [2, normalX + 70, normalY],
  ]);
  await touch("touchEnd", []);
  await expect.poll(() => transform(normalViewport)).toEqual({ scale: 1, x: 0, y: 0 });

  await card.getByRole("button", { name: "More info", exact: true }).click();
  const viewport = page.locator(".project-detail .carousel-viewport");
  await viewport.scrollIntoViewIfNeeded();
  await expect(activeImage(viewport)).toHaveClass(/is-loaded/);
  const box = await viewport.boundingBox();
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  await touch("touchStart", [
    [1, x - 30, y],
    [2, x + 30, y],
  ]);
  await touch("touchMove", [
    [1, x - 70, y],
    [2, x + 70, y],
  ]);
  await expect.poll(async () => (await transform(viewport)).scale).toBeGreaterThan(1.5);
  await touch("touchEnd", []);
  const before = await transform(viewport);
  await touch("touchStart", [[1, x, y]]);
  await touch("touchMove", [[1, x + 25, y + 15]]);
  await touch("touchEnd", []);
  await expect.poll(async () => (await transform(viewport)).x).toBeGreaterThan(before.x + 10);
  await expect(page.locator(".image-lightbox")).toHaveCount(0);
  await expect(
    page.locator(".project-card").first().locator(".carousel-dots button").first(),
  ).toHaveAttribute("aria-current", "true");
  await touch("touchStart", [
    [1, x - 70, y],
    [2, x + 70, y],
  ]);
  await touch("touchMove", [
    [1, x - 5, y],
    [2, x + 5, y],
  ]);
  await touch("touchEnd", []);
  await expect.poll(() => transform(viewport)).toEqual({ scale: 1, x: 0, y: 0 });
});

test("empty image margins neither zoom nor enlarge the image", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const card = page.locator(".project-card").first();
  await card.scrollIntoViewIfNeeded();
  await card.getByRole("button", { name: "Show PCB Layout", exact: true }).click();
  const viewport = card.locator(".carousel-viewport");
  await expect(activeImage(viewport)).toHaveClass(/is-loaded/);
  // Wait for the slide transition before measuring the letterboxed image.
  await expect
    .poll(() =>
      viewport
        .locator(".carousel-track")
        .evaluate((track) =>
          Math.round(
            (-new DOMMatrixReadOnly(getComputedStyle(track).transform).m41 / track.clientWidth) *
              100,
          ),
        ),
    )
    .toBe(200);
  const point = await viewport.evaluate((element) => {
    const outer = element.getBoundingClientRect();
    const frame = element
      .querySelector('.carousel-slide:not([aria-hidden]) [data-zoom-active="true"]')
      .getBoundingClientRect();
    return {
      x: (outer.left + frame.left) / 2,
      y: outer.top + outer.height / 2,
      gap: frame.left - outer.left,
    };
  });
  expect(point.gap).toBeGreaterThan(10);
  const prevented = await viewport.evaluate((element, point) => {
    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      clientX: point.x,
      clientY: point.y,
      deltaY: -200,
    });
    element.dispatchEvent(event);
    return event.defaultPrevented;
  }, point);
  expect(prevented).toBe(false);
  await expect.poll(() => transform(viewport)).toEqual({ scale: 1, x: 0, y: 0 });
  await page.mouse.click(point.x, point.y);
  await expect(page.locator(".image-lightbox")).toHaveCount(0);
  await expect(page.locator(".project-detail")).toHaveCount(0);
  await activeImage(viewport)
    .locator("..")
    .click({ position: { x: 30, y: 30 } });
  await expect(page.locator(".image-lightbox")).toBeVisible();
});
