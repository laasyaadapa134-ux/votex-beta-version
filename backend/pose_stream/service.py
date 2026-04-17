from __future__ import annotations

from pathlib import Path
from typing import Dict, List

from .fluent_pose_synthesis_adapter import build_fluent_pose_animation_data
from .lerp import concatenate_pose_sequences
from .library import collect_available_pose_files, library_available, load_pose_sequence
from .pose_format_adapter import build_pose_format_animation_data


def build_pose_animation_data(
    glosses: List[str],
    dictionary_path: str,
    transition_frames: int = 6,
    fps: int = 30,
    smoothing_engine: str = "lerp",
) -> Dict[str, object]:
    if smoothing_engine in {"pose-format", "pose_format", "savgol"}:
        return build_pose_format_animation_data(
            glosses=glosses,
            dictionary_path=dictionary_path,
            transition_frames=transition_frames,
            fps=fps,
        )

    if smoothing_engine == "fluent":
        return build_fluent_pose_animation_data(
            glosses=glosses,
            dictionary_path=dictionary_path,
            transition_frames=transition_frames,
            fps=fps,
        )

    cleaned_glosses = [gloss.strip().upper() for gloss in glosses if isinstance(gloss, str) and gloss.strip()]
    if not cleaned_glosses:
        raise ValueError("At least one gloss is required")

    if transition_frames < 0:
        raise ValueError("transition_frames must be zero or greater")

    available_glosses, pose_files, missing_glosses = collect_available_pose_files(cleaned_glosses, dictionary_path)
    if not available_glosses:
        raise FileNotFoundError(
            f"No pose files found for requested glosses in {Path(dictionary_path).expanduser().resolve()}"
        )

    sequence_payloads = []
    source_files = []

    for gloss, pose_file in zip(available_glosses, pose_files):
        source_files.append(str(pose_file))
        sequence_payloads.append(load_pose_sequence(gloss, dictionary_path))

    pose_stream = concatenate_pose_sequences(sequence_payloads, transition_frames)

    return {
        "glosses": available_glosses,
        "missing_glosses": missing_glosses,
        "dictionary_path": str(Path(dictionary_path).expanduser().resolve()),
        "source_files": source_files,
        "transition_frames": transition_frames,
        "fps": fps,
        "sequence_count": len(sequence_payloads),
        "frame_count": len(pose_stream),
        "library": "sign-language-processing" if library_available() else "json-fallback",
        "smoothing_engine": "lerp",
        "pose_stream": pose_stream,
    }