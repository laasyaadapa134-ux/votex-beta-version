from backend.pose_stream.pose_format_adapter import load_pose_file
import numpy as np

pose = load_pose_file('poses/HELLO.pose')

print("COMPONENT STRUCTURE:")
print("=" * 80)

offset = 0
for comp in pose.header.components:
    points = list(comp.points)
    print(f"\n{comp.name}: {len(points)} points (indices {offset} to {offset + len(points) - 1})")
    
    # Show first 10 point names
    if len(points) <= 35:
        for i, point_name in enumerate(points):
            print(f"  [{offset + i}] {point_name}")
    else:
        print(f"  First 10 points:")
        for i in range(min(10, len(points))):
            print(f"  [{offset + i}] {points[i]}")
        print(f"  ... and {len(points) - 10} more")
    
    offset += len(points)

print("\n" + "=" * 80)
print(f"TOTAL POINTS: {offset}")

# Check which points map to MediaPipe pose landmarks
print("\n" + "=" * 80)
print("CHECKING MEDIAPIPE MAPPINGS:")
print("=" * 80)

from backend.pose_stream.pose_format_adapter import OPENPOSE_TO_MEDIAPIPE_POSE

# Get all point names
all_point_names = []
for comp in pose.header.components:
    all_point_names.extend(list(comp.points))

print(f"\nTotal point names available: {len(all_point_names)}")

# Check which required MediaPipe points exist
required_points = ["Nose", "LShoulder", "RShoulder", "LElbow", "RElbow", 
                   "LWrist", "RWrist", "LHip", "RHip", "LKnee", "RKnee"]

print("\nRequired points for body skeleton:")
for point_name in required_points:
    if point_name in all_point_names:
        index = all_point_names.index(point_name)
        mp_index = OPENPOSE_TO_MEDIAPIPE_POSE.get(point_name, "NOT MAPPED")
        raw_value = pose.body.data[0, 0, index, :]
        print(f"  ✓ {point_name:12} at index {index:3} → MP[{mp_index:2}]  Raw: ({raw_value[0]:7.3f}, {raw_value[1]:7.3f})")
    else:
        print(f"  ✗ {point_name:12} MISSING!")
