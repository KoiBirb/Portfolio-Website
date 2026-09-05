import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
import { createPortal } from "react-dom";
import { autoPlayInterval, interactionCooldown, reducedMotionQuery } from "../config";
import type { ProjectSlide } from "../data/projects";
import { ProjectCaption } from "./ProjectCaption";
import { useModalFocus } from "../hooks/useModalFocus";

export function ProjectCarousel({
  title,
  slides,
  autoPlay,
  imagesEnabled,
  selectedSlide,
  selectedSlideKey,
}: {
  title: string;
  slides: ProjectSlide[];
  autoPlay: boolean;
  imagesEnabled: boolean;
  selectedSlide?: number;
  selectedSlideKey?: number;
}) {
  // activeSlide is the real content index; trackIndex also includes edge clones.
  const [activeSlide, setActiveSlide] = useState(0);
  const [trackIndex, setTrackIndex] = useState(slides.length > 1 ? 1 : 0);
  const [isResettingTrack, setIsResettingTrack] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxClosing, setLightboxClosing] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  useModalFocus(lightboxOpen, lightboxRef);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileCaptionHidden, setMobileCaptionHidden] = useState(false);
  const [slideRatios, setSlideRatios] = useState<Record<number, number>>({});
  const [loadedSlides, setLoadedSlides] = useState<Record<number, boolean>>({});
  const carouselViewportRef = useRef<HTMLDivElement>(null);
  const lightboxViewportRef = useRef<HTMLDivElement>(null);
  const trackIndexRef = useRef(slides.length > 1 ? 1 : 0);
  const autoPlayResumeAtRef = useRef(0);
  const dragFrameRef = useRef<number | null>(null);
  const pendingDragOffsetRef = useRef(0);
  const trackResetFrameRef = useRef<number | null>(null);
  const lightboxCloseTimerRef = useRef<number | null>(null);
  const dragRef = useRef<{ startX: number; pointerId: number; moved: boolean } | null>(null);
  const wheelLockRef = useRef<number | null>(null);
  // These values distinguish a new trackpad impulse from momentum tail events.
  const wheelGestureRef = useRef({
    distance: 0,
    lastEvent: 0,
    lastMagnitude: 0,
    lastDirection: 0,
  });
  const activeRatio = slideRatios[activeSlide] ?? 16 / 10;

  const postponeAutoPlay = () => {
    // A ref avoids re-rendering for every event in a trackpad momentum stream.
    autoPlayResumeAtRef.current = Date.now() + interactionCooldown;
  };

  const moveSlide = (direction: -1 | 1) => {
    if (slides.length < 2) return;
    const nextTrackIndex = trackIndexRef.current + direction;
    if (nextTrackIndex < 0 || nextTrackIndex > slides.length + 1) return;

    trackIndexRef.current = nextTrackIndex;
    setMobileCaptionHidden(false);
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
    setTrackIndex(nextTrackIndex);
  };

  const previousSlide = () => moveSlide(-1);
  const nextSlide = () => moveSlide(1);
  const moveSlideManually = (direction: -1 | 1) => {
    postponeAutoPlay();
    moveSlide(direction);
  };

  const openLightbox = () => {
    closingRef.current = false;
    if (lightboxCloseTimerRef.current !== null) {
      window.clearTimeout(lightboxCloseTimerRef.current);
      lightboxCloseTimerRef.current = null;
    }
    setLightboxClosing(false);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    postponeAutoPlay();
    if (window.matchMedia(reducedMotionQuery).matches) {
      setLightboxOpen(false);
      return;
    }
    setLightboxClosing(true);
    lightboxCloseTimerRef.current = window.setTimeout(() => {
      lightboxCloseTimerRef.current = null;
      setLightboxOpen(false);
      setLightboxClosing(false);
    }, 260);
  };

  const finishTrackTransition = () => {
    // Edge clones create the visible wrap; this resets to the matching real
    // slide without a transition once that one-slide animation completes.
    let normalizedIndex: number | null = null;
    if (trackIndexRef.current === 0) normalizedIndex = slides.length;
    else if (trackIndexRef.current === slides.length + 1) normalizedIndex = 1;
    if (normalizedIndex === null) return;

    trackIndexRef.current = normalizedIndex;
    setIsResettingTrack(true);
    setTrackIndex(normalizedIndex);
    if (trackResetFrameRef.current !== null) {
      window.cancelAnimationFrame(trackResetFrameRef.current);
    }
    trackResetFrameRef.current = window.requestAnimationFrame(() => {
      trackResetFrameRef.current = window.requestAnimationFrame(() => {
        trackResetFrameRef.current = null;
        setIsResettingTrack(false);
      });
    });
  };

  const handleTrackTransition = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.propertyName === "transform") {
      finishTrackTransition();
    }
  };

  useEffect(
    () => () => {
      if (dragFrameRef.current !== null) window.cancelAnimationFrame(dragFrameRef.current);
      if (trackResetFrameRef.current !== null)
        window.cancelAnimationFrame(trackResetFrameRef.current);
      if (lightboxCloseTimerRef.current !== null)
        window.clearTimeout(lightboxCloseTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (selectedSlide === undefined || slides.length === 0) return;
    // Detail sections can request a slide without enabling timed carousel autoplay.
    const nextSlide = Math.min(slides.length - 1, Math.max(0, selectedSlide));
    setMobileCaptionHidden(false);
    setActiveSlide((current) => (current === nextSlide ? current : nextSlide));
    const nextTrackIndex = slides.length > 1 ? nextSlide + 1 : nextSlide;
    trackIndexRef.current = nextTrackIndex;
    setTrackIndex((current) => (current === nextTrackIndex ? current : nextTrackIndex));
  }, [selectedSlide, selectedSlideKey, slides.length]);

  useEffect(() => {
    if (
      !autoPlay ||
      !imagesEnabled ||
      lightboxOpen ||
      isDragging ||
      isHovered ||
      slides.length < 2 ||
      window.matchMedia(reducedMotionQuery).matches
    )
      return;

    let timer = 0;
    const advanceAndReschedule = () => {
      const cooldownRemaining = autoPlayResumeAtRef.current - Date.now();
      if (cooldownRemaining > 0) {
        timer = window.setTimeout(advanceAndReschedule, cooldownRemaining);
        return;
      }

      if (document.visibilityState === "visible" && document.hasFocus()) {
        nextSlide();
      }
      timer = window.setTimeout(advanceAndReschedule, autoPlayInterval);
    };

    const cooldownRemaining = Math.max(0, autoPlayResumeAtRef.current - Date.now());
    timer = window.setTimeout(advanceAndReschedule, Math.max(autoPlayInterval, cooldownRemaining));

    return () => window.clearTimeout(timer);
  }, [autoPlay, imagesEnabled, isDragging, isHovered, lightboxOpen, slides.length]);

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || dragRef.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    postponeAutoPlay();
    dragRef.current = { startX: event.clientX, pointerId: event.pointerId, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const updateDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 6) drag.moved = true;
    pendingDragOffsetRef.current = distance;
    if (dragFrameRef.current === null) {
      // Pointer events can outpace the display refresh rate; render at most once per frame.
      dragFrameRef.current = window.requestAnimationFrame(() => {
        dragFrameRef.current = null;
        setDragOffset(pendingDragOffsetRef.current);
      });
    }
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>, onTap?: () => void) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (distance <= -50) nextSlide();
    else if (distance >= 50) previousSlide();
    else if (!drag.moved) onTap?.();

    dragRef.current = null;
    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    setDragOffset(0);
    setIsDragging(false);
  };

  const cancelDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    setDragOffset(0);
    setIsDragging(false);
  };

  useEffect(() => {
    const handleTrackpadSwipe = (event: WheelEvent) => {
      const horizontalDistance = event.deltaX;

      // Let ordinary two-finger vertical scrolling continue moving the page.
      if (Math.abs(horizontalDistance) <= Math.abs(event.deltaY) * 1.1) return;
      event.preventDefault();
      postponeAutoPlay();

      const now = performance.now();
      const magnitude = Math.abs(horizontalDistance);
      const direction = Math.sign(horizontalDistance);
      if (wheelLockRef.current !== null) {
        // Ignore momentum from the previous swipe, but immediately accept a
        // new impulse so quick consecutive swipes do not feel locked out.
        const gesture = wheelGestureRef.current;
        const isFreshImpulse =
          direction !== gesture.lastDirection ||
          now - gesture.lastEvent > 70 ||
          (magnitude >= 8 && magnitude > gesture.lastMagnitude * 1.75);

        if (!isFreshImpulse) {
          gesture.lastEvent = now;
          gesture.lastMagnitude = magnitude;
          window.clearTimeout(wheelLockRef.current);
          wheelLockRef.current = window.setTimeout(() => {
            wheelLockRef.current = null;
          }, 140);
          return;
        }

        window.clearTimeout(wheelLockRef.current);
        wheelLockRef.current = null;
        gesture.distance = 0;
      }

      if (now - wheelGestureRef.current.lastEvent > 180) {
        wheelGestureRef.current.distance = 0;
      }
      wheelGestureRef.current.lastEvent = now;
      wheelGestureRef.current.lastMagnitude = magnitude;
      wheelGestureRef.current.lastDirection = direction;
      wheelGestureRef.current.distance += horizontalDistance;

      // Trackpads emit several small wheel events per swipe. Accumulate them so
      // one deliberate gesture always produces exactly one slide change.
      if (Math.abs(wheelGestureRef.current.distance) < 36) return;
      if (wheelGestureRef.current.distance > 0) nextSlide();
      else previousSlide();

      wheelGestureRef.current.distance = 0;
      wheelLockRef.current = window.setTimeout(() => {
        wheelLockRef.current = null;
      }, 140);
    };

    const viewports = [carouselViewportRef.current, lightboxViewportRef.current].filter(
      (viewport): viewport is HTMLDivElement => viewport !== null,
    );
    viewports.forEach((viewport) => {
      viewport.addEventListener("wheel", handleTrackpadSwipe, { passive: false });
    });

    return () => {
      viewports.forEach((viewport) => viewport.removeEventListener("wheel", handleTrackpadSwipe));
      wheelGestureRef.current.distance = 0;
      wheelGestureRef.current.lastMagnitude = 0;
      wheelGestureRef.current.lastDirection = 0;
      if (wheelLockRef.current !== null) {
        window.clearTimeout(wheelLockRef.current);
        wheelLockRef.current = null;
      }
    };
  }, [lightboxOpen, slides.length]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveSlideManually(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveSlideManually(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (wheelLockRef.current !== null) window.clearTimeout(wheelLockRef.current);
    };
  }, [lightboxOpen]);

  const renderSlide = (
    slide: ProjectSlide,
    index: number,
    clonePosition?: "leading" | "trailing",
  ) => {
    const imageRatio = slideRatios[index] ?? 16 / 10;
    const caption = (
      <ProjectCaption
        hidden={mobileCaptionHidden && index === activeSlide}
        index={index}
        total={slides.length}
        title={slide.title}
        onToggle={() => {
          postponeAutoPlay();
          setMobileCaptionHidden((hidden) => !hidden);
        }}
      />
    );

    return (
      <figure
        className="carousel-slide"
        key={`${clonePosition ?? "slide"}-${slide.title}-${index}`}
        aria-hidden={clonePosition ? true : undefined}
      >
        <div
          className="carousel-image-frame"
          style={
            {
              "--image-ratio": imageRatio,
              "--image-width-at-full-height": `${imageRatio * 100}cqh`,
            } as CSSProperties
          }
        >
          <div
            className={`carousel-image-skeleton${loadedSlides[index] ? " is-hidden" : ""}`}
            aria-hidden="true"
          />
          <img
            className={`carousel-image${loadedSlides[index] ? " is-loaded" : ""}`}
            src={imagesEnabled || lightboxOpen ? slide.image : undefined}
            alt={clonePosition ? "" : (slide.alt ?? `${title} project — ${slide.title}`)}
            draggable="false"
            loading={imagesEnabled ? "eager" : "lazy"}
            decoding="async"
            onLoad={(event) => {
              const ratio = event.currentTarget.naturalWidth / event.currentTarget.naturalHeight;
              if (!Number.isFinite(ratio) || ratio <= 0) return;
              setSlideRatios((current) =>
                current[index] === ratio ? current : { ...current, [index]: ratio },
              );
              setLoadedSlides((current) =>
                current[index] ? current : { ...current, [index]: true },
              );
            }}
          />
          {caption}
        </div>
      </figure>
    );
  };

  const renderSlides = () => {
    if (slides.length < 2) {
      return slides.map((slide, index) => renderSlide(slide, index));
    }

    // One clone on each edge lets the carousel wrap in the requested direction.
    return [
      renderSlide(slides[slides.length - 1], slides.length - 1, "leading"),
      ...slides.map((slide, index) => renderSlide(slide, index)),
      renderSlide(slides[0], 0, "trailing"),
    ];
  };

  return (
    <>
      <div
        className={`project-carousel${autoPlay ? " is-active" : ""}`}
        aria-label={`${title} image carousel`}
        onPointerEnter={(event) => {
          if (event.pointerType !== "mouse") return;
          setIsHovered(true);
          postponeAutoPlay();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          setIsHovered(false);
          postponeAutoPlay();
        }}
        onFocusCapture={() => {
          postponeAutoPlay();
        }}
      >
        <div
          ref={carouselViewportRef}
          className="carousel-viewport"
          role="button"
          tabIndex={0}
          aria-label={`Enlarge ${title} images`}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              postponeAutoPlay();
              openLightbox();
            }
          }}
          onPointerDown={beginDrag}
          onPointerMove={updateDrag}
          onPointerUp={(event) => finishDrag(event, openLightbox)}
          onPointerCancel={cancelDrag}
        >
          <div
            className={`carousel-track${isDragging ? " is-dragging" : ""}${isResettingTrack ? " is-resetting" : ""}`}
            style={{ transform: `translateX(calc(-${trackIndex * 100}% + ${dragOffset}px))` }}
            onTransitionEnd={handleTrackTransition}
            onTransitionCancel={handleTrackTransition}
          >
            {renderSlides()}
          </div>
        </div>

        <div className="carousel-controls">
          <button
            type="button"
            onClick={() => moveSlideManually(-1)}
            aria-label={`Previous ${title} image`}
          >
            ←
          </button>
          <div className="carousel-dots" aria-label="Choose image">
            {slides.map((slide, index) => (
              <button
                type="button"
                className={index === activeSlide ? "is-active" : ""}
                onClick={() => {
                  postponeAutoPlay();
                  setMobileCaptionHidden(false);
                  setActiveSlide(index);
                  trackIndexRef.current = slides.length > 1 ? index + 1 : index;
                  setTrackIndex(trackIndexRef.current);
                }}
                aria-label={`Show ${slide.title}`}
                aria-current={index === activeSlide ? "true" : undefined}
                key={`${slide.title}-${index}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => moveSlideManually(1)}
            aria-label={`Next ${title} image`}
          >
            →
          </button>
        </div>
      </div>
      {lightboxOpen &&
        createPortal(
          <div
            ref={lightboxRef}
            tabIndex={-1}
            className={`image-lightbox${lightboxClosing ? " is-closing" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} enlarged images`}
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) {
                closeLightbox();
              }
            }}
          >
            <button
              className="lightbox-close"
              type="button"
              onClick={closeLightbox}
              aria-label="Close enlarged images"
            >
              ×
            </button>
            <button
              className="lightbox-arrow lightbox-previous"
              type="button"
              onClick={() => moveSlideManually(-1)}
              aria-label="Previous image"
            >
              ←
            </button>
            <div
              ref={lightboxViewportRef}
              className="lightbox-viewport"
              style={
                {
                  aspectRatio: activeRatio,
                  "--lightbox-width-by-height": `${82 * activeRatio}dvh`,
                } as CSSProperties
              }
              onPointerDown={beginDrag}
              onPointerMove={updateDrag}
              onPointerUp={finishDrag}
              onPointerCancel={cancelDrag}
            >
              <div
                className={`carousel-track${isDragging ? " is-dragging" : ""}${isResettingTrack ? " is-resetting" : ""}`}
                style={{ transform: `translateX(calc(-${trackIndex * 100}% + ${dragOffset}px))` }}
                onTransitionEnd={handleTrackTransition}
                onTransitionCancel={handleTrackTransition}
              >
                {renderSlides()}
              </div>
            </div>
            <button
              className="lightbox-arrow lightbox-next"
              type="button"
              onClick={() => moveSlideManually(1)}
              aria-label="Next image"
            >
              →
            </button>
            <p className="lightbox-count">
              {String(activeSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}
