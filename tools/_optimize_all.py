"""Optimize every images/project-* folder and point projects.json at the PNGs.

Numbered files already in a folder are parked so they are not treated as sources.
Gallery order in projects.json is preserved.
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
PROJECTS = ROOT / "data" / "projects.json"
STASH = ROOT / "_old_numbered_stash"
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}
NUMBERED = re.compile(r"^\d{2}\.(jpg|jpeg|png)$", re.I)


def main() -> None:
    data = json.loads(PROJECTS.read_text(encoding="utf-8"))
    if STASH.exists():
        shutil.rmtree(STASH)
    STASH.mkdir()
    plans = []

    for project in data["projects"]:
        slug = project["slug"]
        folder = IMAGES / slug
        if not folder.is_dir():
            sys.exit(f"Missing folder: {folder}")

        parked = STASH / slug
        for path in list(folder.iterdir()):
            if path.is_file() and NUMBERED.match(path.name):
                parked.mkdir(parents=True, exist_ok=True)
                dest = parked / path.name
                if dest.exists():
                    dest.unlink()
                shutil.move(str(path), dest)
                print(f"stashed {slug}/{path.name}", flush=True)

        sources = sorted(
            p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in EXTS
        )
        if not sources:
            sys.exit(f"No source images in {folder}")

        old_names = [Path(item).name for item in project["images"]]
        missing = [name for name in old_names if name not in {p.name for p in sources}]
        if missing:
            sys.exit(f"{slug} projects.json names not on disk: {missing}")

        print(f"\n=== {slug} ({len(sources)} images) ===", flush=True)
        subprocess.run(
            [sys.executable, str(ROOT / "tools" / "optimize.py"), str(folder), str(folder)],
            check=True,
        )

        name_to_new = {p.name: f"{i:02d}.png" for i, p in enumerate(sources, 1)}
        project["images"] = [f"images/{slug}/{name_to_new[name]}" for name in old_names]

        for image in project["images"]:
            if not (ROOT / image).is_file():
                sys.exit(f"Missing optimized file: {image}")

        plans.append(sources)

    PROJECTS.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

    for sources in plans:
        for path in sources:
            if path.exists():
                path.unlink()
                print(f"removed {path.parent.name}/{path.name}", flush=True)

    shutil.rmtree(STASH)
    print("\nDone.", flush=True)


if __name__ == "__main__":
    main()
