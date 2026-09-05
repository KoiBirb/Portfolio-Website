import { useEffect, useState, type RefObject } from "react";

// Prioritize the hero artwork, then music, before loading nearby galleries.
export function useAssetLoading(
  imageRef: RefObject<HTMLImageElement | null>,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    const audio = audioRef.current;
    let started = false;
    let timer: number | undefined;

    const enableImages = () => {
      window.clearTimeout(timer);
      audio?.removeEventListener("canplay", enableImages);
      audio?.removeEventListener("error", enableImages);
      setReady(true);
    };

    const start = () => {
      if (started) return;
      started = true;
      if (!audio || audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        enableImages();
        return;
      }

      audio.addEventListener("canplay", enableImages, { once: true });
      audio.addEventListener("error", enableImages, { once: true });
      timer = window.setTimeout(enableImages, 2000);
      audio.preload = "auto";
      if (audio.networkState === HTMLMediaElement.NETWORK_EMPTY) audio.load();
    };

    if (!image || image.complete) start();
    else {
      image.addEventListener("load", start, { once: true });
      image.addEventListener("error", start, { once: true });
    }

    return () => {
      window.clearTimeout(timer);
      image?.removeEventListener("load", start);
      image?.removeEventListener("error", start);
      audio?.removeEventListener("canplay", enableImages);
      audio?.removeEventListener("error", enableImages);
    };
  }, [imageRef, audioRef]);

  return ready;
}
