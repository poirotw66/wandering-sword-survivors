import Phaser from "phaser";
import { readAudioSettings } from "../data/audioSettings";

type TonePreset = {
  frequency: number;
  durationMs: number;
  type: OscillatorType;
  gain: number;
  slideTo?: number;
};

const SFX_KEYS = {
  hit: "sfx-hit",
  sword: "sfx-sword",
  levelUp: "sfx-level-up",
  pickup: "sfx-pickup",
  heal: "sfx-heal",
  hurt: "sfx-hurt",
  boss: "sfx-boss",
  evolution: "sfx-evolution",
  crit: "sfx-crit",
  combo: "sfx-combo"
} as const;

export class AudioFeedbackSystem {
  private scene: Phaser.Scene;
  private context?: AudioContext;
  private unlocked = false;
  private bgmGain?: GainNode;
  private bgmOscillators: OscillatorNode[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    scene.input.once("pointerdown", () => this.unlock());
    scene.input.keyboard?.once("keydown", () => this.unlock());
    scene.events.once("shutdown", () => this.stopBgm());

    scene.events.on("weapon-fired", (weaponId: string) => this.playWeapon(weaponId));
    scene.events.on("evolution-fired", () => this.playSfx(SFX_KEYS.sword, 0.4));
    scene.events.on("evolution-learned", () => this.playSfx(SFX_KEYS.evolution, 0.5));
    scene.events.on("boss-defeated", () => this.playSfx(SFX_KEYS.boss, 0.55));
    scene.events.on("projectile-hit", () => this.playSfx(SFX_KEYS.hit, 0.42));
    scene.events.on("exp-collected", () => this.playSfx(SFX_KEYS.pickup, 0.34));
    scene.events.on("level-up", () => this.playSfx(SFX_KEYS.levelUp, 0.48));
    scene.events.on("player-damaged", () => this.playSfx(SFX_KEYS.hurt, 0.5));
    scene.events.on("player-healed", () => this.playSfx(SFX_KEYS.heal, 0.42));
    scene.events.on("critical-hit", () => this.playSfx(SFX_KEYS.crit, 0.5));
    scene.events.on("combo-hit", () => this.playSfx(SFX_KEYS.combo, 0.44));
  }

  private unlock(): void {
    if (this.scene.sound.locked) {
      this.scene.sound.unlock();
    }

    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    if (AudioContextCtor) {
      this.context ??= new AudioContextCtor();
      void this.context.resume();
    }

    this.unlocked = true;
    this.startBgm();
  }

  private sfxVolume(): number {
    const settings = readAudioSettings();
    return settings.muted ? 0 : settings.sfxVolume;
  }

  private musicVolume(): number {
    const settings = readAudioSettings();
    return settings.muted ? 0 : settings.musicVolume;
  }

  private playSfx(key: string, volume = 0.45): void {
    if (!this.unlocked || this.sfxVolume() <= 0) {
      return;
    }

    const effectiveVolume = volume * this.sfxVolume();
    if (this.scene.cache.audio.exists(key)) {
      this.scene.sound.play(key, { volume: effectiveVolume });
      return;
    }

    this.playSynthFallback(key, effectiveVolume);
  }

  private playWeapon(weaponId: string): void {
    const volumeByWeapon: Record<string, number> = {
      orbitBlade: 0.22,
      magicBolt: 0.34,
      flameWave: 0.36,
      thunderStrike: 0.4,
      starVortex: 0.38
    };
    this.playSfx(SFX_KEYS.sword, volumeByWeapon[weaponId] ?? 0.36);
  }

  private playSynthFallback(key: string, volume: number): void {
    const fallbackPresets: Record<string, TonePreset> = {
      [SFX_KEYS.hit]: { frequency: 180, slideTo: 120, durationMs: 80, type: "square", gain: 0.04 * volume },
      [SFX_KEYS.sword]: { frequency: 520, slideTo: 260, durationMs: 110, type: "triangle", gain: 0.035 * volume },
      [SFX_KEYS.levelUp]: { frequency: 420, slideTo: 840, durationMs: 180, type: "triangle", gain: 0.055 * volume },
      [SFX_KEYS.pickup]: { frequency: 740, slideTo: 980, durationMs: 90, type: "sine", gain: 0.035 * volume },
      [SFX_KEYS.heal]: { frequency: 520, slideTo: 680, durationMs: 140, type: "sine", gain: 0.045 * volume },
      [SFX_KEYS.hurt]: { frequency: 120, slideTo: 70, durationMs: 160, type: "sawtooth", gain: 0.06 * volume },
      [SFX_KEYS.boss]: { frequency: 180, slideTo: 520, durationMs: 320, type: "sawtooth", gain: 0.055 * volume },
      [SFX_KEYS.evolution]: { frequency: 330, slideTo: 990, durationMs: 260, type: "triangle", gain: 0.06 * volume },
      [SFX_KEYS.crit]: { frequency: 680, slideTo: 1180, durationMs: 120, type: "triangle", gain: 0.05 * volume },
      [SFX_KEYS.combo]: { frequency: 420, slideTo: 760, durationMs: 140, type: "sine", gain: 0.045 * volume }
    };
    const preset = fallbackPresets[key];
    if (preset) {
      this.play(preset);
    }
  }

  private play(preset: TonePreset): void {
    if (!this.unlocked || !this.context) {
      return;
    }

    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = preset.type;
    oscillator.frequency.setValueAtTime(preset.frequency, now);
    if (preset.slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(preset.slideTo, now + preset.durationMs / 1000);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(preset.gain, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.durationMs / 1000);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + preset.durationMs / 1000 + 0.02);
  }

  private startBgm(): void {
    if (!this.context || this.bgmGain) {
      return;
    }

    this.bgmGain = this.context.createGain();
    this.bgmGain.gain.value = 0.0001;
    this.bgmGain.connect(this.context.destination);

    const droneFrequencies = [110, 165, 220];
    for (const frequency of droneFrequencies) {
      const oscillator = this.context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      const voiceGain = this.context.createGain();
      voiceGain.gain.value = frequency === 110 ? 0.08 : frequency === 165 ? 0.05 : 0.03;
      oscillator.connect(voiceGain);
      voiceGain.connect(this.bgmGain);
      oscillator.start();
      this.bgmOscillators.push(oscillator);
    }

    const targetGain = 0.12 * this.musicVolume();
    const now = this.context.currentTime;
    this.bgmGain.gain.exponentialRampToValueAtTime(Math.max(targetGain, 0.0001), now + 1.8);
  }

  private stopBgm(): void {
    for (const oscillator of this.bgmOscillators) {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch {
        // ponytail: oscillator may already be stopped when scene shuts down
      }
    }
    this.bgmOscillators = [];
    this.bgmGain?.disconnect();
    this.bgmGain = undefined;
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
