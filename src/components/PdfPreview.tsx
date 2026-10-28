import { useEffect, useRef, useState } from "react";
import { projects } from "../data/projects";

export function PdfPreview() {
  const documentRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState("");
  const [notice, setNotice] = useState("Preparing your PDF…");
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let disposed = false;
    let objectUrl = "";
    let timer: ReturnType<typeof setTimeout>;
    setNotice("Preparing your PDF…");
    setFailed(false);
    document.title = "Leo Bogaert | Portfolio PDF";
    void (async () => {
      try {
        const { createPortfolioPdf } = await import("../lib/downloadPortfolioPdf");
        const blob = await createPortfolioPdf(documentRef.current!);
        if (disposed) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        setNotice("Your PDF is ready.");
        timer = setTimeout(() => setNotice(""), 4000);
      } catch (error) {
        if (disposed) return;
        console.error("PDF preview failed", error);
        setFailed(true);
        setNotice("Could not prepare the PDF. Please try again.");
      }
    })();
    return () => {
      disposed = true;
      clearTimeout(timer);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attempt]);

  return (
    <main className="pdf-preview">
      <header className="pdf-preview-toolbar">
        <a href="./">← Portfolio</a>
        <span>Leo Bogaert / PDF preview</span>
        {url ? (
          <a className="pdf-save" href={url} download="Leo-Bogaert-Portfolio.pdf">
            Download PDF ↓
          </a>
        ) : (
          <button className="pdf-save" disabled={!failed} onClick={() => setAttempt(attempt + 1)}>
            {failed ? "Try again" : "Preparing PDF…"}
          </button>
        )}
      </header>
      <div className="pdf-preview-notice" role="status">
        {notice}
      </div>
      <div className="pdf-preview-scroll">
        <div className="portfolio-pdf-document" ref={documentRef}>
          <section className="portfolio-pdf-page pdf-cover">
            <div className="pdf-cover-masthead">
              <div className="pdf-cover-heading">
                <p className="pdf-kicker">Electrical engineering / Ontario, Canada</p>
                <h1>
                  Leo
                  <br />
                  Bogaert<span>.</span>
                </h1>
                <p>Engineering portfolio</p>
              </div>
              <div className="pdf-cover-art-frame">
                <img
                  className="pdf-cover-art"
                  src="./firewatch-tower.svg"
                  alt="Firewatch tower illustration"
                />
              </div>
            </div>
            <div className="pdf-contact">
              <a href="https://www.linkedin.com/in/leo-bogaert/">LinkedIn ↗</a>
              <a href="https://github.com/koibirb">GitHub ↗</a>
            </div>
            <div className="pdf-cover-about">
              <p className="pdf-kicker">About</p>
              <h2>Designed from the ground up.</h2>
              <p>
                I am a student from Ontario, Canada, currently studying at Western University. I
                love PCB design, CAD, robotics, and aeronautics. I enjoy combining electrical,
                mechanical, and software skills to design and build practical engineering systems.
              </p>
            </div>
            <div className="pdf-cover-focus">
              <span>01 / Robotics</span>
              <span>02 / Aerospace</span>
              <span>03 / Electronics</span>
            </div>
            <footer className="pdf-page-footer">
              <span>PCB design / Embedded systems / CAD</span>
              <span>01 / {String(projects.length + 1).padStart(2, "0")}</span>
            </footer>
          </section>
          {projects.map((project, index) => (
            <section className="portfolio-pdf-page pdf-project-page" key={project.number}>
              <div className="pdf-page-top">
                <span>Leo Bogaert / Projects</span>
                <span>
                  {project.year} / Project {project.number}
                </span>
              </div>
              <p className="pdf-kicker">{project.eyebrow}</p>
              <h2>{project.title}</h2>
              {project.collaboration && (
                <p className="pdf-collaboration">
                  {project.collaboration.label} {project.collaboration.highlight}
                </p>
              )}
              <p className="pdf-project-summary">
                {project.details ? (project.pdfSummary ?? project.summary) : project.summary}
              </p>
              <div className={`pdf-project-gallery${project.details ? "" : " pdf-gallery-four"}`}>
                {(project.pdfImageIndices ?? (project.details ? [0, 1] : [0, 1, 2, 3]))
                  .map((slideIndex) => project.slides[slideIndex])
                  .map((slide, i) => (
                    <figure key={slide.image}>
                      <div className="pdf-project-image-frame">
                        <img src={slide.image} alt={slide.alt || slide.title} />
                      </div>
                      <figcaption>
                        {String(i + 1).padStart(2, "0")} / {slide.title}
                      </figcaption>
                    </figure>
                  ))}
              </div>
              {project.details && (
                <div className="pdf-project-description">
                  <h3 className="pdf-kicker">Engineering contribution</h3>
                  <p>{project.details.sections[0]?.paragraphs?.[0]}</p>
                </div>
              )}
              {project.details && (
                <div className="pdf-technical-summary">
                  <h3 className="pdf-kicker">Technical summary</h3>
                  <ul>
                    {project.details.sections
                      .find((section) => section.heading === "Technical Summary")
                      ?.items?.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                  </ul>
                </div>
              )}
              <ul className="pdf-project-tags">
                {project.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              {project.githubUrl && (
                <a className="pdf-project-source" href={project.githubUrl}>
                  View project on GitHub ↗
                </a>
              )}
              <footer className="pdf-page-footer">
                <span>Engineering portfolio / Projects</span>
                <span>
                  {String(index + 2).padStart(2, "0")} /{" "}
                  {String(projects.length + 1).padStart(2, "0")}
                </span>
              </footer>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
