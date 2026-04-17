"""
MediaPipe JSON Pose Loader
Loads MediaPipe format JSON files directly (bypasses BODY_135 .pose files)
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List


def load_mediapipe_json(json_path: Path) -> Dict[str, Any]:
    """
    Load MediaPipe pose data from JSON file
    
    Returns dict with:
    - fps: frame rate
    - frame_count: number of frames
    - frames: list of frame data
    """
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    return {
        'fps': data.get('fps', 30),
        'frame_count': data.get('frame_count', len(data['frames'])),
        'frames': data['frames'],
        'word': data.get('word', json_path.stem)
    }


def build_mediapipe_json_animation_data(
    glosses: List[str],
    dictionary_path: Path,
    fps: int = 10,
    transition_frames: int = 4
) -> Dict[str, Any]:
    """
    Build animation data from MediaPipe JSON files
    
    This REPLACES pose_format_adapter.build_pose_format_animation_data()
    but loads from JSON instead of .pose files
    
    Args:
        glosses: List of words to animate (e.g., ['HELLO', 'HOW', 'ARE', 'YOU'])
        dictionary_path: Path to poses_mediapipe/ directory  
        fps: Target playback FPS
        transition_frames: Frames for interpolation between signs
        
    Returns:
        {
            'gloss_data': {
                'HELLO': [frame1, frame2, ...],
                'HOW': [frame1, frame2, ...],
                ...
            },
            'fps': 10,
            'frame_count': total_frames,
            'format': 'MediaPipe_JSON'
        }
    """
    
    gloss_data = {}
    total_frames = 0
    
    print(f"[MediaPipe JSON] Loading {len(glosses)} glosses from {dictionary_path}")
    
    for gloss in glosses:
        json_file = dictionary_path / f"{gloss}.json"
        
        if not json_file.exists():
            print(f"[!] {gloss}.json not found in {dictionary_path}")
            # Return empty frame data for missing signs
            gloss_data[gloss] = [{
                'pose_landmarks': [{'x': 0.5, 'y': 0.5, 'z': 0, 'visibility': 0}] * 33,
                'left_hand_landmarks': [],
                'right_hand_landmarks': []
            }]
            continue
        
        # Load JSON
        pose_data = load_mediapipe_json(json_file)
        frames = pose_data['frames']
        original_fps = pose_data['fps']
        
        print(f"  {gloss}: {len(frames)} frames at {original_fps:.1f} fps")
        
        # Resample to target FPS if needed
        if original_fps != fps:
            frames = resample_frames(frames, original_fps, fps)
        
        # Ensure minimum duration (1.2 seconds = 12 frames at 10 FPS)
        min_frames = int(1.2 * fps)
        if len(frames) < min_frames:
            # Hold last frame
            last_frame = frames[-1] if frames else {
                'pose_landmarks': [{'x': 0.5, 'y': 0.5, 'z': 0, 'visibility': 0}] * 33,
                'left_hand_landmarks': [],
                'right_hand_landmarks': []
            }
            frames.extend([last_frame] * (min_frames - len(frames)))
        
        gloss_data[gloss] = frames
        total_frames += len(frames)
    
    return {
        'gloss_data': gloss_data,
        'fps': fps,
        'frame_count': total_frames,
        'format': 'MediaPipe_JSON',
        'transition_frames': transition_frames
    }


def resample_frames(frames: List[Dict], source_fps: float, target_fps: float) -> List[Dict]:
    """
    Resample frames from source FPS to target FPS using simple interpolation
    """
    if source_fps == target_fps:
        return frames
    
    if not frames:
        return []
    
    # Calculate frame indices at target FPS
    duration = len(frames) / source_fps  # seconds
    target_frame_count = int(duration * target_fps)
    
    resampled = []
    for i in range(target_frame_count):
        # Map target frame to source frame
        source_time = i / target_fps
        source_index = source_time * source_fps
        
        # Use nearest frame (simple approach)
        nearest_index = min(int(round(source_index)), len(frames) - 1)
        resampled.append(frames[nearest_index])
    
    return resampled


def collect_available_json_files(dictionary_path: Path) -> List[str]:
    """Get list of available .json pose files"""
    if not dictionary_path.exists():
        return []
    
    json_files = list(dictionary_path.glob("*.json"))
    return [f.stem for f in json_files]


# For backward compatibility
def get_available_glosses(dictionary_path: Path) -> List[str]:
    """Alias for collect_available_json_files"""
    return collect_available_json_files(dictionary_path)


if __name__ == "__main__":
    # Test loading
    poses_dir = Path('C:/Users/Public/VoiceotTextConverter/poses_mediapipe')
    
    if poses_dir.exists():
        available = collect_available_json_files(poses_dir)
        print(f"Available MediaPipe JSON files: {len(available)}")
        print(available[:10])
        
        if available:
            # Test loading first sign
            test_data = build_mediapipe_json_animation_data(
                glosses=[available[0]],
                dictionary_path=poses_dir,
                fps=10
            )
            print(f"\nTest load '{available[0]}':")
            print(f"  Frames: {test_data['frame_count']}")
            print(f"  FPS: {test_data['fps']}")
    else:
        print(f"Directory not found: {poses_dir}")
        print("Run extract_mediapipe_complete.py first!")
