"""Download each bank's logo from Wikimedia Commons and cut out its symbol for the round bank badges.

Commons renders each SVG to PNG (thumb.php). The script keeps the symbol, drops the wordmark, centres it on a
square transparent canvas and writes public/banks/<bank>.webp. Sources and licences are listed in the README.

Usage:
    python3 scripts/fetch_bank_logos.py            # all banks
    python3 scripts/fetch_bank_logos.py kb hana    # some banks
Needs Pillow.
"""
import io
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

UA = "DashHourPrototype/0.1 (https://github.com/subwaymatch/dashhour-prototype; bank logos)"
OUT = Path(__file__).resolve().parent.parent / "public" / "banks"
SIZE = 192

# bank: (Commons file, render width, how to cut out the symbol)
#   left    the first group of ink from the left, up to a clear gap (symbol beside a wordmark)
#   colour  only saturated pixels (coloured symbol beside a black or grey wordmark)
#   arc     everything up to the right end of the red arc (Citi)
#   whole   the file is already just the symbol
LOGOS = {
    "shinhan": ("Shinhan Bank Logo (ENG).svg", 2400, "left"),
    "woori": ("Logo of Woori Bank.svg", 2400, "left"),
    "hana": ("Hana Bank Logo (eng).svg", 2400, "colour"),
    "kb": ("KB logo.svg", 1200, "colour"),
    "ibk": ("Industrial Bank of Korea Logo.svg", 1600, "left"),
    "nh": ("NACF (NongHyup) Logo.svg", 600, "whole"),
    "citi": ("Citibank.svg", 1200, "arc"),
    "sc": ("Standard Chartered Logo (2021, Logo only).svg", 600, "whole"),
}


def fetch(name: str, width: int) -> Image.Image:
    query = urllib.parse.urlencode({"f": name.replace(" ", "_"), "w": width})
    request = urllib.request.Request(f"https://commons.wikimedia.org/w/thumb.php?{query}", headers={"User-Agent": UA})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(request, timeout=60) as r:
                return Image.open(io.BytesIO(r.read())).convert("RGBA")
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            time.sleep(int(e.headers.get("Retry-After") or 0) or 20 * 2**attempt)
    raise RuntimeError(f"Commons kept rate-limiting {name}")


def left(im: Image.Image) -> Image.Image:
    alpha = im.getchannel("A").load()
    ink = [any(alpha[x, y] > 40 for y in range(im.height)) for x in range(im.width)]
    start = ink.index(True)
    min_gap = max(4, int(im.height * 0.06))
    gap = 0
    for x in range(start, im.width):
        gap = 0 if ink[x] else gap + 1
        if gap >= min_gap:
            return im.crop((start, 0, x - gap + 1, im.height))
    return im


def colour(im: Image.Image) -> Image.Image:
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and max(r, g, b) - min(r, g, b) < 60:
                px[x, y] = (0, 0, 0, 0)
    return im


def arc(im: Image.Image) -> Image.Image:
    px = im.load()
    reds = [x for x in range(im.width) for y in range(im.height // 2) if px[x, y][3] > 100 and px[x, y][0] > 180 and px[x, y][2] < 120]
    return im.crop((0, 0, max(reds) + int(im.height * 0.04), im.height))


def squared(im: Image.Image) -> Image.Image:
    im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 40 else 0).getbbox())
    side = max(im.size)
    canvas = Image.new("RGBA", (side, side))
    canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2), im)
    return canvas.resize((SIZE, SIZE), Image.LANCZOS)


CUTS = {"left": left, "colour": colour, "arc": arc, "whole": lambda im: im}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for bank in sys.argv[1:] or LOGOS:
        name, width, cut = LOGOS[bank]
        squared(CUTS[cut](fetch(name, width))).save(OUT / f"{bank}.webp", "WEBP", quality=92, method=6)
        print(f"{bank}: {name}")
        time.sleep(2)
