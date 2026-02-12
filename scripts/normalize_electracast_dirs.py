"""Normalize ElectraCast directory names to match example structure."""

from __future__ import annotations

import shutil
from pathlib import Path

SUFFIXES = ("_Podcast_ElectraCast", "_Podcast_Networks_ElectraCast")
NAME_OVERRIDES = {
    "Alternative_Network": "Alternative_Podcast_Network",
}


def normalize(name: str) -> str:
    for suffix in SUFFIXES:
        if name.endswith(suffix):
            return name[: -len(suffix)]
    return name


def move_tree(source: Path, target: Path) -> None:
    target.mkdir(parents=True, exist_ok=True)
    for item in source.iterdir():
        dest = target / item.name
        if item.is_dir():
            move_tree(item, dest)
            continue
        if dest.exists():
            if dest.suffix.lower() in {".html", ".txt", ".png", ".jpg", ".jpeg"}:
                dest.unlink()
            else:
                continue
        dest.write_bytes(item.read_bytes())


def cleanup_directory(root: Path) -> None:
    for entry in root.iterdir():
        if not entry.is_dir():
            continue
        normalized = NAME_OVERRIDES.get(entry.name, normalize(entry.name))
        if normalized == entry.name:
            continue
        target = root / normalized
        if target.exists():
            move_tree(entry, target)
            shutil.rmtree(entry)
        else:
            entry.rename(target)


def main() -> None:
    base = Path("internal/Electracast_Codebase")
    for subdir in ("electracast_podcasts", "electracast_networks"):
        target = base / subdir
        if not target.exists():
            continue
        cleanup_directory(target)


if __name__ == "__main__":
    main()
