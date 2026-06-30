export type AudioSettings = {
  muted: boolean;
  sfxVolume: number;
  musicVolume: number;
};

const STORAGE_KEY = "sword-survivors-audio";

const DEFAULT_SETTINGS: AudioSettings = {
  muted: false,
  sfxVolume: 0.72,
  musicVolume: 0.55
};

export function readAudioSettings(): AudioSettings {
  if (typeof window === "undefined") {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      muted: Boolean(parsed.muted),
      sfxVolume: clampVolume(parsed.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
      musicVolume: clampVolume(parsed.musicVolume, DEFAULT_SETTINGS.musicVolume)
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function writeAudioSettings(settings: AudioSettings): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function clampVolume(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return Math.max(0, Math.min(1, value));
}
