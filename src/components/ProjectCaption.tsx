import { useEffect, useRef } from "react";
import { coarsePointerQuery } from "../config";

export function ProjectCaption({
  hidden,
  index,
  total,
  title,
  onToggle,
}: {
  hidden: boolean;
  index: number;
  total: number;
  title: string;
  onToggle: () => void;
}) {
  const captionRef = useRef<HTMLElement>(null);
  const tapRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);

  useEffect(() => {
    const caption = captionRef.current;
    const frame = caption?.parentElement;
    if (!caption || !frame) return;

    let active = true;
    const updateAlignment = () => {
      if (!active) return;
      // Keep the original lower-left placement whenever the whole caption fits.
      caption.classList.toggle(
        "is-frame-overflowing",
        caption.offsetWidth + 32 > frame.clientWidth,
      );
    };
    const resizeObserver = new ResizeObserver(updateAlignment);
    resizeObserver.observe(frame);
    resizeObserver.observe(caption);
    const frameId = window.requestAnimationFrame(updateAlignment);
    void document.fonts?.ready.then(updateAlignment);

    return () => {
      active = false;
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [hidden, title]);

  return (
    <figcaption
      ref={captionRef}
      className={hidden ? "is-mobile-hidden" : undefined}
      onPointerDown={(event) => {
        if (!window.matchMedia(coarsePointerQuery).matches) return;
        event.stopPropagation();
        if (event.isPrimary) {
          tapRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
        }
      }}
      onPointerUp={(event) => {
        const tap = tapRef.current;
        if (!tap || tap.pointerId !== event.pointerId) return;
        tapRef.current = null;
        event.stopPropagation();
        // Touch browsers may omit the compatibility click after a swipe.
        if (Math.hypot(event.clientX - tap.x, event.clientY - tap.y) <= 10) onToggle();
      }}
      onPointerCancel={() => {
        tapRef.current = null;
      }}
      onClick={(event) => {
        if (!window.matchMedia(coarsePointerQuery).matches) return;
        event.stopPropagation();
      }}
    >
      <span>
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <strong>{title}</strong>
    </figcaption>
  );
}
