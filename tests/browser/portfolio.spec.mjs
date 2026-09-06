import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.runtimeErrors = errors;
  await page.goto("/", { waitUntil: "domcontentloaded" });
});

test.afterEach(async ({ page }) => {
  expect(page.runtimeErrors).toEqual([]);
});

const firstCard = (page) => page.locator(".project-card").first();

async function expectSlide(carousel, index) {
  await expect(carousel.locator(".carousel-dots button").nth(index)).toHaveAttribute(
    "aria-current",
    "true",
  );
  await expect
    .poll(() =>
      carousel.locator(".carousel-track").evaluate((track) => {
        const x = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
        return Math.round((-x / track.clientWidth) * 100) / 100;
      }),
    )
    .toBe(index + 1);
}

test("loads nearby galleries, keeps distant images deferred and fits the viewport", async ({
  page,
}) => {
  const requestedImages = [];
  page.on("request", (request) => {
    if (request.url().includes("/projects/")) requestedImages.push(decodeURI(request.url()));
  });
  await expect(page.getByRole("heading", { name: "Leo Bogaert" })).toBeVisible();
  const card = firstCard(page);
  await card.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      card
        .locator("img.carousel-image")
        .evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)),
    )
    .toBe(true);
  await expect(page.locator(".project-card").last().locator("img.carousel-image[src]")).toHaveCount(
    0,
  );
  expect(requestedImages.some((url) => url.includes("/Robot dog/"))).toBe(false);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
});

test("carousel buttons, edge wrapping and keyboard lightbox navigation work", async ({ page }) => {
  const card = firstCard(page);
  await card.scrollIntoViewIfNeeded();
  const carousel = card.locator(".project-carousel");
  const next = card.getByRole("button", { name: "Next Class D Amplifier image", exact: true });
  await next.click();
  await expectSlide(carousel, 1);
  await next.click();
  await expectSlide(carousel, 2);
  await next.click();
  await expectSlide(carousel, 0);
  await card.getByRole("button", { name: "Previous Class D Amplifier image", exact: true }).click();
  await expectSlide(carousel, 2);

  const enlarge = card.getByRole("button", {
    name: "Enlarge Class D Amplifier images",
    exact: true,
  });
  await enlarge.focus();
  await page.keyboard.press("Enter");
  const lightbox = page.getByRole("dialog", { name: "Class D Amplifier enlarged images" });
  await expect(lightbox).toBeVisible();
  await expect(lightbox.getByRole("button", { name: "Close enlarged images" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(lightbox.locator(".lightbox-count")).toHaveText("02 / 03");
  await page.keyboard.press("Escape");
  await expect(lightbox).toHaveCount(0);
  await expect(enlarge).toBeFocused();
  await expect(page.locator("#root")).not.toHaveAttribute("inert", "");
});

test("backdrop closes return to an interactive page without opening project details", async ({
  page,
}) => {
  const card = firstCard(page);
  await card.scrollIntoViewIfNeeded();
  const activeImage = card.locator(
    '.carousel-slide:not([aria-hidden]) [data-zoom-active="true"] .carousel-image-clip',
  );
  await expect(activeImage.locator("img")).toHaveClass(/is-loaded/);
  await activeImage.click({ position: { x: 30, y: 30 } });

  const lightbox = page.getByRole("dialog", {
    name: "Class D Amplifier enlarged images",
  });
  await expect(lightbox).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => document.elementFromPoint(2, 2)?.classList.contains("image-lightbox")),
    )
    .toBe(true);
  await page.mouse.click(2, 2);
  await expect(lightbox).toHaveCount(0);
  await expect(page.locator(".project-detail")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(page.locator("#root")).not.toHaveAttribute("inert", "");

  const moreInfo = card.getByRole("button", { name: "More info", exact: true });
  await moreInfo.click();
  const details = page.getByRole("dialog", { name: "Class D Amplifier", exact: true });
  await expect(details).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(details).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(page.locator("#root")).not.toHaveAttribute("inert", "");

  // A second open proves pointer and focus interaction returned to the page.
  await moreInfo.click();
  await expect(details).toBeVisible();
  await details.getByRole("button", { name: "Close Class D Amplifier details" }).click();
  await expect(details).toHaveCount(0);
});

test("nested dialogs trap focus and restore scrolling and the original control", async ({
  page,
}) => {
  const moreInfo = firstCard(page).getByRole("button", { name: "More info", exact: true });
  await moreInfo.click();
  const details = page.getByRole("dialog", { name: "Class D Amplifier", exact: true });
  await expect(details).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expect(page.locator("#root")).toHaveAttribute("inert", "");
  const enlarge = details.getByRole("button", {
    name: "Enlarge Class D Amplifier images",
    exact: true,
  });
  await enlarge.focus();
  await page.keyboard.press("Enter");
  const lightbox = page.getByRole("dialog", { name: "Class D Amplifier enlarged images" });
  const close = lightbox.getByRole("button", { name: "Close enlarged images" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(lightbox.getByRole("button", { name: "Next image", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(lightbox).toHaveCount(0);
  await expect(details).toBeVisible();
  await expect(enlarge).toBeFocused();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(details).toHaveCount(0);
  await expect(moreInfo).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(page.locator("#root")).not.toHaveAttribute("inert", "");
});

test("reduced motion disables parallax and preserves carousel wrapping", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const card = firstCard(page);
  await card.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".scene-image")
        .evaluate((image) => image.style.getPropertyValue("--image-offset")),
    )
    .toBe("0px");
  await card.getByRole("button", { name: "Previous Class D Amplifier image", exact: true }).click();
  await expectSlide(card.locator(".project-carousel"), 2);
  await card.getByRole("button", { name: "Next Class D Amplifier image", exact: true }).click();
  await expectSlide(card.locator(".project-carousel"), 0);
});

test("audio controls survive unavailable storage and restore zero volume", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "getItem", {
      value: () => '{"volume":0,"muted":true}',
    });
    Object.defineProperty(Storage.prototype, "setItem", {
      value: () => {
        throw new Error("Storage blocked");
      },
    });
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  const toggle = page.locator(".audio-toggle");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() => page.locator("audio").evaluate((audio) => audio.volume))
    .toBeGreaterThan(0);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => page.locator("audio").evaluate((audio) => audio.muted)).toBe(true);
});

test("regular and full-screen image arrows retain click sounds", async ({ page }) => {
  await page.addInitScript(() => {
    window.__playedMedia = [];
    HTMLMediaElement.prototype.play = function () {
      window.__playedMedia.push(this.getAttribute("src") ?? this.src);
      return Promise.resolve();
    };
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  const clickSoundCount = () =>
    page.evaluate(
      () => window.__playedMedia.filter((source) => /\/Click\.mp3(?:$|\?)/i.test(source)).length,
    );
  const clearPlayedMedia = () =>
    page.evaluate(() => {
      window.__playedMedia = [];
    });

  const card = firstCard(page);
  await card.scrollIntoViewIfNeeded();
  await clearPlayedMedia();
  await card.getByRole("button", { name: "Next Class D Amplifier image", exact: true }).click();
  await expect.poll(clickSoundCount).toBe(1);
  await card
    .getByRole("button", { name: "Previous Class D Amplifier image", exact: true })
    .click();
  await expect.poll(clickSoundCount).toBe(2);

  const viewport = card.getByRole("button", {
    name: "Enlarge Class D Amplifier images",
    exact: true,
  });
  await viewport.focus();
  await page.keyboard.press("Enter");
  const lightbox = page.getByRole("dialog", {
    name: "Class D Amplifier enlarged images",
  });
  await expect(lightbox).toBeVisible();
  await clearPlayedMedia();
  await lightbox.getByRole("button", { name: "Next image", exact: true }).click();
  await expect.poll(clickSoundCount).toBe(1);
  await lightbox.getByRole("button", { name: "Previous image", exact: true }).click();
  await expect.poll(clickSoundCount).toBe(2);
});

test("large desktop spacing stays compact between About and projects", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop monitor layouts only");
  for (const [width, height] of [
    [1920, 1080],
    [2560, 1440],
  ]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => document.fonts.ready);
    const gaps = await page.evaluate(() => {
      const cards = [...document.querySelectorAll(".about-card, .project-card")];
      return cards
        .slice(1)
        .map(
          (card, index) =>
            card.getBoundingClientRect().top - cards[index].getBoundingClientRect().bottom,
        );
    });
    console.log(`${width}×${height}: section gaps ${gaps.map(Math.round).join(", ")}px`);
    await page
      .locator("#about")
      .evaluate((section) => window.scrollTo({ top: section.offsetTop - 24, behavior: "instant" }));
    await page.screenshot({ path: testInfo.outputPath(`desktop-${width}.png`) });
    for (const gap of gaps) {
      expect(gap).toBeGreaterThanOrEqual(48);
      expect(gap).toBeLessThanOrEqual(80);
    }
  }
});

test("horizontal gestures change slides without opening a lightbox", async ({ page, isMobile }) => {
  const card = firstCard(page);
  const viewport = card.locator(".carousel-viewport");
  await viewport.scrollIntoViewIfNeeded();
  const bounds = await viewport.boundingBox();
  const x = bounds.x + bounds.width * 0.7;
  const y = bounds.y + bounds.height * 0.3;
  if (isMobile) {
    const session = await page.context().newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (const distance of [20, 40, 60, 90]) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x - distance, y }],
      });
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await session.detach();
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 90, y, { steps: 6 });
    await page.mouse.up();
  }
  await expectSlide(card.locator(".project-carousel"), 1);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".project-detail")).toHaveCount(0);

  if (isMobile) {
    const caption = card.locator(".carousel-slide").nth(2).locator("figcaption");
    await caption.tap();
    await expect(caption).toHaveClass(/is-mobile-hidden/);
    await caption.tap();
    await expect(caption).not.toHaveClass(/is-mobile-hidden/);
  } else {
    await page.mouse.wheel(80, 0);
    await expectSlide(card.locator(".project-carousel"), 2);
  }
});
