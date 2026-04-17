from __future__ import annotations

from copy import deepcopy
from typing import Any, Iterable, List


def lerp_number(start: float, end: float, alpha: float) -> float:
    return start + (end - start) * alpha


def lerp_value(start: Any, end: Any, alpha: float):
    if isinstance(start, (int, float)) and isinstance(end, (int, float)):
        return lerp_number(float(start), float(end), alpha)

    if isinstance(start, dict) and isinstance(end, dict):
        merged = {}
        keys = set(start) | set(end)
        for key in keys:
            if key in start and key in end:
                merged[key] = lerp_value(start[key], end[key], alpha)
            elif key in start:
                merged[key] = deepcopy(start[key])
            else:
                merged[key] = deepcopy(end[key])
        return merged

    if isinstance(start, list) and isinstance(end, list) and len(start) == len(end):
        return [lerp_value(start_item, end_item, alpha) for start_item, end_item in zip(start, end)]

    return deepcopy(end if alpha >= 0.5 else start)


def generate_transition_frames(start_frame: dict[str, Any], end_frame: dict[str, Any], frame_count: int) -> List[dict[str, Any]]:
    if frame_count <= 0:
        return []

    frames: List[dict[str, Any]] = []
    for step in range(1, frame_count + 1):
        alpha = step / (frame_count + 1)
        frame = lerp_value(start_frame, end_frame, alpha)
        if isinstance(frame, dict):
            frames.append(frame)
    return frames


def concatenate_pose_sequences(sequences: Iterable[list[dict[str, Any]]], transition_frames: int) -> List[dict[str, Any]]:
    stream: List[dict[str, Any]] = []
    previous_sequence: list[dict[str, Any]] | None = None

    for sequence in sequences:
        if not sequence:
            continue
        
        # Filter out empty "space" frames from the sequence
        filtered_sequence = []
        for frame in sequence:
            if "poseLandmarks" in frame:
                has_valid_data = any(
                    abs(lm.get("x", 0)) > 0.01 or abs(lm.get("y", 0)) > 0.01 or abs(lm.get("z", 0)) > 0.01
                    for lm in frame["poseLandmarks"]
                )
                if has_valid_data:
                    filtered_sequence.append(frame)
            else:
                filtered_sequence.append(frame)
        
        if not filtered_sequence:
            continue

        if previous_sequence is not None:
            stream.extend(
                generate_transition_frames(
                    previous_sequence[-1],
                    filtered_sequence[0],
                    transition_frames,
                )
            )

        stream.extend(deepcopy(filtered_sequence))
        previous_sequence = filtered_sequence

    return stream