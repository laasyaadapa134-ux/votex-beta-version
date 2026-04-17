#!/usr/bin/env python3
"""
Simple MediaPipe JSON to .pose converter
Creates minimal .pose files compatible with pose-viewer
"""

import json
import numpy as np
from pathlib import Path
import struct

def mediapipe_to_simple_pose(json_path, output_path):
    """Convert MediaPipe JSON to simple .pose binary format"""
    
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    frames = data['frames']
    fps = data.get('fps', 30.0)
    num_frames = len(frames)
    
    print(f"Converting {num_frames} frames at {fps} FPS...")
    
    # Create binary .pose file
    # Format: Simple binary with just coordinates
    # Header: fps (float32), num_frames (uint32), num_points (uint32)
    # Data: num_frames * num_points * 3 (float32)
    
    num_points = 33  # Just body pose for now
    
    with open(output_path, 'wb') as f:
        # Write header
        f.write(struct.pack('f', fps))  # FPS
        f.write(struct.pack('I', num_frames))  # Number of frames
        f.write(struct.pack('I', num_points))  # Number of points
        
        # Write frame data
        for frame_idx, frame in enumerate(frames):
            pose_landmarks = frame.get('pose_landmarks', [])
            
            for i in range(num_points):
                if i < len(pose_landmarks):
                    landmark = pose_landmarks[i]
                    x = landmark.get('x', 0.0)
                    y = landmark.get('y', 0.0)
                    z = landmark.get('z', 0.0)
                else:
                    x = y = z = 0.0
                
                f.write(struct.pack('fff', x, y, z))
    
    duration = num_frames / fps
    print(f"✅ Created {output_path}")
    print(f"   {num_frames} frames, {fps:.2f} FPS, {duration:.2f}s")
    return output_path

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python simple_pose_converter.py INPUT.json [OUTPUT.pose]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else Path(input_file).with_suffix('.pose')
    
    mediapipe_to_simple_pose(input_file, output_file)
