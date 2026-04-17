from __future__ import annotations

import importlib
from pathlib import Path
from typing import Any, Dict, Iterable, List, Sequence

from .library import collect_available_pose_files, library_available, load_pose_sequence


FLUENT_MODULE_CANDIDATES = (
    "fluent_pose_synthesis",
    "fluentposesynthesis",
)

SEQUENCE_API_NAMES = (
    "synthesize_pose_stream",
    "synthesize_sequence",
    "blend_pose_sequences",
    "blend_sequences",
    "smooth_sequences",
)


def get_fluent_pose_engine():
    for module_name in FLUENT_MODULE_CANDIDATES:
        try:
            module = importlib.import_module(module_name)
        except ImportError:
            continue

        for attr_name in SEQUENCE_API_NAMES:
            candidate = getattr(module, attr_name, None)
            if callable(candidate):
                return candidate, module_name

    return None, None


def fluent_pose_synthesis_available() -> bool:
    engine, _ = get_fluent_pose_engine()
    return engine is not None


def build_fluent_pose_animation_data(
    glosses: List[str],
    dictionary_path: str,
    transition_frames: int = 6,
    fps: int = 30,
) -> Dict[str, object]:
    cleaned_glosses = [gloss.strip().upper() for gloss in glosses if isinstance(gloss, str) and gloss.strip()]
    if not cleaned_glosses:
        raise ValueError("At least one gloss is required")

    if transition_frames < 0:
        raise ValueError("transition_frames must be zero or greater")

    engine, engine_module = get_fluent_pose_engine()
    if engine is None:
        raise ImportError(
            "fluent-pose-synthesis is not installed or does not expose a supported synthesis entry point"
        )

    available_glosses, pose_files, missing_glosses = collect_available_pose_files(cleaned_glosses, dictionary_path)
    if not available_glosses:
        raise FileNotFoundError(
            f"No pose files found for requested glosses in {Path(dictionary_path).expanduser().resolve()}"
        )

    sequence_payloads: List[List[dict[str, Any]]] = []
    source_files: List[str] = []

    for gloss, pose_file in zip(available_glosses, pose_files):
        source_files.append(str(pose_file))
        sequence_payloads.append(load_pose_sequence(gloss, dictionary_path))

    pose_stream = _run_fluent_synthesis(
        engine=engine,
        sequence_payloads=sequence_payloads,
        transition_frames=transition_frames,
        fps=fps,
    )

    return {
        "glosses": available_glosses,
        "missing_glosses": missing_glosses,
        "dictionary_path": str(Path(dictionary_path).expanduser().resolve()),
        "source_files": source_files,
        "transition_frames": transition_frames,
        "fps": fps,
        "sequence_count": len(sequence_payloads),
        "frame_count": len(pose_stream),
        "library": engine_module,
        "smoothing_engine": "fluent",
        "pose_stream": pose_stream,
        "pose_loader": "sign-language-processing" if library_available() else "json-fallback",
    }


def _run_fluent_synthesis(engine, sequence_payloads: Sequence[List[dict[str, Any]]], transition_frames: int, fps: int) -> List[dict[str, Any]]:
    attempts = [
        lambda: engine(sequence_payloads, transition_frames=transition_frames, fps=fps),
        lambda: engine(sequence_payloads=sequence_payloads, transition_frames=transition_frames, fps=fps),
        lambda: engine(sequence_payloads, transition_frames, fps),
        lambda: engine(sequence_payloads),
    ]

    last_error = None
    for attempt in attempts:
        try:
            result = attempt()
            return _coerce_synthesized_frames(result)
        except TypeError as exc:
            last_error = exc
            continue

    raise TypeError(f"Unsupported fluent-pose-synthesis API signature: {last_error}")


def _coerce_synthesized_frames(data: Any) -> List[dict[str, Any]]:
    if isinstance(data, dict):
        frames = data.get("frames") or data.get("pose_stream") or data.get("sequence")
        if isinstance(frames, list):
            return [frame for frame in frames if isinstance(frame, dict)]

    if isinstance(data, Sequence) and not isinstance(data, (str, bytes, bytearray)):
        return [frame for frame in data if isinstance(frame, dict)]

    raise ValueError("fluent-pose-synthesis returned an unsupported frame payload")