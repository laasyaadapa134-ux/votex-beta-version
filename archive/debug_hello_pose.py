from backend.pose_stream.pose_format_adapter import load_pose_file, pose_to_mediapipe_frames
import json

# Load HELLO.pose file
pose = load_pose_file('poses/HELLO.pose')

print("=" * 80)
print("HELLO.POSE FILE ANALYSIS")
print("=" * 80)

# Check dimensions
print(f"\n1. DIMENSIONS:")
print(f"   Width: {pose.header.dimensions.width}")
print(f"   Height: {pose.header.dimensions.height}")
print(f"   Depth: {pose.header.dimensions.depth if hasattr(pose.header.dimensions, 'depth') else 'N/A'}")

# Check FPS
print(f"\n2. FPS: {pose.body.fps}")

# Check frame count
print(f"\n3. FRAMES: {pose.body.data.shape[0]}")

# Check person count
print(f"\n4. PEOPLE: {pose.body.data.shape[1]}")

# Check point count
print(f"\n5. POINTS PER FRAME: {pose.body.data.shape[2]}")

# Check components
print(f"\n6. COMPONENTS:")
for comp in pose.header.components:
    print(f"   - {comp.name}: {len(comp.points)} points")
    if len(comp.points) <= 10:
        print(f"     Points: {comp.points}")

# Sample raw data from first frame
print(f"\n7. FIRST FRAME RAW DATA (first 5 points):")
frame_0 = pose.body.data[0, 0, :5, :]
for i, point in enumerate(frame_0):
    print(f"   Point {i}: x={point[0]:.4f}, y={point[1]:.4f}, z={point[2] if len(point) > 2 else 0:.4f}")

# Convert to MediaPipe format
print(f"\n8. CONVERTING TO MEDIAPIPE FORMAT...")
mediapipe_frames = pose_to_mediapipe_frames(pose)
print(f"   Converted frames: {len(mediapipe_frames)}")

# Show first MediaPipe frame
if mediapipe_frames:
    first_frame = mediapipe_frames[0]
    print(f"\n9. FIRST MEDIAPIPE FRAME:")
    print(f"   Keys: {list(first_frame.keys())}")
    
    if 'poseLandmarks' in first_frame:
        pose_lm = first_frame['poseLandmarks']
        print(f"   Pose landmarks count: {len(pose_lm)}")
        print(f"\n   First 5 pose landmarks:")
        for i in range(min(5, len(pose_lm))):
            lm = pose_lm[i]
            print(f"   [{i}] x={lm['x']:.4f}, y={lm['y']:.4f}, z={lm['z']:.4f}")
        
        print(f"\n   CRITICAL BODY POINTS:")
        print(f"   [0] Nose:        x={pose_lm[0]['x']:.4f}, y={pose_lm[0]['y']:.4f}, z={pose_lm[0]['z']:.4f}")
        print(f"   [11] L-Shoulder: x={pose_lm[11]['x']:.4f}, y={pose_lm[11]['y']:.4f}, z={pose_lm[11]['z']:.4f}")
        print(f"   [12] R-Shoulder: x={pose_lm[12]['x']:.4f}, y={pose_lm[12]['y']:.4f}, z={pose_lm[12]['z']:.4f}")
        print(f"   [15] L-Wrist:    x={pose_lm[15]['x']:.4f}, y={pose_lm[15]['y']:.4f}, z={pose_lm[15]['z']:.4f}")
        print(f"   [16] R-Wrist:    x={pose_lm[16]['x']:.4f}, y={pose_lm[16]['y']:.4f}, z={pose_lm[16]['z']:.4f}")
        print(f"   [23] L-Hip:      x={pose_lm[23]['x']:.4f}, y={pose_lm[23]['y']:.4f}, z={pose_lm[23]['z']:.4f}")
        print(f"   [24] R-Hip:      x={pose_lm[24]['x']:.4f}, y={pose_lm[24]['y']:.4f}, z={pose_lm[24]['z']:.4f}")

# Save full output for inspection
output = {
    "metadata": {
        "dimensions": {
            "width": float(pose.header.dimensions.width),
            "height": float(pose.header.dimensions.height),
            "depth": float(pose.header.dimensions.depth if hasattr(pose.header.dimensions, 'depth') else 0)
        },
        "fps": float(pose.body.fps),
        "frame_count": len(mediapipe_frames)
    },
    "frames": mediapipe_frames[:3]  # First 3 frames for inspection
}

with open('debug_hello_output.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"\n10. Full output saved to: debug_hello_output.json")
print("=" * 80)
