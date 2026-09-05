import { useEffect, useRef, useState } from "react";
import { reducedMotionQuery } from "../config";

export function useStoryProgress() {
  const storyRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [activeYear, setActiveYear] = useState("2026");
  const activeYearRef = useRef("2026");
  const [yearPulse, setYearPulse] = useState(false);
  const [mobileSocialVisible, setMobileSocialVisible] = useState(true);
  const mobileSocialVisibleRef = useRef(true);
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);
  const activeProjectIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const story = storyRef.current;
    const image = imageRef.current;
    if (!story || !image) return;

    // Cache the panels once; only their viewport geometry changes while scrolling.
    const panels = Array.from(story.querySelectorAll<HTMLElement>("[data-year]"));
    let frame = 0;
    let storyTravel = 0;
    let imageTravel = 0;
    const reducedMotion = window.matchMedia(reducedMotionQuery);

    const measureScrollableArea = () => {
      storyTravel = Math.max(0, story.offsetHeight - window.innerHeight);
      imageTravel = Math.max(0, image.offsetHeight - window.innerHeight);
    };

    const update = () => {
      const rect = story.getBoundingClientRect();
      const progress = storyTravel > 0 ? Math.min(1, Math.max(0, -rect.top / storyTravel)) : 0;

      const focusedPanel = panels.reduce(
        (mostVisible, panel) => {
          const panelRect = panel.getBoundingClientRect();
          const visibleHeight = Math.max(
            0,
            Math.min(panelRect.bottom, window.innerHeight) - Math.max(panelRect.top, 0),
          );
          const visibleRatio = visibleHeight / Math.min(panelRect.height, window.innerHeight);
          return visibleRatio > mostVisible.ratio ? { panel, ratio: visibleRatio } : mostVisible;
        },
        { panel: panels[0], ratio: 0 },
      );

      if (focusedPanel.panel && focusedPanel.ratio >= 0.88) {
        const nextYear = focusedPanel.panel.dataset.year ?? "2026";
        if (nextYear !== activeYearRef.current) {
          activeYearRef.current = nextYear;
          setActiveYear(nextYear);
          setYearPulse((pulse) => !pulse);
        }
      }
      const focusedProjectIndex = focusedPanel.panel?.dataset.projectIndex;
      const nextProjectIndex =
        focusedProjectIndex !== undefined && focusedPanel.ratio > 0
          ? Number(focusedProjectIndex)
          : null;
      if (nextProjectIndex !== activeProjectIndexRef.current) {
        activeProjectIndexRef.current = nextProjectIndex;
        setActiveProjectIndex(nextProjectIndex);
      }

      const nextSocialVisible = window.scrollY < Math.max(120, window.innerHeight * 0.18);
      if (nextSocialVisible !== mobileSocialVisibleRef.current) {
        mobileSocialVisibleRef.current = nextSocialVisible;
        setMobileSocialVisible(nextSocialVisible);
      }
      // Finish geometry reads before writing the parallax transform.
      image.style.setProperty(
        "--image-offset",
        reducedMotion.matches ? "0px" : `${(-progress * imageTravel).toFixed(2)}px`,
      );
      frame = 0;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const handleResize = () => {
      measureScrollableArea();
      requestUpdate();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(story);
    resizeObserver.observe(image);

    measureScrollableArea();
    update();
    image.addEventListener("load", handleResize);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);
    reducedMotion.addEventListener("change", requestUpdate);

    return () => {
      resizeObserver.disconnect();
      image.removeEventListener("load", handleResize);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
      reducedMotion.removeEventListener("change", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return { storyRef, imageRef, activeYear, yearPulse, mobileSocialVisible, activeProjectIndex };
}
