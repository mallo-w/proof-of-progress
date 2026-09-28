"""Generate a minimalist black/white 'P' favicon for Proof of Progress.

Produces:
  - src/app/icon.png       (512x512, auto-detected by Next.js App Router)
  - src/app/favicon.ico    (multi-size .ico: 16/32/48)
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(HERE, "..", "src", "app")

BG = (0, 0, 0, 255)       # black
FG = (255, 255, 255, 255)  # white


def _load_font(size: int):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def render(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)
    # Rounded-ish look: keep pure black square (matches app aesthetic).
    font = _load_font(int(size * 0.78))
    letter = "P"
    bbox = draw.textbbox((0, 0), letter, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1]
    draw.text((x, y), letter, font=font, fill=FG)
    return img


def main():
    big = render(512)
    big.save(os.path.join(APP_DIR, "icon.png"), format="PNG")

    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    render(48).save(
        os.path.join(APP_DIR, "favicon.ico"),
        format="ICO",
        sizes=ico_sizes,
    )
    print("Favicon assets generated in", os.path.normpath(APP_DIR))


if __name__ == "__main__":
    main()
