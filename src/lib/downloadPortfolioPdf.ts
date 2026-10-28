import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function createPortfolioPdf(root: HTMLElement) {
  await Promise.all([
    document.fonts.load('400 16px "Manrope"'),
    document.fonts.load('500 64px "Playfair Display"'),
    document.fonts.load('400 12px "DM Mono"'),
  ]);
  await document.fonts.ready;
  const pages = Array.from(root.querySelectorAll<HTMLElement>(".portfolio-pdf-page"));
  if (!pages.length) throw new Error("Portfolio content unavailable");
  await Promise.all(Array.from(root.querySelectorAll("img")).map((image) => image.decode()));
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  pdf.setProperties({ title: "Leo Bogaert - Engineering Portfolio", author: "Leo Bogaert" });
  for (const [index, page] of pages.entries()) {
    const links: { x: number; y: number; width: number; height: number; url: string }[] = [];
    const canvas = await html2canvas(page, {
      scale: 2,
      backgroundColor: "#2a0905",
      useCORS: true,
      logging: false,
      windowWidth: 1200,
      windowHeight: 1123,
      // Preview scaling must not reduce the exported page resolution or layout.
      onclone: (_document, clonedPage) => {
        const preview = clonedPage.closest<HTMLElement>(".portfolio-pdf-document");
        if (preview) {
          preview.style.zoom = "1";
          preview.style.setProperty("--pdf-text-scale", "1");
        }
        const parent = clonedPage.getBoundingClientRect();
        for (const link of clonedPage.querySelectorAll<HTMLAnchorElement>("a[href]")) {
          const bounds = link.getBoundingClientRect();
          links.push({
            x: ((bounds.x - parent.x) * 210) / parent.width,
            y: ((bounds.y - parent.y) * 297) / parent.height,
            width: (bounds.width * 210) / parent.width,
            height: (bounds.height * 297) / parent.height,
            url: link.href,
          });
        }
      },
    });
    if (index) pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.94), "JPEG", 0, 0, 210, 297);
    for (const link of links) {
      pdf.link(link.x, link.y, link.width, link.height, { url: link.url });
    }
    canvas.width = canvas.height = 0;
  }
  return pdf.output("blob");
}
