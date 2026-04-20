"""
Comprehensive analysis to create proper coordinate mapping.
The BODY_135 format seems to have a non-standard coordinate system.
"""
from pose_format import Pose
import numpy as np

filepath = 'poses/HELLO.pose'
with open(filepath, 'rb') as f:
    pose = Pose.read(f.read())

data = np.ma.filled(np.ma.array(pose.body.data), np.nan)[0, 0, :, :2]
names = pose.header.components[0].points

# Key body landmarks for MediaPipe mapping
key_points = {
    'Nose': 0,
    'LShoulder': 5, 
    'RShoulder': 6,
    'LElbow': 7,
    'RElbow': 8,
    'LWrist': 9,
    'RWrist': 10
}

print("Raw coordinates from HELLO.pose:")
print("="*60)
for name, idx in key_points.items():
    x, y = data[idx, 0], data[idx, 1]
    print(f"{name:12s}: X={x:7.3f}, Y={y:7.3f}")

# Calculate center and extents
all_x = data[:, 0]
all_y = data[:, 1]
valid_x = all_x[np.isfinite(all_x)]
valid_y = all_y[np.isfinite(all_y)]

center_x = (valid_x.min() + valid_x.max()) / 2
center_y = (valid_y.min() + valid_y.max()) / 2
span_x = valid_x.max() - valid_x.min()
span_y = valid_y.max() - valid_y.min()

print(f"\nData statistics:")
print(f"X center: {center_x:.3f}, span: {span_x:.3f}")
print(f"Y center: {center_y:.3f}, span: {span_y:.3f}")

# Proposed transformation: normalize to 0-1 range with proper centering
print(f"\nProposed transformation:")
print(f"1. Center the data (subtract center)")
print(f"2. Scale by max(span_x, span_y) = {max(span_x, span_y):.3f}")
print(f"3. Shift to 0.5, 0.5 center")
print(f"4. Check if X or Y need inversion based on anatomy")

print(f"\nAnatomical check:")
nose_x, nose_y = data[0, 0], data[0, 1]
lshoulder_x, lshoulder_y = data[5, 0], data[5, 1]
rshoulder_x, rshoulder_y = data[6, 0], data[6, 1]

print(f"Nose X ({nose_x:.2f}) should be BETWEEN L/RShoulder")
print(f"LShoulder X ({lshoulder_x:.2f}) should be < RShoulder X ({rshoulder_x:.2f})")
print(f"^^ This is WRONG! RShoulder is more negative")
print(f"\nConclusion: X axis is MIRRORED - need to negate X values")
