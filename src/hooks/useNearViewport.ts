import { useEffect, useState, type RefObject } from "react";

// Remember visibility so loaded galleries remain available when scrolling back.
export function useNearViewport(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!enabled || nearViewport || !element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, nearViewport, ref]);

  return enabled && nearViewport;
}
