import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("opens a dynamic PDF preview with an optional download", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  const popupEvent = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Open portfolio PDF preview" }).click();
  const preview = await popupEvent;
  await preview.waitForLoadState();
  await expect(preview).toHaveURL(/\?pdf/);
  const save = preview.getByRole("link", { name: "Download PDF" });
  await expect(save).toBeVisible({ timeout: 100000 });
  await expect(preview.getByRole("status")).toHaveText("Your PDF is ready.");
  await expect(preview.getByRole("status")).toHaveText("", { timeout: 7000 });
  const overflow = await preview
    .locator(".portfolio-pdf-page")
    .evaluateAll((pages) => pages.filter((p) => p.scrollHeight > p.clientHeight).length);
  expect(overflow).toBe(0);
  const distortedImages = await preview.locator(".pdf-project-gallery img").evaluateAll((images) =>
    images
      .filter((image) => {
        const bounds = image.getBoundingClientRect();
        return (
          Math.abs(bounds.width / bounds.height - image.naturalWidth / image.naturalHeight) > 0.01
        );
      })
      .map((image) => image.src),
  );
  expect(distortedImages).toEqual([]);
  const croppedImages = await preview.locator(".pdf-project-gallery img").evaluateAll((images) =>
    images
      .filter((image) => {
        const bounds = image.getBoundingClientRect();
        const frame = image.parentElement.getBoundingClientRect();
        return bounds.width > frame.width || bounds.height > frame.height;
      })
      .map((image) => image.src),
  );
  expect(croppedImages).toEqual([]);
  await expect(preview.locator(".pdf-cover-about .pdf-kicker")).toHaveText("About");
  await expect(preview.locator(".pdf-technical-summary")).toHaveCount(3);
  const projectPages = preview.locator(".pdf-project-page");
  const expectedImages = [
    ["Schematic.png", "Routing.png"],
    ["Schematic Altium.png", "Routing.png"],
    ["TagHousing.jpg", "WebApp.png"],
    ["Full.jpg", "Exploded.png", "Cross.png", "Open.jpg"],
    ["Front.jpg", "Back.jpg", "Top.jpg", "Cad Top.png"],
    ["Main.jpg", "Checkpoint.jpg", "Mid.jpg", "Map.png"],
    ["Folded.jpg", "Side.jpg", "Unassembled.jpg", "Poster.png"],
  ];
  for (let i = 0; i < expectedImages.length; i++) {
    const images = await projectPages
      .nth(i)
      .locator("figure img")
      .evaluateAll((images) =>
        images.map((image) => decodeURIComponent(image.src).split("/").pop()),
      );
    expect(images).toEqual(expectedImages[i]);
  }
  const overlaps = await projectPages.evaluateAll((pages) =>
    pages
      .filter((page) => {
        const footerTop = page.querySelector("footer").getBoundingClientRect().top;
        return [...page.children].some(
          (child) => child.tagName !== "FOOTER" && child.getBoundingClientRect().bottom > footerTop,
        );
      })
      .map((page) => page.querySelector("h2").textContent),
  );
  expect(overlaps).toEqual([]);
  await preview.locator(".pdf-preview-toolbar").evaluate((el) => (el.style.visibility = "hidden"));
  await preview
    .locator(".pdf-cover")
    .screenshot({ path: `test-results/pdf-cover-${test.info().project.name}.png` });
  await preview
    .locator(".pdf-project-page")
    .first()
    .screenshot({ path: `test-results/pdf-project-${test.info().project.name}.png` });
  await projectPages
    .nth(3)
    .screenshot({ path: `test-results/pdf-four-images-${test.info().project.name}.png` });
  await preview.locator(".pdf-preview-toolbar").evaluate((el) => (el.style.visibility = "visible"));
  const result = preview.waitForEvent("download");
  await save.click();
  const download = await result;
  expect(download.suggestedFilename()).toBe("Leo-Bogaert-Portfolio.pdf");
  const bytes = await readFile(await download.path());
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(bytes.length).toBeGreaterThan(50000);
});
