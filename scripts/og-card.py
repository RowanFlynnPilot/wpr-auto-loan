"""Generates public/og-card.png — the 1200x630 social share card
(og:image / twitter:image). One-time asset; rerun after a branding change:

    python scripts/og-card.py

Fetches the two brand fonts from the Google Fonts repo at generation time
(same as the Brewers tracker's card); nothing ships at runtime. The seal and
wordmark come from public/.
"""
import io
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
OUT = PUBLIC / "og-card.png"

CREAM = (246, 242, 233)
PAPER = (255, 253, 248)
INK = (30, 38, 36)
INK_SOFT = (85, 98, 94)
TEAL = (58, 134, 124)
TEAL_DEEP = (43, 102, 94)
SLATE = (50, 55, 60)

FRAUNCES = "https://github.com/google/fonts/raw/main/ofl/fraunces/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf"
PUBLIC_SANS = "https://github.com/google/fonts/raw/main/ofl/publicsans/PublicSans%5Bwght%5D.ttf"

# Sedan profile from BodyIcon, drawn as the card's only illustration.
SEDAN = [(8, 36), (6, 29), (12, 26), (38, 24), (50, 15), (76, 15), (88, 24), (108, 27), (114, 30), (114, 36)]
PILLAR = [(62, 15), (62, 24)]
WHEELS = [(32, 38), (90, 38)]


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def font(data: bytes, size: int, weight: int, opsz: float | None = None) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(io.BytesIO(data), size)
    axes = f.get_variation_axes()
    values = []
    for a in axes:
        name = a["name"] if isinstance(a, dict) else a.axis
        default = a["default"] if isinstance(a, dict) else a.default
        if name in (b"Weight", "Weight", b"wght", "wght"):
            values.append(weight)
        elif name in (b"Optical size", "Optical size", b"opsz", "opsz") and opsz is not None:
            values.append(opsz)
        else:
            values.append(default)
    f.set_variation_by_axes(values)
    return f


def main() -> None:
    fraunces, sans = fetch(FRAUNCES), fetch(PUBLIC_SANS)
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(img)

    # Masthead band, same as the tool's: pure white (the wordmark PNG has a
    # white background), slate rules, seal + wordmark.
    d.rectangle([0, 0, W, 112], fill=(255, 255, 255))
    d.rectangle([0, 0, W, 6], fill=SLATE)
    d.line([0, 112, W, 112], fill=SLATE, width=2)
    seal = Image.open(PUBLIC / "wpr-typewriter-badge.png").convert("RGBA").resize((64, 64), Image.LANCZOS)
    mark = Image.open(PUBLIC / "wpr-wordmark.png").convert("RGBA")
    mark = mark.resize((int(mark.width * 66 / mark.height), 66), Image.LANCZOS)
    total = 64 + 18 + mark.width
    x0 = (W - total) // 2
    img.paste(seal, (x0, 26), seal)
    img.paste(mark, (x0 + 64 + 18, 25), mark)

    # Headline and lede.
    eyebrow = font(sans, 22, 600)
    d.text((80, 168), "A  W A U S A U  P I L O T  &  R E V I E W  T O O L", font=eyebrow, fill=TEAL_DEEP)
    head = font(fraunces, 118, 600, opsz=144)
    d.text((76, 204), "What can I drive?", font=head, fill=INK)
    lede = font(sans, 30, 400)
    for k, line in enumerate([
        "Enter what you earn and what you can put down.",
        "We do the Wisconsin math — sales tax, title, plates,",
        "the Marathon County wheel tax — and show you what fits.",
    ]):
        d.text((80, 372 + k * 44), line, font=lede, fill=INK_SOFT)

    # Sedan line art, bottom right, in brand teal.
    sx, sy, sc = 790, 448, 3.4
    pts = [(sx + x * sc, sy + y * sc) for x, y in SEDAN]
    d.line(pts, fill=TEAL, width=7, joint="curve")
    d.line([(sx + x * sc, sy + y * sc) for x, y in PILLAR], fill=TEAL, width=7)
    for cx, cy in WHEELS:
        r = 7 * sc
        d.ellipse([sx + cx * sc - r, sy + cy * sc - r, sx + cx * sc + r, sy + cy * sc + r], outline=TEAL, width=7)

    img.save(OUT, optimize=True)
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
