from pathlib import Path

from PIL import Image, ImageDraw

ASSETS = Path(__file__).resolve().parent.parent / "assets"
BG = (10, 10, 15, 255)
ACCENT = (99, 102, 241, 255)
LIGHT = (226, 232, 240, 255)


def save_icon(path: Path, size: int) -> None:
    img = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)
    margin = size // 8
    draw.rounded_rectangle(
        (margin, margin, size - margin, size - margin),
        radius=size // 5,
        fill=ACCENT,
    )
    inner = size // 3
    draw.ellipse(
        (size // 2 - inner // 2, size // 2 - inner // 2, size // 2 + inner // 2, size // 2 + inner // 2),
        fill=LIGHT,
    )
    img.save(path, format="PNG")


def save_splash(path: Path) -> None:
    width, height = 1284, 2778
    img = Image.new("RGBA", (width, height), BG)
    draw = ImageDraw.Draw(img)
    logo = 320
    left = (width - logo) // 2
    top = (height - logo) // 2
    draw.rounded_rectangle(
        (left, top, left + logo, top + logo),
        radius=logo // 5,
        fill=ACCENT,
    )
    inner = logo // 3
    cx, cy = width // 2, height // 2
    draw.ellipse(
        (cx - inner // 2, cy - inner // 2, cx + inner // 2, cy + inner // 2),
        fill=LIGHT,
    )
    img.save(path, format="PNG")


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    save_icon(ASSETS / "icon.png", 1024)
    save_icon(ASSETS / "adaptive-icon.png", 1024)
    save_splash(ASSETS / "splash.png")
    save_icon(ASSETS / "favicon.png", 48)
    print("Generated assets in", ASSETS)


if __name__ == "__main__":
    main()
