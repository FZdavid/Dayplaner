"""Erzeugt die App-Icons in public/icons (einmalig, benötigt Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

TOP, BOTTOM = (255, 159, 67), (238, 82, 120)  # warmer Verlauf


def icon(size: int, padding: float) -> Image.Image:
    img = Image.new("RGB", (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        d.line([(0, y), (size, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(TOP, BOTTOM)))
    s = size * (1 - 2 * padding)
    x0, y0 = size * padding + s * 0.18, size * padding + s * 0.12
    x1, y1 = size * padding + s * 0.82, size * padding + s * 0.88
    r = s * 0.07
    d.rounded_rectangle([x0, y0, x1, y1], radius=r, fill="white")
    # Bindung
    d.rounded_rectangle([x0, y0, x0 + s * 0.1, y1], radius=r, fill=(255, 226, 214))
    # Zeilen
    lw = max(2, round(s * 0.035))
    for i, frac in enumerate((0.32, 0.47, 0.62)):
        y = y0 + (y1 - y0) * frac
        end = x1 - s * (0.09 if i < 2 else 0.2)
        d.rounded_rectangle([x0 + s * 0.17, y - lw / 2, end, y + lw / 2], radius=lw / 2, fill=(238, 82, 120))
    return img


icon(180, 0.06).save(OUT / "apple-touch-icon.png")
icon(192, 0.06).save(OUT / "icon-192.png")
icon(512, 0.06).save(OUT / "icon-512.png")
icon(512, 0.16).save(OUT / "icon-maskable-512.png")
print("Icons geschrieben nach", OUT)
