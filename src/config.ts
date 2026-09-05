// Asset paths and shared interaction timing.
export const backgroundSong = {
  // Add a file to public/music, then set its path here, for example:
  // src: "./music/background-song.mp3",
  src: "./music/Background.mp3",
  title: "Background music",
  volume: 0.3,
};

export const interfaceSounds = {
  hover: "./music/Hover.mp3",
  click: "./music/Click.mp3",
};

export const audioSettingsKey = "portfolio-audio-settings";
export const autoPlayInterval = 4000;
export const interactionCooldown = 6000;

export const coarsePointerQuery = "(hover: none), (pointer: coarse)";
// Keep JavaScript interaction behavior aligned with the CSS mobile breakpoint.
export const mobileDetailQuery = "(max-width: 900px)";
export const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
