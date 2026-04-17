#!/usr/bin/env python3
"""
MediaPipe JSON to .pose Format Converter
Converts MediaPipe Holistic JSON output to pose-format binary .pose files
for use with the pose-viewer web component.
"""

import json
import numpy as np
from pathlib import Path
import sys

try:
    from pose_format import Pose
    from pose_format.numpy import NumPyPoseBody
    from pose_format.pose_header import PoseHeader, PoseHeaderDimensions, PoseHeaderComponent
except ImportError:
    print("❌ ERROR: pose-format library not installed!")
    print("Install with: pip install pose-format")
    sys.exit(1)


def load_mediapipe_json(json_path):
    """Load MediaPipe JSON file."""
    print(f"📥 Loading {json_path}...")
    with open(json_path, 'r') as f:
        data = json.load(f)
    print(f"✅ Loaded {len(data['frames'])} frames at {data['fps']} FPS")
    return data


def mediapipe_to_pose_format(data, output_path):
    """
    Convert MediaPipe JSON to .pose binary format.
    
    MediaPipe Holistic provides:
    - 33 pose landmarks (body)
    - 21 left hand landmarks
    - 21 right hand landmarks  
    
    Total: 75 landmarks (without face)
    """
    print("🔄 Converting MediaPipe data to .pose format...")
    
    frames = data['frames']
    fps = data.get('fps', 30.0)
    num_frames = len(frames)
    
    # Determine dimensions
    dimensions = PoseHeaderDimensions(
        height=1080,  # Default video height
        width=1920,   # Default video width
        depth=0       # Not used for 2D/3D pose
    )
    
    # Create simple body-only components (33 pose points + hands)
    # Instead of using holistic_components which includes face (468 points)
    
    # Define components for body (33) + left hand (21) + right hand (21) = 75 points
    body_component = PoseHeaderComponent(
        name="POSE_LANDMARKS",
        points=[f"POSE_{i}" for i in range(33)]
    )
    left_hand_component = PoseHeaderComponent(
        name="LEFT_HAND_LANDMARKS",
        points=[f"LEFT_HAND_{i}" for i in range(21)]
    )
    right_hand_component = PoseHeaderComponent(
        name="RIGHT_HAND_LANDMARKS",
        points=[f"RIGHT_HAND_{i}" for i in range(21)]
    )
    
    components = [body_component, left_hand_component, right_hand_component]
    
    # Create header
    header = PoseHeader(
        version=0.1,
        dimensions=dimensions,
        components=components
    )
    
    # Initialize data arrays
    # Shape: (num_frames, num_people, num_points, num_dims)
    # We have 1 person, 75 points (33 pose + 21 left hand + 21 right hand), 3 dims (x, y, z)
    num_people = 1
    num_points = 75  # 33 + 21 + 21
    num_dims = 3
    
    data_array = np.zeros((num_frames, num_people, num_points, num_dims), dtype=np.float32)
    confidence_arr = np.ones((num_frames, num_people, num_points), dtype=np.float32)
    
    print(f"📊 Data shape: {data_array.shape}")
    print(f"   Frames: {num_frames}, People: {num_people}, Points: {num_points}, Dims: {num_dims}")
    
    # Fill data from frames
    for frame_idx, frame in enumerate(frames):
        person_idx = 0  # Single person
        point_idx = 0
        
        # Process pose landmarks (33 points)
        if 'pose_landmarks' in frame and frame['pose_landmarks']:
            for landmark in frame['pose_landmarks']:
                if point_idx < 33:
                    data_array[frame_idx, person_idx, point_idx, 0] = landmark.get('x', 0)
                    data_array[frame_idx, person_idx, point_idx, 1] = landmark.get('y', 0)
                    data_array[frame_idx, person_idx, point_idx, 2] = landmark.get('z', 0)
                    confidence_arr[frame_idx, person_idx, point_idx] = landmark.get('visibility', 1.0)
                    point_idx += 1
        
        # Move to left hand section (starts at index 33)
        point_idx = 33
        
        # Process left hand landmarks (21 points)
        if 'left_hand_landmarks' in frame and frame['left_hand_landmarks']:
            for landmark in frame['left_hand_landmarks']:
                if point_idx < 54:  # 33 + 21
                    data_array[frame_idx, person_idx, point_idx, 0] = landmark.get('x', 0)
                    data_array[frame_idx, person_idx, point_idx, 1] = landmark.get('y', 0)
                    data_array[frame_idx, person_idx, point_idx, 2] = landmark.get('z', 0)
                    confidence_arr[frame_idx, person_idx, point_idx] = 1.0
                    point_idx += 1
        
        # Move to right hand section (starts at index 54)
        point_idx = 54
        
        # Process right hand landmarks (21 points)
        if 'right_hand_landmarks' in frame and frame['right_hand_landmarks']:
            for landmark in frame['right_hand_landmarks']:
                if point_idx < 75:  # 33 + 21 + 21
                    data_array[frame_idx, person_idx, point_idx, 0] = landmark.get('x', 0)
                    data_array[frame_idx, person_idx, point_idx, 1] = landmark.get('y', 0)
                    data_array[frame_idx, person_idx, point_idx, 2] = landmark.get('z', 0)
                    confidence_arr[frame_idx, person_idx, point_idx] = 1.0
                    point_idx += 1
    
    # Create NumPy pose body
    pose_body = NumPyPoseBody(
        fps=fps,
        data=data_array,
        confidence=confidence_arr
    )
    
    # Create Pose object
    pose = Pose(header=header, body=pose_body)
    
    # Write to file
    print(f"💾 Writing .pose file to {output_path}...")
    with open(output_path, 'wb') as f:
        pose.write(f)
    
    print(f"✅ Successfully created {output_path}")
    print(f"   Frames: {num_frames}, FPS: {fps}, Duration: {num_frames/fps:.2f}s")
    
    return pose


def convert_all_json_files(input_dir=".", output_dir="poses"):
    """Convert all JSON files in a directory to .pose format."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    json_files = list(input_path.glob("*.json"))
    
    if not json_files:
        print(f"⚠️ No JSON files found in {input_dir}")
        return
    
    print(f"🔍 Found {len(json_files)} JSON files")
    print("=" * 60)
    
    converted = 0
    failed = 0
    
    for json_file in json_files:
        try:
            # Skip test files
            if 'test' in json_file.name.lower() or 'payload' in json_file.name.lower():
                continue
            
            data = load_mediapipe_json(json_file)
            output_file = output_path / f"{json_file.stem}.pose"
            mediapipe_to_pose_format(data, output_file)
            converted += 1
            print("-" * 60)
        except Exception as e:
            print(f"❌ Error converting {json_file.name}: {e}")
            failed += 1
            print("-" * 60)
    
    print("=" * 60)
    print(f"✅ Conversion complete!")
    print(f"   Successfully converted: {converted}")
    print(f"   Failed: {failed}")
    print(f"   Output directory: {output_path.absolute()}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Convert MediaPipe JSON to .pose format")
    parser.add_argument('-i', '--input', default=".", help="Input directory with JSON files")
    parser.add_argument('-o', '--output', default="poses", help="Output directory for .pose files")
    parser.add_argument('-f', '--file', help="Convert a single JSON file")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("MediaPipe JSON → .pose Format Converter")
    print("=" * 60)
    
    if args.file:
        # Convert single file
        data = load_mediapipe_json(args.file)
        output_file = Path(args.output) / f"{Path(args.file).stem}.pose"
        mediapipe_to_pose_format(data, output_file)
    else:
        # Convert all files in directory
        convert_all_json_files(args.input, args.output)
