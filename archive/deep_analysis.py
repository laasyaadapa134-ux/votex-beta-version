from backend.pose_stream.pose_format_adapter import load_pose_file
import numpy as np

# Load and analyze the actual structure
pose = load_pose_file('poses/HELLO.pose')

print("=" * 80)
print("DEEP ANALYSIS: WHAT'S ACTUALLY IN HELLO.POSE")
print("=" * 80)

# Get component structure
print("\n1. COMPONENTS:")
for i, comp in enumerate(pose.header.components):
    points = list(comp.points)
    print(f"\n   Component {i}: {comp.name}")
    print(f"   - Number of points: {len(points)}")
    print(f"   - First 20 point names:")
    for j, name in enumerate(points[:20]):
        print(f"     [{j:3}] {name}")
    if len(points) > 20:
        print(f"     ... and {len(points) - 20} more points")

# Get raw data for first frame
print("\n" + "=" * 80)
print("2. FIRST FRAME RAW DATA (first 20 points):")
print("=" * 80)
frame_0 = pose.body.data[0, 0, :20, :]
for i, point in enumerate(frame_0):
    x, y = point[0], point[1]
    z = point[2] if len(point) > 2 else 0
    print(f"   Point {i:3}: x={x:8.4f}, y={y:8.4f}, z={z:8.4f}")

# Check if these look like body keypoints
print("\n" + "=" * 80)
print("3. DETECTING BODY STRUCTURE:")
print("=" * 80)

# Look for clusters that might be face, body, hands
all_points = pose.body.data[0, 0, :, :]
x_coords = all_points[:, 0]
y_coords = all_points[:, 1]

valid_x = x_coords[np.isfinite(x_coords)]
valid_y = y_coords[np.isfinite(y_coords)]

print(f"\n   Valid points: {len(valid_x)} / {len(x_coords)}")
print(f"   X range: {valid_x.min():.3f} to {valid_x.max():.3f}")
print(f"   Y range: {valid_y.min():.3f} to {valid_y.max():.3f}")

# Try to identify body vs hands by clustering
print("\n   Analyzing spatial distribution...")

# Body points should be around x=0, y in range -3 to +3
# Hands can be anywhere and have more points clustered

body_candidates = []
for i in range(min(25, len(all_points))):
    pt = all_points[i]
    if np.isfinite(pt[0]) and np.isfinite(pt[1]):
        # Check if this looks like a body keypoint
        if abs(pt[0]) < 3 and abs(pt[1]) < 5:
            body_candidates.append((i, pt[0], pt[1]))

print(f"\n   Potential body keypoints (first 25 points):")
for idx, x, y in body_candidates[:15]:
    print(f"   [{idx:3}] x={x:7.3f}, y={y:7.3f}")

print("\n" + "=" * 80)
print("4. CHECKING POINT NAME MAPPING:")
print("=" * 80)

all_point_names = []
for comp in pose.header.components:
    all_point_names.extend(list(comp.points))

# Look for standard body part names
standard_names = ['Nose', 'Neck', 'RShoulder', 'RElbow', 'RWrist', 
                  'LShoulder', 'LElbow', 'LWrist', 
                  'MidHip', 'RHip', 'RKnee', 'RAnkle',
                  'LHip', 'LKnee', 'LAnkle',
                  'REye', 'LEye', 'REar', 'LEar']

print(f"\n   Total point names: {len(all_point_names)}")
print(f"\n   Checking for standard body keypoint names:")
found_names = []
for name in standard_names:
    if name in all_point_names:
        idx = all_point_names.index(name)
        pt = pose.body.data[0, 0, idx, :]
        found_names.append((name, idx, pt[0], pt[1]))
        print(f"   ✓ Found: {name:15} at index {idx:3} → ({pt[0]:7.3f}, {pt[1]:7.3f})")
    else:
        print(f"   ✗ Missing: {name}")

if not found_names:
    print("\n   ⚠️  NO STANDARD NAMES FOUND!")
    print("   This means BODY_135 is NOT using standard keypoint names.")
    print("   The format might be:")
    print("   - MediaPipe Holistic (body + hands + face)")
    print("   - Custom format")
    print("   - Or points are in a specific order without names")

print("\n" + "=" * 80)
print("5. HYPOTHESIS:")
if not found_names:
    print("   The BODY_135 format appears to be unnamed points.")
    print("   Backend is falling back to direct index mapping.")
    print("   BUT: pose file indices DON'T match MediaPipe indices!")
    print("   THIS IS WHY YOU SEE RANDOM LINES!")
else:
    print("   Named points were found. Mapping should work.")
print("=" * 80)
