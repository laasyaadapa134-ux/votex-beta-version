#!/usr/bin/env python3
"""
Direct Binary .pose Format Converter
Creates .pose files that match EXACTLY what pose-viewer JavaScript expects
"""

import json
import struct
import numpy as np
from pathlib import Path


def write_string(f, s):
    """Write a length-prefixed string"""
    encoded = s.encode('utf-8')
    f.write(struct.pack('<H', len(encoded)))  # uint16 length
    f.write(encoded)


def write_pose_header(f):
    """Write pose header matching pose-viewer format"""
    # Version (float32)
    f.write(struct.pack('<f', 0.1))
    
    # Dimensions (3 x uint16)
    f.write(struct.pack('<HHH', 1920, 1080, 0))  # width, height, depth
    
    # Number of components (uint16)
    f.write(struct.pack('<H', 1))  # 1 component (POSE_LANDMARKS)
    
    # Component header - following EXACT JavaScript parser order
    # 1. Name
    write_string(f, "POSE_LANDMARKS")
    
    # 2. Format
    write_string(f, "XYC")  # format: X, Y, Confidence
    
    # 3. Counts (CRITICAL - must come before arrays)
    num_points = 33
    limbs = [
        (10, 9), (9, 8), (8, 7), (7, 3), (3, 2), (2, 1), (1, 4), (4, 5), (5, 6),
        (11, 12), (11, 13), (13, 15), (12, 14), (14, 16),
        (11, 23), (12, 24), (23, 24),
        (23, 25), (24, 26), (25, 27), (26, 28),
        (27, 29), (28, 30), (29, 31), (30, 32), (27, 31), (28, 32),
        (15, 17), (15, 19), (15, 21), (16, 18), (16, 20), (16, 22)
    ]
    
    f.write(struct.pack('<H', num_points))  # _points
    f.write(struct.pack('<H', len(limbs)))  # _limbs
    f.write(struct.pack('<H', len(limbs)))  # _colors (same as limbs)
    
    # 4. Points array (33 pose landmarks)
    for i in range(num_points):
        write_string(f, f"POSE_{i}")
    
    # 5. Limbs array
    for from_idx, to_idx in limbs:
        f.write(struct.pack('<HH', from_idx, to_idx))
    
    # 6. Colors array (RGB for each limb)
    for _ in limbs:
        f.write(struct.pack('<HHH', 66, 153, 225))  # Blue color
    
    return f.tell()  # Return header length


def write_pose_body_v01(f, frames_data, fps):
    """Write pose body in version 0.1 format that JavaScript expects"""
    num_frames = len(frames_data)
    num_people = 1
    num_points = 33
    num_dims = 2  # X, Y (Confidence is separate)
    
    # Body header for version 0.1
    f.write(struct.pack('<H', int(fps)))  # uint16 fps
    f.write(struct.pack('<H', num_frames))  # uint16 num_frames
    f.write(struct.pack('<H', num_people))  # uint16 num_people
    
    # Now write frame data
    # Format: all X,Y coordinates as float32, then all confidence values
    total_coords = num_frames * num_people * num_points * num_dims
    total_confidence = num_frames * num_people * num_points
    
    print(f"   Writing {total_coords} coordinate values...")
    print(f"   Writing {total_confidence} confidence values...")
    
    # Write all coordinate data (X, Y for each point)
    for frame in frames_data:
        for person in range(num_people):
            for point_idx in range(num_points):
                if point_idx < len(frame):
                    x = frame[point_idx].get('x', 0.0)
                    y = frame[point_idx].get('y', 0.0)
                else:
                    x, y = 0.0, 0.0
                f.write(struct.pack('<ff', x, y))  # 2 float32 values
    
    # Write all confidence data
    for frame in frames_data:
        for person in range(num_people):
            for point_idx in range(num_points):
                if point_idx < len(frame):
                    c = frame[point_idx].get('visibility', 1.0)
                else:
                    c = 0.0
                f.write(struct.pack('<f', c))  # 1 float32 value


def mediapipe_json_to_pose(json_path, output_path):
    """Convert MediaPipe JSON to .pose binary format"""
    print(f"📥 Loading {json_path}...")
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    frames = data['frames']
    fps = data.get('fps', 30.0)
    num_frames = len(frames)
    
    print(f"✅ Loaded {num_frames} frames at {fps} FPS")
    print("🔄 Converting to .pose format (version 0.1)...")
    
    # Extract pose landmarks from each frame
    frames_data = []
    for frame in frames:
        if 'pose_landmarks' in frame and frame['pose_landmarks']:
            frames_data.append(frame['pose_landmarks'])
        else:
            frames_data.append([])
    
    print(f"💾 Writing .pose file to {output_path}...")
    with open(output_path, 'wb') as f:
        # Write header
        header_length = write_pose_header(f)
        print(f"   Header: {header_length} bytes")
        
        # Write body
        body_start = f.tell()
        write_pose_body_v01(f, frames_data, fps)
        body_length = f.tell() - body_start
        print(f"   Body: {body_length} bytes")
    
    file_size = Path(output_path).stat().st_size
    print(f"✅ Successfully created {output_path}")
    print(f"   Total size: {file_size:,} bytes")
    print(f"   Frames: {num_frames}, FPS: {fps}, Duration: {num_frames/fps:.2f}s")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Convert MediaPipe JSON to .pose format")
    parser.add_argument('input', help="Input JSON file")
    parser.add_argument('-o', '--output', help="Output .pose file")
    
    args = parser.parse_args()
    
    input_file = args.input
    output_file = args.output if args.output else str(Path(input_file).with_suffix('.pose'))
    
    print("=" * 70)
    print("Direct Binary .pose Converter - Matching pose-viewer JavaScript")
    print("=" * 70)
    
    mediapipe_json_to_pose(input_file, output_file)
