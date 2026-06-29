#!/usr/bin/env python3
"""Process generated game sprites: chroma-key black, resize, copy to public/."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/Users/cfh00896102/.cursor/projects/Users-cfh00896102-Github-openab/assets")
SPRITE_DIR = ROOT / "public/assets/sprites/wuxia"
ICON_DIR = ROOT / "public/assets/icons/wuxia"

MINION_FILES = [
    "enemy-huashan.png",
    "enemy-hengshan.png",
    "enemy-taishan.png",
    "enemy-river-bandit.png",
    "enemy-medicine-heretic.png",
    "enemy-sun-moon.png",
    "enemy-royal-guard.png",
    "enemy-wudang.png",
    "enemy-shaolin.png",
    "enemy-emei.png",
    "enemy-beggar.png",
    "enemy-northern-rider.png",
    "enemy-poison-cult.png",
]

BOSS_FILES = [
    "boss-rival-captain.png",
    "boss-renegade-master.png",
    "boss-grand-elder.png",
    "boss-demonic-overlord.png",
    "boss-eastern-invincible.png",
]

ICON_FILES = [
    "icon-marrow-cleansing.png",
    "icon-damage.png",
    "icon-cooldown.png",
    "icon-speed.png",
    "icon-pickup.png",
    "icon-heal.png",
]

VFX_FILES = [
    "star-vortex.png",
]


def remove_black_background(image: Image.Image, threshold: int = 40) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if red <= threshold and green <= threshold and blue <= threshold:
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def fit_square(image: Image.Image, size: int) -> Image.Image:
    rgba = image.convert("RGBA")
    bbox = rgba.getbbox()
    if bbox is None:
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cropped = rgba.crop(bbox)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    scale = min(size / cropped.width, size / cropped.height) * 0.9
    target = (
        max(1, int(cropped.width * scale)),
        max(1, int(cropped.height * scale)),
    )
    resized = cropped.resize(target, Image.Resampling.LANCZOS)
    offset = ((size - target[0]) // 2, (size - target[1]) // 2)
    canvas.paste(resized, offset, resized)
    return canvas


def process_file(filename: str, destination: Path, size: int) -> None:
    source_path = SOURCE / filename
    if not source_path.exists():
        raise FileNotFoundError(f"Missing generated asset: {source_path}")
    image = Image.open(source_path)
    processed = fit_square(remove_black_background(image), size)
    destination.parent.mkdir(parents=True, exist_ok=True)
    processed.save(destination, format="PNG")
    print(f"saved {destination.relative_to(ROOT)} ({size}x{size})")


def main() -> None:
    for filename in MINION_FILES:
        process_file(filename, SPRITE_DIR / filename, 512)
    for filename in BOSS_FILES:
        process_file(filename, SPRITE_DIR / filename, 768)
    for filename in ICON_FILES:
        process_file(filename, ICON_DIR / filename, 512)
    for filename in VFX_FILES:
        process_file(filename, SPRITE_DIR / filename, 192)
    print("done")


if __name__ == "__main__":
    main()
