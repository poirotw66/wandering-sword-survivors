import { readAudioSettings } from "../data/audioSettings";

export type WuxiaBgmMode = "hub" | "combat" | "boss";

const PENTATONIC = [196, 220, 262, 294, 330, 392, 440, 523];

type DroneVoice = {
  oscillator: OscillatorNode;
  gain: GainNode;
};

export class WuxiaBgmSystem {
  private static instance?: WuxiaBgmSystem;

  private context?: AudioContext;
  private masterGain?: GainNode;
  private unlocked = false;
  private mode: WuxiaBgmMode | null = null;
  private drones: DroneVoice[] = [];
  private melodyTimer?: ReturnType<typeof setInterval>;
  private pulseTimer?: ReturnType<typeof setInterval>;
  private duckRestoreTimer?: ReturnType<typeof setTimeout>;
  private bossPulseGain?: GainNode;

  static shared(): WuxiaBgmSystem {
    WuxiaBgmSystem.instance ??= new WuxiaBgmSystem();
    return WuxiaBgmSystem.instance;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  currentMode(): WuxiaBgmMode | null {
    return this.mode;
  }

  unlock(): void {
    void this.unlockAsync();
  }

  private async unlockAsync(): Promise<void> {
    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    this.context ??= new AudioContextCtor();
    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    if (!this.masterGain) {
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.0001;
      this.masterGain.connect(this.context.destination);
    }

    this.unlocked = true;
    if (this.mode) {
      this.applyMode(this.mode);
    }
  }

  setMode(mode: WuxiaBgmMode | null): void {
    if (mode === this.mode) {
      if (this.unlocked && mode) {
        this.refreshVolume();
      }
      return;
    }
    this.mode = mode;
    if (!this.unlocked || !mode) {
      this.stopVoices();
      return;
    }
    this.applyMode(mode);
  }

  refreshVolume(): void {
    if (!this.context || !this.masterGain || !this.unlocked || !this.mode) {
      return;
    }
    const now = this.context.currentTime;
    const target = Math.max(this.targetGain(), 0.0001);
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.0001), now);
    this.masterGain.gain.exponentialRampToValueAtTime(target, now + 0.25);
  }

  duck(durationMs: number, ratio = 0.16): void {
    if (!this.context || !this.masterGain) {
      return;
    }

    const now = this.context.currentTime;
    const ducked = Math.max(this.targetGain() * ratio, 0.0001);
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.0001), now);
    this.masterGain.gain.exponentialRampToValueAtTime(ducked, now + 0.14);

    if (this.duckRestoreTimer) {
      clearTimeout(this.duckRestoreTimer);
    }
    this.duckRestoreTimer = setTimeout(() => this.restoreGain(), durationMs);
  }

  dispose(): void {
    this.setMode(null);
    this.masterGain?.disconnect();
    this.masterGain = undefined;
    this.context?.close();
    this.context = undefined;
    this.unlocked = false;
    WuxiaBgmSystem.instance = undefined;
  }

  private applyMode(mode: WuxiaBgmMode): void {
    this.stopVoices();
    if (!this.context || !this.masterGain) {
      return;
    }

    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(Math.max(this.targetGain(), 0.0001), now + 0.55);

    if (mode === "hub") {
      this.startHub();
    } else if (mode === "combat") {
      this.startCombat();
    } else {
      this.startBoss();
    }
    this.playModeIntro(mode);
  }

  private targetGain(): number {
    const settings = readAudioSettings();
    if (settings.muted) {
      return 0;
    }
    const base = 0.34 * settings.musicVolume;
    if (this.mode === "hub") {
      return base * 0.85;
    }
    if (this.mode === "boss") {
      return base * 1.08;
    }
    return base;
  }

  private restoreGain(): void {
    if (!this.context || !this.masterGain) {
      return;
    }
    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.0001), now);
    this.masterGain.gain.exponentialRampToValueAtTime(Math.max(this.targetGain(), 0.0001), now + 0.45);
    this.duckRestoreTimer = undefined;
  }

  private startHub(): void {
    this.addDrone(110, 0.1, "sine");
    this.addDrone(165, 0.065, "sine");
    this.addDrone(220, 0.045, "triangle");
    this.melodyTimer = setInterval(() => {
      const freq = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
      this.pluck(freq, 1.4, 0.07, "triangle");
    }, 2000);
  }

  private startCombat(): void {
    this.addDrone(82.4, 0.085, "sine");
    this.addDrone(110, 0.07, "sine");
    this.addDrone(196, 0.045, "triangle");
    let step = 0;
    this.melodyTimer = setInterval(() => {
      const freq = PENTATONIC[step % PENTATONIC.length];
      step += Math.random() < 0.35 ? 2 : 1;
      this.pluck(freq, 0.55, 0.075, "triangle");
      if (step % 2 === 0) {
        this.pluck(PENTATONIC[(step + 3) % PENTATONIC.length], 0.35, 0.035, "sine");
      }
    }, 1100);
    this.pulseTimer = setInterval(() => this.pluck(880, 0.06, 0.02, "square"), 650);
  }

  private startBoss(): void {
    this.addDrone(55, 0.1, "sawtooth");
    this.addDrone(82.4, 0.085, "sawtooth");
    this.addDrone(110, 0.07, "triangle");
    this.addDrone(147, 0.05, "sine");

    if (this.context && this.masterGain) {
      this.bossPulseGain = this.context.createGain();
      this.bossPulseGain.gain.value = 1;
      this.bossPulseGain.connect(this.masterGain);
      const now = this.context.currentTime;
      this.bossPulseGain.gain.setValueAtTime(0.82, now);
      this.bossPulseGain.gain.linearRampToValueAtTime(1, now + 0.45);
    }

    let step = 0;
    this.melodyTimer = setInterval(() => {
      const freq = PENTATONIC[step % PENTATONIC.length] * (Math.random() < 0.2 ? 0.5 : 1);
      step += 1;
      this.pluck(freq, 0.42, 0.085, "sawtooth");
      this.pluck(freq * 1.5, 0.28, 0.04, "triangle");
    }, 720);
    this.pulseTimer = setInterval(() => {
      this.pluck(130, 0.12, 0.05, "square");
      if (this.bossPulseGain && this.context) {
        const now = this.context.currentTime;
        this.bossPulseGain.gain.cancelScheduledValues(now);
        this.bossPulseGain.gain.setValueAtTime(0.76, now);
        this.bossPulseGain.gain.linearRampToValueAtTime(1, now + 0.32);
      }
    }, 480);
  }

  private addDrone(frequency: number, gain: number, type: OscillatorType): void {
    if (!this.context || !this.masterGain) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const voiceGain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    voiceGain.gain.value = gain;
    oscillator.connect(voiceGain);
    voiceGain.connect(this.bossPulseGain ?? this.masterGain);
    oscillator.start();
    this.drones.push({ oscillator, gain: voiceGain });
  }

  private pluck(frequency: number, durationSec: number, gain: number, type: OscillatorType): void {
    if (!this.context || !this.masterGain) {
      return;
    }

    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const voiceGain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.92, now + durationSec * 0.85);
    voiceGain.gain.setValueAtTime(0.0001, now);
    voiceGain.gain.exponentialRampToValueAtTime(gain, now + 0.02);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
    oscillator.connect(voiceGain);
    voiceGain.connect(this.bossPulseGain ?? this.masterGain);
    oscillator.start(now);
    oscillator.stop(now + durationSec + 0.04);
  }

  private playModeIntro(mode: WuxiaBgmMode): void {
    if (mode === "hub") {
      this.pluck(PENTATONIC[2], 1.6, 0.09, "triangle");
      this.pluck(PENTATONIC[4], 1.2, 0.06, "sine");
      return;
    }
    if (mode === "combat") {
      this.pluck(PENTATONIC[0], 0.7, 0.08, "triangle");
      this.pluck(PENTATONIC[3], 0.5, 0.055, "triangle");
      return;
    }
    this.pluck(98, 0.35, 0.1, "sawtooth");
    this.pluck(147, 0.28, 0.07, "square");
  }

  private stopVoices(): void {
    if (this.duckRestoreTimer) {
      clearTimeout(this.duckRestoreTimer);
      this.duckRestoreTimer = undefined;
    }
    if (this.melodyTimer) {
      clearInterval(this.melodyTimer);
      this.melodyTimer = undefined;
    }
    if (this.pulseTimer) {
      clearInterval(this.pulseTimer);
      this.pulseTimer = undefined;
    }
    for (const drone of this.drones) {
      try {
        drone.oscillator.stop();
        drone.oscillator.disconnect();
        drone.gain.disconnect();
      } catch {
        // ponytail: drone may already be stopped when switching BGM modes
      }
    }
    this.drones = [];
    this.bossPulseGain?.disconnect();
    this.bossPulseGain = undefined;
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
