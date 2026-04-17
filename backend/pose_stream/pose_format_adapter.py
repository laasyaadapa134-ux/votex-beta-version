from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Sequence, Tuple

import numpy as np

from .lerp import concatenate_pose_sequences
from .library import collect_available_pose_files

try:
    from pose_format import Pose
    from pose_format.numpy import NumPyPoseBody
except ImportError:
    Pose = None
    NumPyPoseBody = None

try:
    from scipy.signal import savgol_filter
except ImportError:
    savgol_filter = None


MEDIAPIPE_POSE_SIZE = 33

# Complete mapping from pose file point names to MediaPipe Pose landmark indices
OPENPOSE_TO_MEDIAPIPE_POSE = {
    # Face landmarks
    "Nose": 0,
    "LEye": 2,
    "LEyeInner": 1,
    "LEyeOuter": 3,
    "REye": 5,
    "REyeInner": 4,
    "REyeOuter": 6,
    "LEar": 7,
    "REar": 8,
    "MouthLeft": 9,
    "MouthRight": 10,
    "Mouth": 10,
    
    # Upper body
    "LShoulder": 11,
    "RShoulder": 12,
    "LElbow": 13,
    "RElbow": 14,
    "LWrist": 15,
    "RWrist": 16,
    
    # Hand connections (these are on the wrist/hand boundary)
    "LPinky": 17,
    "LPinky1Knuckles": 17,
    "RPinky": 18,
    "RPinky1Knuckles": 18,
    "LIndex": 19,
    "LIndex1Knuckles": 19,
    "RIndex": 20,
    "RIndex1Knuckles": 20,
    "LThumb": 21,
    "LThumb4FingerTip": 21,
    "RThumb": 22,
    "RThumb4FingerTip": 22,
    
    # Lower body
    "LHip": 23,
    "RHip": 24,
    "LKnee": 25,
    "RKnee": 26,
    "LAnkle": 27,
    "RAnkle": 28,
    "LHeel": 29,
    "RHeel": 30,
    "LFootIndex": 31,
    "LBigToe": 31,
    "LSmallToe": 31,
    "RFootIndex": 32,
    "RBigToe": 32,
    "RSmallToe": 32,
    
    # Additional mappings for head/neck
    "UpperNeck": 0,  # Map to nose as approximation
    "HeadTop": 0,
}


def pose_format_available() -> bool:
    return Pose is not None and NumPyPoseBody is not None and savgol_filter is not None


def build_pose_format_animation_data(
    glosses: List[str],
    dictionary_path: str,
    transition_frames: int = 6,
    fps: int = 60,
    smoothing_window: int = 7,
    polyorder: int = 2,
) -> Dict[str, object]:
    if not pose_format_available():
        raise ImportError("pose-format and scipy must be installed to use the pose_format smoothing engine")

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

    sequence_payloads: List[List[dict[str, Any]]] = []
    source_files: List[str] = []

    for gloss, pose_file in zip(available_glosses, pose_files):
        source_files.append(str(pose_file))
        pose = load_pose_file(str(pose_file))
        smoothed_pose = smooth_pose_hands(pose, window_length=smoothing_window, polyorder=polyorder)
        interpolated_pose = interpolate_pose(smoothed_pose, target_fps=fps)
        
        # Convert to MediaPipe frames
        frames = pose_to_mediapipe_frames(interpolated_pose)
        
        # IMPORTANT: Extend short signs so they're visible (minimum 1.2 seconds)
        min_duration = 1.2  # seconds
        min_frames = int(min_duration * fps)
        if len(frames) < min_frames:
            # Hold the last frame to reach minimum duration
            frames_to_add = min_frames - len(frames)
            if frames:
                last_frame = frames[-1]
                frames.extend([last_frame.copy() for _ in range(frames_to_add)])
        
        sequence_payloads.append(frames)

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
        "library": "pose-format",
        "smoothing_engine": "pose-format",
        "pose_stream": pose_stream,
    }


def load_pose_file(file_path: str):
    if Pose is None:
        raise ImportError("pose-format is not installed")

    with open(file_path, "rb") as handle:
        return Pose.read(handle.read(), NumPyPoseBody)


def smooth_pose_hands(pose, window_length: int = 7, polyorder: int = 2):
    hand_ranges = get_hand_component_ranges(pose)
    if not hand_ranges:
        return pose

    data = np.ma.array(pose.body.data, copy=True)
    confidence = np.array(pose.body.confidence, copy=True)
    frame_count = data.shape[0]
    if frame_count < 3:
        return pose

    valid_window = min(window_length, frame_count if frame_count % 2 == 1 else frame_count - 1)
    if valid_window < 3:
        return pose

    valid_polyorder = min(polyorder, valid_window - 1)

    for start_index, end_index in hand_ranges:
        for person_index in range(data.shape[1]):
            for point_index in range(start_index, end_index):
                for dim_index in range(min(2, data.shape[-1])):
                    series = np.ma.filled(data[:, person_index, point_index, dim_index], np.nan)
                    smoothed = smooth_series(series, window_length=valid_window, polyorder=valid_polyorder)
                    data[:, person_index, point_index, dim_index] = smoothed

    return Pose(
        header=pose.header,
        body=NumPyPoseBody(fps=pose.body.fps, data=data, confidence=confidence),
    )


def smooth_series(values: np.ndarray, window_length: int, polyorder: int) -> np.ndarray:
    indices = np.arange(values.shape[0])
    valid = np.isfinite(values)
    if valid.sum() < max(polyorder + 1, 3):
        return np.nan_to_num(values, nan=0.0)

    filled = values.copy()
    filled[~valid] = np.interp(indices[~valid], indices[valid], values[valid])
    return savgol_filter(filled, window_length=window_length, polyorder=polyorder, mode="interp")


def interpolate_pose(pose, target_fps: int = 60):
    current_fps = float(getattr(pose.body, "fps", 0) or 0)
    if current_fps <= 0 or int(round(current_fps)) == int(target_fps):
        return pose

    data = np.ma.array(pose.body.data, copy=True)
    confidence = np.array(pose.body.confidence, copy=True)
    frame_count = data.shape[0]
    if frame_count < 2:
        return pose

    duration = (frame_count - 1) / current_fps
    new_frame_count = max(int(round(duration * target_fps)) + 1, frame_count)
    old_times = np.linspace(0.0, duration, num=frame_count)
    new_times = np.linspace(0.0, duration, num=new_frame_count)

    filled_data = np.ma.filled(data, np.nan)
    new_data = np.zeros((new_frame_count, *filled_data.shape[1:]), dtype=float)
    new_confidence = np.zeros((new_frame_count, *confidence.shape[1:]), dtype=float)

    for person_index in range(filled_data.shape[1]):
        for point_index in range(filled_data.shape[2]):
            for dim_index in range(filled_data.shape[3]):
                new_data[:, person_index, point_index, dim_index] = interpolate_series(
                    old_times,
                    new_times,
                    filled_data[:, person_index, point_index, dim_index],
                )

            new_confidence[:, person_index, point_index] = interpolate_series(
                old_times,
                new_times,
                confidence[:, person_index, point_index],
            )

    return Pose(
        header=pose.header,
        body=NumPyPoseBody(fps=float(target_fps), data=np.ma.array(new_data), confidence=new_confidence),
    )


def interpolate_series(old_times: np.ndarray, new_times: np.ndarray, values: np.ndarray) -> np.ndarray:
    valid = np.isfinite(values)
    if valid.sum() == 0:
        return np.zeros_like(new_times, dtype=float)
    if valid.sum() == 1:
        return np.full_like(new_times, fill_value=float(values[valid][0]), dtype=float)

    return np.interp(new_times, old_times[valid], values[valid]).astype(float)


def pose_to_mediapipe_frames(pose) -> List[dict[str, Any]]:
    ranges = get_component_ranges(pose)
    data = np.ma.filled(np.ma.array(pose.body.data), np.nan)
    person_index = 0
    frames: List[dict[str, Any]] = []
    width = float(getattr(pose.header.dimensions, "width", 1) or 1)
    height = float(getattr(pose.header.dimensions, "height", 1) or 1)
    depth = float(getattr(pose.header.dimensions, "depth", 0) or 0)

    for frame_index in range(data.shape[0]):
        frame_payload: dict[str, Any] = {}

        point_names = ranges.get("point_names", [])
        body_range = ranges.get("pose")
        if body_range:
            body_points = data[frame_index, person_index, body_range[0]:body_range[1], :]
            body_names = point_names[body_range[0]:body_range[1]] if point_names else []
            frame_payload["poseLandmarks"] = build_pose_landmark_list(body_points, body_names, width, height, depth)

        left_range = ranges.get("left_hand")
        if left_range:
            left_points = data[frame_index, person_index, left_range[0]:left_range[1], :]
            left_wrist = body_point_by_name(data[frame_index, person_index, :, :], point_names, "LWrist")
            frame_payload["leftHandLandmarks"] = build_hand_landmark_list(left_points, left_wrist, width, height, depth)

        right_range = ranges.get("right_hand")
        if right_range:
            right_points = data[frame_index, person_index, right_range[0]:right_range[1], :]
            right_wrist = body_point_by_name(data[frame_index, person_index, :, :], point_names, "RWrist")
            frame_payload["rightHandLandmarks"] = build_hand_landmark_list(right_points, right_wrist, width, height, depth)

        # Filter out empty "space" frames where all pose landmarks are at origin
        if frame_payload and "poseLandmarks" in frame_payload:
            pose_landmarks = frame_payload["poseLandmarks"]
            has_valid_data = any(
                abs(lm.get("x", 0)) > 0.01 or abs(lm.get("y", 0)) > 0.01 or abs(lm.get("z", 0)) > 0.01
                for lm in pose_landmarks
            )
            if has_valid_data:
                frames.append(frame_payload)
        elif frame_payload:
            frames.append(frame_payload)

    return frames


def build_landmark_list(points: np.ndarray, width: float, height: float, depth: float) -> List[dict[str, float]]:
    # USE THE FIXED build_landmark() FUNCTION INSTEAD OF DOING NORMALIZATION HERE!
    landmarks: List[dict[str, float]] = []
    for point in points:
        landmarks.append(build_landmark(point, width, height, depth))
    return landmarks


def build_pose_landmark_list(points: np.ndarray, point_names: List[str], width: float, height: float, depth: float) -> List[dict[str, float]]:
    # Initialize all landmarks to center/hidden in MediaPipe normalized coordinates (0.5, 0.5, 0.0)
    landmarks = [{"x": 0.5, "y": 0.5, "z": 0.0} for _ in range(MEDIAPIPE_POSE_SIZE)]
    
    if point_names and any(name in OPENPOSE_TO_MEDIAPIPE_POSE for name in point_names):
        for index, name in enumerate(point_names):
            target_index = OPENPOSE_TO_MEDIAPIPE_POSE.get(name)
            if target_index is None or index >= len(points):
                continue
            landmarks[target_index] = build_landmark(points[index], width, height, depth)
        return landmarks

    # Fallback if no names matched
    all_landmarks = build_landmark_list(points, width, height, depth)
    for i in range(min(len(all_landmarks), len(landmarks))):
        landmarks[i] = all_landmarks[i]
    return landmarks


def build_hand_landmark_list(points: np.ndarray, wrist_point: np.ndarray | None, width: float, height: float, depth: float) -> List[dict[str, float]]:
    landmarks = []
    if wrist_point is not None:
        landmarks.append(build_landmark(wrist_point, width, height, depth))

    landmarks.extend(build_landmark_list(points, width, height, depth))

    while len(landmarks) < 21:
        landmarks.append(landmarks[-1] if landmarks else {"x": 0.5, "y": 0.5, "z": 0.0})

    return landmarks[:21]


def build_landmark(point: np.ndarray, width: float, height: float, depth: float) -> dict[str, float]:
    """
    Convert BODY_135 coordinates to MediaPipe normalized coordinates (0-1).
    
    Final correct transformation based on testing:
    - X: Negate and normalize (0.5 - x/4) - verified correct
    - Y: Normalize without negation (0.5 + y/4) - verified correct
    """
    SCALE = 4.0
    
    if not np.isfinite(point[0]):
        x = 0.5
    else:
        x = 0.5 - (float(point[0]) / SCALE)
        x = max(0.0, min(1.0, x))
    
    if len(point) < 2 or not np.isfinite(point[1]):
        y = 0.5
    else:
        y = 0.5 + (float(point[1]) / SCALE)
        y = max(0.0, min(1.0, y))
    
    z = 0.0
    if len(point) > 2 and np.isfinite(point[2]):
        z = float(point[2]) / 4.0
    else:
        # Fake depth: arms naturally curve slightly forward
        if y > 0.5:
            z = -0.1
            
    return {"x": x, "y": y, "z": z}
    
    return {"x": x, "y": y, "z": z}


def body_point_by_name(all_points: np.ndarray, point_names: List[str], name: str) -> np.ndarray | None:
    if not point_names:
        return None
    try:
        point_index = point_names.index(name)
    except ValueError:
        return None
    return all_points[point_index]


def get_hand_component_ranges(pose) -> List[Tuple[int, int]]:
    ranges = get_component_ranges(pose)
    return [value for key, value in ranges.items() if key in {"left_hand", "right_hand"}]


def get_component_ranges(pose) -> Dict[str, Tuple[int, int]]:
    ranges: Dict[str, Tuple[int, int]] = {}
    offset = 0
    all_point_names: List[str] = []
    for component in pose.header.components:
        points = list(getattr(component, "points", []) or [])
        size = len(points)
        name = str(getattr(component, "name", "")).lower()
        component_range = (offset, offset + size)
        all_point_names.extend(points)

        if "left" in name and "hand" in name:
            ranges["left_hand"] = component_range
        elif "right" in name and "hand" in name:
            ranges["right_hand"] = component_range
        elif any(token in name for token in ("pose", "body", "keypoints")) and "face" not in name and "hand" not in name:
            ranges.setdefault("pose", component_range)

        embedded_ranges = get_embedded_component_ranges(points, offset)
        for key, value in embedded_ranges.items():
            ranges.setdefault(key, value)

        offset += size

    ranges["point_names"] = all_point_names
    return ranges


def get_embedded_component_ranges(points: List[str], offset: int) -> Dict[str, Tuple[int, int]]:
    ranges: Dict[str, Tuple[int, int]] = {}
    left_indices = [index for index, point in enumerate(points) if point.startswith("LThumb") or point.startswith("LIndex") or point.startswith("LMiddle") or point.startswith("LRing") or point.startswith("LPinky")]
    right_indices = [index for index, point in enumerate(points) if point.startswith("RThumb") or point.startswith("RIndex") or point.startswith("RMiddle") or point.startswith("RRing") or point.startswith("RPinky")]

    if left_indices:
        ranges["left_hand"] = (offset + min(left_indices), offset + max(left_indices) + 1)

    if right_indices:
        ranges["right_hand"] = (offset + min(right_indices), offset + max(right_indices) + 1)

    if left_indices or right_indices:
        body_end = min(left_indices + right_indices)
        if body_end > 0:
            ranges["pose"] = (offset, offset + body_end)

    return ranges
