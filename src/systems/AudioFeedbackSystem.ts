import Phaser from "phaser";

type TonePreset = {
  frequency: number;
  durationMs: number;
  type: OscillatorType;
  gain: number;
  slideTo?: number;
};

export class AudioFeedbackSystem {
  private context?: AudioContext;
  private unlocked = false;

  constructor(scene: Phaser.Scene) {
    scene.input.once("pointerdown", () => this.unlock());
    scene.input.keyboard?.once("keydown", () => this.unlock());

    scene.events.on("weapon-fired", (weaponId: string) => this.playWeapon(weaponId));
    scene.events.on("projectile-hit", () => this.play({ frequency: 180, slideTo: 120, durationMs: 80, type: "square", gain: 0.04 }));
    scene.events.on("exp-collected", () => this.play({ frequency: 740, slideTo: 980, durationMs: 90, type: "sine", gain: 0.035 }));
    scene.events.on("level-up", () => this.play({ frequency: 420, slideTo: 840, durationMs: 180, type: "triangle", gain: 0.055 }));
    scene.events.on("player-damaged", () => this.play({ frequency: 120, slideTo: 70, durationMs: 160, type: "sawtooth", gain: 0.06 }));
    scene.events.on("player-healed", () => this.play({ frequency: 520, slideTo: 680, durationMs: 140, type: "sine", gain: 0.045 }));
  }

  private unlock(): void {
    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    this.context ??= new AudioContextCtor();
    void this.context.resume();
    this.unlocked = true;
  }

  private playWeapon(weaponId: string): void {
    const presets: Record<string, TonePreset> = {
      magicBolt: { frequency: 360, slideTo: 620, durationMs: 70, type: "triangle", gain: 0.035 },
      flameWave: { frequency: 240, slideTo: 190, durationMs: 150, type: "sawtooth", gain: 0.035 },
      thunderStrike: { frequency: 980, slideTo: 420, durationMs: 120, type: "square", gain: 0.04 },
      orbitBlade: { frequency: 520, slideTo: 560, durationMs: 45, type: "sine", gain: 0.02 },
      starVortex: { frequency: 160, slideTo: 310, durationMs: 260, type: "triangle", gain: 0.04 }
    };
    this.play(presets[weaponId] ?? presets.magicBolt);
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
