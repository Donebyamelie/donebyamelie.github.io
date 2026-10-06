#!/usr/bin/env python3
"""
Resize + compress photos for the web.

Usage:
  pip install pillow
  python3 tools/optimize.py  ~/Desktop/originals/adidas  images/adidas
  python3 tools/optimize.py  ~/Desktop/originals/adidas  images/adidas --size 1800

Reads every JPG/PNG/WEBP in the first folder and writes numbered PNGs
(01.png, 02.png, ...) to the second, sorted by original filename.
Long edge defaults to 1800px, which stays sharp on retina without bloating the repo.
"""
import argparse, pathlib, sys
from PIL import Image, ImageOps

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("dest")
ap.add_argument("--size", type=int, default=1800)
a = ap.parse_args()

src, dest = pathlib.Path(a.src).expanduser(), pathlib.Path(a.dest)
files = sorted(p for p in src.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".heic"})
if not files:
    sys.exit(f"No images found in {src}")
dest.mkdir(parents=True, exist_ok=True)

def as_png(im):
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        return im.convert("RGBA")
    return im.convert("RGB")

for n, f in enumerate(files, 1):
    im = as_png(ImageOps.exif_transpose(Image.open(f)))
    im.thumbnail((a.size, a.size), Image.LANCZOS)
    out = dest / f"{n:02d}.png"
    im.save(out, format="PNG", optimize=True)
    print(f"{f.name} -> {out}  ({out.stat().st_size // 1024} KB)")

print("\nNow list these in data/projects.json:")
print('  "images": [' + ", ".join(f'"{dest.as_posix()}/{i:02d}.png"' for i in range(1, len(files) + 1)) + "]")
