from __future__ import annotations

import importlib
import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Iterable, List, Sequence, Tuple


LIBRARY_MODULE_CANDIDATES = (
    "sign_language_processing",
    "sign_language_processing.pose",
    "sign_language_processing.io",
)

LIBRARY_LOADER_NAMES = (
    "load_pose_file",
    "load_pose_sequence",
    "read_pose_file",
    "read_pose_sequence",
)


@lru_cache(maxsize=1)
def get_pose_library_loader():
    for module_name in LIBRARY_MODULE_CANDIDATES:
        try:
            module = importlib.import_module(module_name)
        except ImportError:
            continue

        for loader_name in LIBRARY_LOADER_NAMES:
            loader = getattr(module, loader_name, None)
            if callable(loader):
                return loader

    return None


def resolve_pose_file(gloss: str, dictionary_path: str | Path) -> Path:
    if not gloss:
        raise ValueError("Gloss cannot be empty")

    base_path = Path(dictionary_path).expanduser().resolve()
    if not base_path.exists() or not base_path.is_dir():
        raise FileNotFoundError(f"Pose dictionary not found: {base_path}")

    normalized = gloss.strip().lower().replace(" ", "_")
    candidates = [
        base_path / f"{normalized}.pose",
        base_path / f"{normalized}.json",
        base_path / gloss.strip().lower() / "index.pose",
        base_path / gloss.strip().upper() / "index.pose",
    ]

    for candidate in candidates:
        if candidate.exists():
            return candidate

    matches = list(base_path.rglob(f"{normalized}.pose"))
    if not matches:
        matches = list(base_path.rglob(f"{normalized}.json"))
    if matches:
        return matches[0]

    raise FileNotFoundError(f"No pose file found for gloss '{gloss}' in {base_path}")


def load_pose_sequence(gloss: str, dictionary_path: str | Path) -> List[dict[str, Any]]:
    pose_file = resolve_pose_file(gloss, dictionary_path)
    loader = get_pose_library_loader()

    if loader is not None:
        data = loader(str(pose_file))
    else:
        with pose_file.open("r", encoding="utf-8") as handle:
            data = json.load(handle)

    frames = coerce_pose_frames(data)
    if not frames:
        raise ValueError(f"Pose file for gloss '{gloss}' did not contain frames")
    return frames


def collect_available_pose_files(
        glosses: Iterable[str],
        dictionary_path: str | Path,
) -> Tuple[List[str], List[Path], List[str]]:
        available_glosses: List[str] = []
        source_files: List[Path] = []
        missing_glosses: List[str] = []

        for gloss in glosses:
            try:
                pose_file = resolve_pose_file(gloss, dictionary_path)
            except FileNotFoundError:
                missing_glosses.append(gloss)
                continue

            available_glosses.append(gloss)
            source_files.append(pose_file)

        return available_glosses, source_files, missing_glosses


def coerce_pose_frames(data: Any) -> List[dict[str, Any]]:
    if isinstance(data, dict):
        frames = data.get("frames")
        if isinstance(frames, list):
            return [frame for frame in frames if isinstance(frame, dict)]
        return [data]

    if isinstance(data, Sequence) and not isinstance(data, (str, bytes, bytearray)):
        return [frame for frame in data if isinstance(frame, dict)]

    raise ValueError("Unsupported pose sequence format")


def library_available() -> bool:
    return get_pose_library_loader() is not None