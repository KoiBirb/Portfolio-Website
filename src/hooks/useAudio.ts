import { useEffect, useRef, useState } from "react";
import { audioSettingsKey, backgroundSong, interfaceSounds } from "../config";
import { readAudioSettings } from "../lib/audioSettings";

export function useAudio() {
  const [initialSettings] = useState(readAudioSettings);
  const [musicMuted, setMusicMuted] = useState(initialSettings.muted);
  const [musicVolume, setMusicVolume] = useState(initialSettings.volume);
  const [playbackBlocked, setPlaybackBlocked] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastVolumeRef = useRef(musicVolume);
  const resumeAfterFocusRef = useRef(false);
  const interfaceVolumeRef = useRef({ muted: musicMuted, volume: musicVolume });
  interfaceVolumeRef.current = {
    // A blocked background track should not suppress sounds from an explicit tap.
    muted: musicMuted,
    volume: musicVolume,
  };

  useEffect(() => {
    // Debounce synchronous storage writes while the desktop slider is moving.
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          audioSettingsKey,
          JSON.stringify({ muted: musicMuted, volume: musicVolume }),
        );
      } catch {
        // Playback controls still work when browser storage is unavailable.
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [musicMuted, musicVolume]);

  useEffect(() => {
    // Event delegation provides UI sounds without attaching listeners to every control.
    const hoverSound = new Audio(interfaceSounds.hover);
    const clickSounds = Array.from({ length: 3 }, () => new Audio(interfaceSounds.click));
    let nextClickSound = 0;
    let lastDirectPointerSound = -Infinity;
    hoverSound.preload = "auto";
    hoverSound.load();
    clickSounds.forEach((sound) => {
      sound.preload = "auto";
      sound.load();
    });

    const playSound = (sound: HTMLAudioElement, volumeMultiplier = 1) => {
      const settings = interfaceVolumeRef.current;
      if (settings.muted || settings.volume === 0) return;
      sound.volume = Math.min(1, settings.volume * volumeMultiplier);
      sound.currentTime = 0;
      void sound.play().catch(() => undefined);
    };
    const findControl = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest(
            "button, a, .project-card.has-details, .project-collaboration-highlight, .carousel-slide figcaption, .carousel-viewport, .lightbox-viewport",
          )
        : null;
    const playClickForTarget = (target: EventTarget | null) => {
      const control = findControl(target);
      if (!control || control.matches(".project-collaboration-highlight:not(a)")) return false;
      const clickSound = clickSounds[nextClickSound];
      nextClickSound = (nextClickSound + 1) % clickSounds.length;
      playSound(clickSound, 1.5);
      return true;
    };
    const handlePointerOver = (event: PointerEvent) => {
      // Trust the event's active pointer instead of the device's primary-pointer
      // media query, which reports `coarse` on many touchscreen laptops even
      // while a real mouse is producing the hover.
      if (event.pointerType !== "mouse") return;
      const control = findControl(event.target);
      if (
        !control ||
        (event.relatedTarget instanceof Node && control.contains(event.relatedTarget))
      )
        return;
      playSound(hoverSound);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || !playClickForTarget(event.target)) return;
      lastDirectPointerSound = performance.now();
    };
    const handleClick = (event: MouseEvent) => {
      // Touch browsers synthesize a click after pointer-down; avoid playing twice.
      if (performance.now() - lastDirectPointerSound < 750) return;
      playClickForTarget(event.target);
    };

    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("click", handleClick);
      hoverSound.pause();
      clickSounds.forEach((sound) => sound.pause());
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = musicVolume;
    audio.muted = musicMuted;
  }, [musicMuted, musicVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Do not keep media decoding in a hidden or unfocused tab.
    const pauseWhenInactive = () => {
      if (!audio.paused) resumeAfterFocusRef.current = true;
      audio.pause();
    };

    const resumeWhenActive = () => {
      if (
        !resumeAfterFocusRef.current ||
        document.visibilityState !== "visible" ||
        !document.hasFocus()
      )
        return;

      void audio
        .play()
        .then(() => {
          resumeAfterFocusRef.current = false;
        })
        .catch(() => undefined);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") pauseWhenInactive();
      else resumeWhenActive();
    };

    window.addEventListener("blur", pauseWhenInactive);
    window.addEventListener("focus", resumeWhenActive);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", pauseWhenInactive);
      window.removeEventListener("focus", resumeWhenActive);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const toggleMusicMute = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      if (audio.volume === 0) {
        const restoredVolume = lastVolumeRef.current || backgroundSong.volume;
        audio.volume = restoredVolume;
        setMusicVolume(restoredVolume);
      }
      audio.muted = false;
      setMusicMuted(false);
      try {
        await audio.play();
        setPlaybackBlocked(false);
      } catch {
        setPlaybackBlocked(true);
      }
      return;
    }

    if (audio.muted) {
      const restoredVolume = lastVolumeRef.current || backgroundSong.volume;
      audio.volume = restoredVolume;
      audio.muted = false;
      setMusicVolume(restoredVolume);
      setMusicMuted(false);
      try {
        await audio.play();
        setPlaybackBlocked(false);
      } catch {
        audio.muted = true;
        setMusicMuted(true);
        setPlaybackBlocked(true);
      }
    } else {
      if (audio.volume > 0) lastVolumeRef.current = audio.volume;
      audio.muted = true;
      setMusicMuted(true);
    }
  };

  const prepareMusic = () => {
    const audio = audioRef.current;
    if (!audio || !audio.paused || audio.preload === "auto") return;
    audio.preload = "auto";
    audio.load();
  };

  const handleVolumeChange = async (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    setMusicVolume(value);
    audio.volume = value;
    audio.muted = value === 0;
    setMusicMuted(value === 0);
    if (value > 0) {
      lastVolumeRef.current = value;
      try {
        await audio.play();
        setPlaybackBlocked(false);
      } catch {
        audio.muted = true;
        setMusicMuted(true);
        setPlaybackBlocked(true);
      }
    }
  };
  return {
    audioRef,
    musicMuted,
    musicVolume,
    playbackBlocked,
    toggleMusicMute,
    prepareMusic,
    handleVolumeChange,
  };
}
