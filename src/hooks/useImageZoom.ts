import { useEffect, useRef, useState, type RefObject } from "react";

type Zoom = { scale: number; x: number; y: number };
type Point = { x: number; y: number };
const original: Zoom = { scale: 1, x: 0, y: 0 };

export function isOverProjectImage(
  viewport: HTMLElement,
  event: { clientX: number; clientY: number; target: EventTarget | null },
) {
  if (event.target instanceof Element && event.target.closest("figcaption")) return false;
  const frame = viewport.querySelector<HTMLElement>(
    '.carousel-slide:not([aria-hidden]) [data-zoom-active="true"]',
  );
  if (!frame) return false;
  const rect = frame.getBoundingClientRect();
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

export function useImageZoom(
  viewportRef: RefObject<HTMLDivElement | null>,
  slide: number,
  open: boolean,
  enabled: boolean,
  onInteract: () => void,
  onTakeGesture: () => void,
) {
  const [zoom, setZoom] = useState(original);
  const callbacks = useRef({ onInteract, onTakeGesture });
  callbacks.current = { onInteract, onTakeGesture };

  useEffect(() => {
    setZoom(original);
    const viewport = viewportRef.current;
    if (!viewport || !enabled) return;
    let current = original;
    let ownedGesture = false;
    const pointers = new Map<number, Point>();
    const frame = () =>
      viewport.querySelector<HTMLElement>(
        '.carousel-slide:not([aria-hidden]) [data-zoom-active="true"]',
      );
    const local = (clientX: number, clientY: number): Point => {
      const element = frame();
      if (!element) return { x: 0, y: 0 };
      const rect = element.getBoundingClientRect();
      // Account for the gallery's hover transform as well as its fitted image size.
      return {
        x: ((clientX - rect.left - rect.width / 2) * element.clientWidth) / rect.width,
        y: ((clientY - rect.top - rect.height / 2) * element.clientHeight) / rect.height,
      };
    };
    const commit = (next: Zoom) => {
      const element = frame();
      if (!element) return;
      const scale = Math.min(8, Math.max(1, next.scale));
      const limitX = (element.clientWidth * (scale - 1)) / 2;
      const limitY = (element.clientHeight * (scale - 1)) / 2;
      current =
        scale === 1
          ? original
          : {
              scale,
              x: Math.max(-limitX, Math.min(limitX, next.x)),
              y: Math.max(-limitY, Math.min(limitY, next.y)),
            };
      setZoom(current);
    };
    const zoomAt = (factor: number, from: Point, to = from) => {
      const scale = Math.min(8, Math.max(1, current.scale * factor));
      const ratio = scale / current.scale;
      commit({
        scale,
        x: to.x - (from.x - current.x) * ratio,
        y: to.y - (from.y - current.y) * ratio,
      });
    };
    const wheel = (event: WheelEvent) => {
      if (!isOverProjectImage(viewport, event)) return;
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.1;
      if (horizontal && !event.ctrlKey && current.scale === 1) return;
      if (!frame()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      callbacks.current.onInteract();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
      if (horizontal && !event.ctrlKey) {
        commit({
          ...current,
          x: current.x - event.deltaX * unit,
          y: current.y - event.deltaY * unit,
        });
      } else {
        zoomAt(
          Math.exp(-event.deltaY * unit * (event.ctrlKey ? 0.01 : 0.002)),
          local(event.clientX, event.clientY),
        );
      }
    };
    const take = (event: PointerEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      callbacks.current.onInteract();
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || !isOverProjectImage(viewport, event)) return;
      pointers.set(event.pointerId, local(event.clientX, event.clientY));
      if (pointers.size > 1 || current.scale > 1) {
        ownedGesture = true;
        callbacks.current.onTakeGesture();
        viewport.setPointerCapture(event.pointerId);
        take(event);
      }
    };
    const move = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      const before = [...pointers.values()];
      const next = local(event.clientX, event.clientY);
      pointers.set(event.pointerId, next);
      if (!ownedGesture) return;
      take(event);
      if (pointers.size >= 2) {
        const after = [...pointers.values()];
        const midpoint = (points: Point[]) => ({
          x: (points[0].x + points[1].x) / 2,
          y: (points[0].y + points[1].y) / 2,
        });
        const distance = (points: Point[]) =>
          Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        const initialDistance = distance(before);
        if (initialDistance > 0)
          zoomAt(distance(after) / initialDistance, midpoint(before), midpoint(after));
      } else {
        commit({
          ...current,
          x: current.x + next.x - previous.x,
          y: current.y + next.y - previous.y,
        });
      }
    };
    const up = (event: PointerEvent) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.delete(event.pointerId);
      if (ownedGesture) {
        take(event);
        if (viewport.hasPointerCapture(event.pointerId))
          viewport.releasePointerCapture(event.pointerId);
      }
      if (pointers.size === 0) ownedGesture = false;
    };
    const resize = new ResizeObserver(() => commit(current));
    resize.observe(viewport);
    viewport.addEventListener("wheel", wheel, { passive: false, capture: true });
    viewport.addEventListener("pointerdown", down, true);
    viewport.addEventListener("pointermove", move, true);
    viewport.addEventListener("pointerup", up, true);
    viewport.addEventListener("pointercancel", up, true);
    viewport.addEventListener("lostpointercapture", up, true);
    return () => {
      resize.disconnect();
      viewport.removeEventListener("wheel", wheel, true);
      viewport.removeEventListener("pointerdown", down, true);
      viewport.removeEventListener("pointermove", move, true);
      viewport.removeEventListener("pointerup", up, true);
      viewport.removeEventListener("pointercancel", up, true);
      viewport.removeEventListener("lostpointercapture", up, true);
    };
  }, [viewportRef, slide, open, enabled]);

  return {
    isZoomed: zoom.scale > 1,
    imageStyle: { transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})` },
  };
}
