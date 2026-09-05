import { audioSettingsKey, backgroundSong } from "../config.ts";

export function readAudioSettings() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(audioSettingsKey) ?? "null");
    const volume = saved?.volume;
    return {
      muted: saved?.muted === true,
      volume:
        typeof volume === "number" && Number.isFinite(volume)
          ? Math.min(1, Math.max(0, volume))
          : backgroundSong.volume,
    };
  } catch {
    return { muted: false, volume: backgroundSong.volume };
  }
}
