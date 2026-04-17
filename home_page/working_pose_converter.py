#!/usr/bin/env python3
"""
Proper MediaPipe JSON to .pose Format Converter
Creates valid .pose files for pose-viewer component
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


def create_mediapipe_components():
    """Create pose header components for MediaPipe Holistic (body only for now)"""
    
    # Define 33 body pose points
    pose_points = [f"POSE_{i}" for i in range(33)]
    
    # Define body connections based on MediaPipe Pose
    pose_limbs = [
        # Face
        (10, 9), (9, 8), (8, 7), (7, 3), (3, 2), (2, 1), (1, 4), (4, 5), (5, 6),
        # Arms
        (11, 12), (11, 13), (13, 15), (12, 14), (14, 16),
        # Torso
        (11, 23), (12, 24), (23, 24),
        # Legs
        (23, 25), (24, 26), (25, 27), (26, 28),
        # Feet
        (27, 29), (28, 30), (29, 31), (30, 32), (27, 31), (28, 32),
        # Hand area
        (15, 17), (15, 19), (15, 21), (16, 18), (16, 20), (16, 22)
    ]
    
    # Colors for visualization (RGB 0-255)
    pose_colors = [(66, 153, 225)] * len(pose_limbs)  # Blue for all connections
    
    pose_component = PoseHeaderComponent(
        name="POSE_LANDMARKS",
        points=pose_points,
        limbs=pose_limbs,
        colors=pose_colors,
        point_format="XYC"  # X, Y coordinates + Confidence (separate)
    )
    
    return [pose_component]


def mediapipe_to_pose_format(json_path, output_path):
    """Convert MediaPipe JSON to .pose binary format"""
    
    print(f"📥 Loading {json_path}...")
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    frames = data['frames']
    fps = data.get('fps', 30.0)
    num_frames = len(frames)
    
    print(f"✅ Loaded {num_frames} frames at {fps} FPS")
    print("🔄 Converting to .pose format...")
    
    # Create header
    dimensions = PoseHeaderDimensions(
        height=1080,
        width=1920,
        depth=0
    )
    
    components = create_mediapipe_components()
    
    header = PoseHeader(
        version=0.1,
        dimensions=dimensions,
        components=components
    )
    
    # Initialize data arrays for body pose only (33 points)
    num_people = 1
    num_points = 33
    num_dims = 2  # Just X, Y (2D coordinates)
    
    data_array = np.zeros((num_frames, num_people, num_points, num_dims), dtype=np.float32)
    confidence_arr = np.ones((num_frames, num_people, num_points), dtype=np.float32)
    
    print(f"📊 Data shape: {data_array.shape}")
    print(f"   Frames: {num_frames}, People: {num_people}, Points: {num_points}, Dims: {num_dims}")
    
    # Fill data from frames
    for frame_idx, frame in enumerate(frames):
        person_idx = 0
        
        # Process pose landmarks (33 points) - using X, Y only
        if 'pose_landmarks' in frame and frame['pose_landmarks']:
            for point_idx, landmark in enumerate(frame['pose_landmarks']):
                if point_idx < num_points:
                    data_array[frame_idx, person_idx, point_idx, 0] = landmark.get('x', 0)
                    data_array[frame_idx, person_idx, point_idx, 1] = landmark.get('y', 0)
                    # Z is stored in confidence or ignored
                    confidence_arr[frame_idx, person_idx, point_idx] = landmark.get('visibility', 1.0)
    
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


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Convert MediaPipe JSON to .pose format (body only)")
    parser.add_argument('input', help="Input JSON file")
    parser.add_argument('-o', '--output', help="Output .pose file")
    
    args = parser.parse_args()
    
    input_file = args.input
    output_file = args.output if args.output else str(Path(input_file).with_suffix('.pose'))
    
    print("=" * 60)
    print("MediaPipe JSON → .pose Format Converter (Body Pose Only)")
    print("=" * 60)
    
    mediapipe_to_pose_format(input_file, output_file)
