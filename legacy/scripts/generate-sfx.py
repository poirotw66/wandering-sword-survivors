#!/usr/bin/env python3
"""Generate short wuxia-style SFX wav files for the game."""

from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public/assets/audio/wuxia"
SAMPLE_RATE = 22050


def write_wav(path: Path, samples: list[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "w") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for sample in samples:
            clipped = max(-1.0, min(1.0, sample))
            frames.extend(struct.pack("<h", int(clipped * 32767)))
        wav_file.writeframes(frames)


def envelope(length: int, attack: float, release: float) -> list[float]:
    env: list[float] = []
    for index in range(length):
        t = index / length
        if t < attack:
            env.append(t / attack)
        else:
            env.append(max(0.0, 1.0 - (t - attack) / release))
    return env


def noise_burst(duration_ms: int, gain: float = 0.35) -> list[float]:
    length = int(SAMPLE_RATE * duration_ms / 1000)
    env = envelope(length, 0.02, 0.7)
    return [random.uniform(-1.0, 1.0) * env[i] * gain for i in range(length)]


def tone_slide(start_hz: float, end_hz: float, duration_ms: int, gain: float = 0.2) -> list[float]:
    length = int(SAMPLE_RATE * duration_ms / 1000)
    env = envelope(length, 0.03, 0.8)
    samples: list[float] = []
    for index in range(length):
        t = index / SAMPLE_RATE
        progress = index / max(1, length - 1)
        freq = start_hz + (end_hz - start_hz) * progress
        samples.append(math.sin(2 * math.pi * freq * t) * env[index] * gain)
    return samples


def mix(*tracks: list[float]) -> list[float]:
    max_len = max(len(track) for track in tracks)
    merged = [0.0] * max_len
    for track in tracks:
        for index, value in enumerate(track):
            merged[index] += value
    peak = max(abs(value) for value in merged) or 1.0
    if peak > 0.95:
        merged = [value / peak * 0.95 for value in merged]
    return merged


def main() -> None:
    write_wav(OUTPUT_DIR / "sfx-hit.wav", mix(noise_burst(90, 0.28), tone_slide(420, 180, 90, 0.12)))
    write_wav(OUTPUT_DIR / "sfx-sword.wav", mix(tone_slide(720, 260, 110, 0.18), noise_burst(110, 0.16)))
    write_wav(OUTPUT_DIR / "sfx-level-up.wav", mix(tone_slide(330, 880, 220, 0.22), tone_slide(660, 1180, 180, 0.14)))
    write_wav(OUTPUT_DIR / "sfx-pickup.wav", tone_slide(880, 1240, 120, 0.18))
    write_wav(OUTPUT_DIR / "sfx-heal.wav", tone_slide(520, 760, 160, 0.2))
    write_wav(OUTPUT_DIR / "sfx-hurt.wav", mix(tone_slide(180, 70, 180, 0.24), noise_burst(120, 0.12)))
    write_wav(OUTPUT_DIR / "sfx-boss.wav", mix(tone_slide(180, 520, 320, 0.24), noise_burst(220, 0.1)))
    write_wav(OUTPUT_DIR / "sfx-evolution.wav", mix(tone_slide(540, 980, 260, 0.22), tone_slide(720, 1320, 180, 0.12)))
    print(f"generated {len(list(OUTPUT_DIR.glob('*.wav')))} files in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
