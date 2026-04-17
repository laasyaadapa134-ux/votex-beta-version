"""Analyze actual coordinate ranges in pose files to determine proper scaling"""
from pose_format import Pose
import numpy as np
from pathlib import Path

# Test with a few pose files
test_files = ['poses/HELLO.pose', 'poses/HOW.pose', 'poses/ARE.pose', 'poses/YOU.pose']

for filepath in test_files:
    path = Path(filepath)
    if not path.exists():
        print(f"Skipping {filepath} - not found")
        continue
    
    print(f"\n{'='*60}")
    print(f"Analyzing: {filepath}")
    print(f"{'='*60}")
    
    with open(path, 'rb') as f:
        pose = Pose.read(f.read())
    
    # Get body data
    body = pose.body
    data = np.ma.filled(np.ma.array(body.data), np.nan)  # Shape: (frames, people, points, dims)
    
    print(f"Shape: {data.shape}")
    print(f"Dimensions - width: {pose.header.dimensions.width}, height: {pose.header.dimensions.height}")
    
    # Get all coordinates across all frames for person 0
    if len(data.shape) >= 3 and data.shape[1] > 0:
        # Data is shaped (frames, people, points, dims)
        person_data = data[:, 0, :, :]  # All frames, first person, all points
        
        # Find min/max for X and Y
        x_coords = person_data[:, :, 0].flatten()
        y_coords = person_data[:, :, 1].flatten()
        
        # Remove NaN/inf values
        x_coords = x_coords[np.isfinite(x_coords)]
        y_coords = y_coords[np.isfinite(y_coords)]
        
        if len(x_coords) > 0 and len(y_coords) > 0:
            print(f"\nX range: {x_coords.min():.3f} to {x_coords.max():.3f} (span: {x_coords.max() - x_coords.min():.3f})")
            print(f"Y range: {y_coords.min():.3f} to {y_coords.max():.3f} (span: {y_coords.max() - y_coords.min():.3f})")
            print(f"X center: {(x_coords.min() + x_coords.max()) / 2:.3f}")
            print(f"Y center: {(y_coords.min() + x_coords.max()) / 2:.3f}")

print("\n" + "="*60)
print("RECOMMENDATION:")
print("="*60)
print("Based on the ranges above, we should:")
print("1. Determine the typical X span (likely ~2-3 units)")
print("2. Determine the typical Y span (likely ~4-6 units)")
print("3. Update the scaling factors in build_landmark() accordingly")
