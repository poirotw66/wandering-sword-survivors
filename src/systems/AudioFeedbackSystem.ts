import Phaser from "phaser";
import { readAudioSettings } from "../data/audioSettings";
import type { EvolutionId } from "../data/evolutions";
import { evolutionVfxFor } from "../data/evolutionVfxProfiles";
import { WuxiaBgmSystem } from "../audio/WuxiaBgmSystem";

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
  combo: "sfx-combo",
  drain: "sfx-drain"
} as const;

/** Scales weapon hits, crits, combos, and evolution attack SFX without muting UI feedback. */
const ATTACK_SFX_VOLUME_SCALE = 0.58;

export class AudioFeedbackSystem {
  private scene: Phaser.Scene;
  private context?: AudioContext;
  private unlocked = false;
  private readonly bgm = WuxiaBgmSystem.shared();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.bgm.bindScene(scene);
    this.bgm.setMode("combat");

    if (this.bgm.isUnlocked()) {
      this.unlocked = true;
      if (this.scene.sound.locked) {
        this.scene.sound.unlock();
      }
      const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
      if (AudioContextCtor) {
        this.context ??= new AudioContextCtor();
        void this.context.resume();
      }
    } else {
      scene.input.once("pointerdown", () => this.unlock());
      scene.input.keyboard?.once("keydown", () => this.unlock());
    }

    scene.events.on("weapon-fired", (weaponId: string) => this.playWeapon(weaponId));
    scene.events.on("evolution-fired", (evolutionId: EvolutionId) => this.playEvolutionFired(evolutionId));
    scene.events.on("evolution-learned", (evolutionId: EvolutionId) => this.playEvolutionLearned(evolutionId));
    scene.events.on("boss-spawned", () => this.bgm.setMode("boss"));
    scene.events.on("boss-defeated", () => this.bgm.setMode("combat"));
    scene.events.on("boss-defeated", () => this.playSfx(SFX_KEYS.boss, 0.55));
    scene.events.on("projectile-hit", () => this.playSfx(SFX_KEYS.hit, 0.42 * ATTACK_SFX_VOLUME_SCALE));
    scene.events.on("exp-collected", () => this.playSfx(SFX_KEYS.pickup, 0.34));
    scene.events.on("level-up", () => this.playSfx(SFX_KEYS.levelUp, 0.48));
    scene.events.on("player-damaged", () => this.playSfx(SFX_KEYS.hurt, 0.5));
    scene.events.on("player-healed", (_amount: number, source?: string) => {
      this.playSfx(source === "drain" ? SFX_KEYS.drain : SFX_KEYS.heal, source === "drain" ? 0.46 : 0.42);
    });
    scene.events.on("critical-hit", () => this.playSfx(SFX_KEYS.crit, 0.5 * ATTACK_SFX_VOLUME_SCALE));
    scene.events.on("combo-hit", () => this.playSfx(SFX_KEYS.combo, 0.44 * ATTACK_SFX_VOLUME_SCALE));
    scene.events.on("bgm-duck", (durationMs: number, ratio = 0.16) => this.bgm.duck(durationMs, ratio));
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
    this.bgm.unlock();
    this.bgm.setMode("combat");
  }

  private sfxVolume(): number {
    const settings = readAudioSettings();
    return settings.muted ? 0 : settings.sfxVolume;
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
    this.playSfx(SFX_KEYS.sword, (volumeByWeapon[weaponId] ?? 0.36) * ATTACK_SFX_VOLUME_SCALE);
  }

  private playEvolutionFired(evolutionId: EvolutionId): void {
    const profile = evolutionVfxFor(evolutionId);
    const pitch = profile.burstStyle === "vajra" || profile.burstStyle === "quake" ? 0.85 : profile.burstStyle === "gale" ? 1.15 : 1;
    this.playSfx(SFX_KEYS.sword, 0.42 * pitch * ATTACK_SFX_VOLUME_SCALE);
    this.playTone(520 * pitch, 860 * pitch, 90, 0.018);
  }

  private playEvolutionLearned(evolutionId: EvolutionId): void {
    const profile = evolutionVfxFor(evolutionId);
    const pitch = profile.burstStyle === "vajra" || profile.burstStyle === "quake" ? 0.88 : profile.burstStyle === "gale" ? 1.12 : 1;
    this.bgm.duck(1650, 0.14);
    this.playSfx(SFX_KEYS.evolution, 0.55);
    this.playTone(330 * pitch, 1180 * pitch, 280, 0.045);
    this.playTone(660 * pitch, 990 * pitch, 220, 0.03);
  }

  private playTone(from: number, to: number, durationMs: number, gain: number): void {
    this.play({ frequency: from, slideTo: to, durationMs, type: "triangle", gain });
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
      [SFX_KEYS.crit]: { frequency: 720, slideTo: 1320, durationMs: 130, type: "triangle", gain: 0.055 * volume },
      [SFX_KEYS.combo]: { frequency: 480, slideTo: 920, durationMs: 150, type: "sine", gain: 0.05 * volume },
      [SFX_KEYS.drain]: { frequency: 280, slideTo: 520, durationMs: 180, type: "sine", gain: 0.048 * volume }
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
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
