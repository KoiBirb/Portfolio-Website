import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { mobileDetailQuery, reducedMotionQuery } from "../config";
import type { Project } from "../data/projects";
import { CollaborationCredit } from "./CollaborationCredit";
import { ProjectCarousel } from "./ProjectCarousel";
import { useNearViewport } from "../hooks/useNearViewport";
import { useModalFocus } from "../hooks/useModalFocus";

export const ProjectCard = memo(function ProjectCard({
  project,
  autoPlay,
  imagesEnabled,
}: {
  project: Project;
  autoPlay: boolean;
  imagesEnabled: boolean;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closingRef = useRef(false);
  const galleryImagesEnabled = useNearViewport(cardRef, imagesEnabled);
  useModalFocus(detailsOpen, dialogRef);
  const [detailsClosing, setDetailsClosing] = useState(false);
  const [visibleDetailSection, setVisibleDetailSection] = useState(0);
  const [hoveredDetailSection, setHoveredDetailSection] = useState<number | null>(null);
  const [mobileDetailCloseVisible, setMobileDetailCloseVisible] = useState(true);
  const detailCopyRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const returnTimerRef = useRef<number | null>(null);

  const startMainUiReturn = () => {
    if (window.matchMedia(reducedMotionQuery).matches) return;
    if (returnTimerRef.current !== null) window.clearTimeout(returnTimerRef.current);
    document.body.classList.remove("project-detail-is-open");
    document.body.classList.add("project-detail-is-returning");
    returnTimerRef.current = window.setTimeout(() => {
      returnTimerRef.current = null;
      document.body.classList.remove("project-detail-is-returning");
    }, 420);
  };

  const openDetails = () => {
    closingRef.current = false;
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    if (returnTimerRef.current !== null) window.clearTimeout(returnTimerRef.current);
    document.body.classList.remove("project-detail-is-returning");
    document.body.classList.add("project-detail-is-open");
    setVisibleDetailSection(0);
    setHoveredDetailSection(null);
    setMobileDetailCloseVisible(true);
    setDetailsClosing(false);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (window.matchMedia(reducedMotionQuery).matches) {
      setDetailsOpen(false);
      return;
    }
    startMainUiReturn();
    setDetailsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setDetailsOpen(false);
      setDetailsClosing(false);
    }, 260);
  };

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
      if (returnTimerRef.current !== null) window.clearTimeout(returnTimerRef.current);
      document.body.classList.remove("project-detail-is-returning");
    },
    [],
  );

  useEffect(() => {
    if (!detailsOpen) return;
    document.body.classList.add("project-detail-is-open");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || document.querySelector(".image-lightbox")) return;
      closeDetails();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("project-detail-is-open");
      if (!document.body.classList.contains("project-detail-is-returning")) startMainUiReturn();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [detailsOpen]);

  useEffect(() => {
    if (!detailsOpen) return;
    const scroller = detailCopyRef.current;
    if (!scroller) return;
    const overlay = scroller.closest<HTMLElement>(".project-detail-overlay");
    const mobileLayout = window.matchMedia(mobileDetailQuery);

    // Desktop scroll-spy selects the section with the greatest visible fraction.
    const sections = Array.from(scroller.querySelectorAll<HTMLElement>("[data-detail-section]"));
    if (!sections.length) return;

    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
      // Mobile selection is tap-driven; scrolling does not change the active section.
      if (mobileLayout.matches) return;
      const scrollRoot =
        scroller.scrollHeight > scroller.clientHeight + 1 ? scroller : (overlay ?? scroller);
      const rootBounds = scrollRoot.getBoundingClientRect();
      const rootTop = Math.max(0, rootBounds.top);
      const rootBottom = Math.min(window.innerHeight, rootBounds.bottom);
      const rootHeight = Math.max(1, rootBottom - rootTop);
      let nextIndex = 0;
      let bestScore = -Infinity;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const visibleHeight = Math.max(
          0,
          Math.min(rect.bottom, rootBottom) - Math.max(rect.top, rootTop),
        );
        // Compare the visible fraction so long and short sections compete fairly.
        // A tiny top-position tiebreaker favors the higher section when equal.
        const visibleRatio = visibleHeight / Math.max(1, rect.height);
        const topTiebreaker = (Math.max(0, rootBottom - rect.top) / rootHeight) * 0.0001;
        const score = visibleRatio + topTiebreaker;
        if (score > bestScore) {
          bestScore = score;
          nextIndex = index;
        }
      });

      setVisibleDetailSection((current) => (current === nextIndex ? current : nextIndex));
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };

    scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
    overlay?.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    updateActiveSection();
    return () => {
      scroller.removeEventListener("scroll", scheduleUpdate);
      overlay?.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [detailsOpen, project.details]);

  useEffect(() => {
    if (!detailsOpen) return;
    const overlay = detailCopyRef.current?.closest<HTMLElement>(".project-detail-overlay");
    if (!overlay) return;

    // On mobile, hide the fixed close control while scrolling down and reveal it
    // on upward movement. requestAnimationFrame limits updates to one per frame.
    const mobileLayout = window.matchMedia(mobileDetailQuery);
    let lastScrollTop = overlay.scrollTop;
    let frame = 0;
    const updateMobileClose = () => {
      frame = 0;
      if (!mobileLayout.matches) {
        setMobileDetailCloseVisible(true);
        return;
      }

      const nextScrollTop = overlay.scrollTop;
      if (nextScrollTop <= 8) setMobileDetailCloseVisible(true);
      else if (nextScrollTop > lastScrollTop + 3) setMobileDetailCloseVisible(false);
      else if (nextScrollTop < lastScrollTop - 3) setMobileDetailCloseVisible(true);
      lastScrollTop = nextScrollTop;
    };
    const scheduleMobileCloseUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateMobileClose);
    };

    overlay.addEventListener("scroll", scheduleMobileCloseUpdate, { passive: true });
    window.addEventListener("resize", scheduleMobileCloseUpdate);
    return () => {
      overlay.removeEventListener("scroll", scheduleMobileCloseUpdate);
      window.removeEventListener("resize", scheduleMobileCloseUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [detailsOpen]);

  const detailSections = project.details?.sections ?? [];
  const activeDetailSection = hoveredDetailSection ?? visibleDetailSection;
  const configuredImageIndex = detailSections[activeDetailSection]?.imageIndex;
  // -1 deliberately sends no selection request, preserving the current slide.
  const linkedImageIndex =
    configuredImageIndex === -1 ? undefined : (configuredImageIndex ?? activeDetailSection);
  // Nested controls keep their own behavior instead of opening project details.
  const cardClickCameFromControl = (target: EventTarget | null) =>
    target instanceof Element &&
    target.closest("button, a, .carousel-viewport, .carousel-slide figcaption") !== null;

  return (
    <article
      ref={cardRef}
      className={`project-card${project.details ? " has-details" : ""}`}
      role={project.details ? "button" : undefined}
      tabIndex={project.details ? 0 : undefined}
      aria-label={project.details ? `Open more information about ${project.title}` : undefined}
      onClick={(event) => {
        if (detailsOpen || !project.details || cardClickCameFromControl(event.target)) return;
        openDetails();
      }}
      onKeyDown={(event) => {
        if (
          !project.details ||
          event.target !== event.currentTarget ||
          (event.key !== "Enter" && event.key !== " ")
        )
          return;
        event.preventDefault();
        openDetails();
      }}
    >
      <div className="project-copy">
        <div className="project-meta">
          <span>{project.number}</span>
          <span>{project.eyebrow}</span>
        </div>
        <h2>{project.title}</h2>
        {project.collaboration && <CollaborationCredit collaboration={project.collaboration} />}
        <p>{project.summary}</p>
        <div className="project-links">
          <ul aria-label={`${project.title} technologies`}>
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <div className="project-actions">
            {project.details && (
              <button
                className="project-action project-more-info"
                type="button"
                onClick={openDetails}
                aria-haspopup="dialog"
              >
                <span>More info</span>
                <span aria-hidden="true">↗</span>
              </button>
            )}
            {project.githubUrl && (
              <a
                className="project-action project-github"
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${project.title} on GitHub`}
              >
                <img src="./github.svg" alt="" loading="lazy" decoding="async" />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </div>
      </div>
      <ProjectCarousel
        title={project.title}
        slides={project.slides}
        autoPlay={autoPlay && !detailsOpen}
        imagesEnabled={galleryImagesEnabled}
      />
      {detailsOpen &&
        project.details &&
        createPortal(
          <div
            className={`project-detail-overlay${detailsClosing ? " is-closing" : ""}`}
            role="presentation"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) closeDetails();
            }}
          >
            <section
              ref={dialogRef}
              tabIndex={-1}
              className="project-detail"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`project-detail-title-${project.number}`}
            >
              <div className="project-detail-copy" ref={detailCopyRef}>
                <header className="project-detail-heading">
                  <div className="project-meta">
                    <span>{project.number}</span>
                    <span>{project.eyebrow}</span>
                  </div>
                  <h2 id={`project-detail-title-${project.number}`}>{project.title}</h2>
                  {project.collaboration && (
                    <CollaborationCredit collaboration={project.collaboration} />
                  )}
                </header>
                <div className="project-detail-sections">
                  {project.details.sections.map((section, sectionIndex) => (
                    <section
                      className={`project-detail-section${sectionIndex === activeDetailSection ? " is-active" : ""}`}
                      data-detail-section
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") setHoveredDetailSection(sectionIndex);
                      }}
                      onPointerLeave={(event) => {
                        if (event.pointerType === "mouse") setHoveredDetailSection(null);
                      }}
                      onClick={(event) => {
                        // Mobile selection is explicit and remains fixed while scrolling.
                        if (!window.matchMedia(mobileDetailQuery).matches) return;
                        event.stopPropagation();
                        setHoveredDetailSection(sectionIndex);
                      }}
                      key={`${section.heading}-${sectionIndex}`}
                    >
                      <div className="project-detail-section-heading">
                        <span className="project-detail-section-number" aria-hidden="true">
                          {String(sectionIndex + 1).padStart(2, "0")}
                        </span>
                        <h3>{section.heading}</h3>
                        <span className="project-detail-section-dot" aria-hidden="true" />
                      </div>
                      {section.text && <p>{section.text}</p>}
                      {section.items && (
                        <ul>
                          {section.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}
                </div>
              </div>
              <div className="project-detail-gallery">
                <button
                  className={`project-detail-close${mobileDetailCloseVisible ? "" : " is-mobile-hidden"}`}
                  type="button"
                  onClick={closeDetails}
                  aria-label={`Close ${project.title} details`}
                >
                  <span>Close</span>
                  <span aria-hidden="true">×</span>
                </button>
                <ProjectCarousel
                  title={project.title}
                  slides={project.slides}
                  autoPlay={false}
                  imagesEnabled
                  selectedSlide={linkedImageIndex}
                  selectedSlideKey={activeDetailSection}
                />
              </div>
              {/* Desktop-only scroll progress is integrated into the center divider. */}
              <div
                className="project-detail-divider-progress"
                aria-label={`Reading section ${activeDetailSection + 1} of ${detailSections.length}`}
              >
                <span
                  className="project-detail-divider-current"
                  style={
                    {
                      "--detail-progress": `${(activeDetailSection / Math.max(1, detailSections.length - 1)) * 100}%`,
                    } as CSSProperties
                  }
                  aria-hidden="true"
                />
              </div>
            </section>
          </div>,
          document.body,
        )}
    </article>
  );
});
