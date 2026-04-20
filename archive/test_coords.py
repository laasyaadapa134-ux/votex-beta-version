from backend.pose_stream.pose_format_adapter import build_pose_format_animation_data
import json

# Test coordinate normalization
result = build_pose_format_animation_data(['THANK'], 'poses', fps=30)
frame = result['pose_stream'][0]

print(f"Frame count: {len(result['pose_stream'])}")
print(f"\nFirst 5 pose landmarks (should be in 0-1 range):")
for i in range(5):
    lm = frame['poseLandmarks'][i]
    print(f"  Point {i}: x={lm['x']:.4f}, y={lm['y']:.4f}, z={lm['z']:.4f}")

print(f"\nChecking all landmarks are in valid range...")
all_valid = True
for i, lm in enumerate(frame['poseLandmarks']):
    if not (0 <= lm['x'] <= 1 and 0 <= lm['y'] <= 1):
        print(f"  WARNING: Point {i} out of range: x={lm['x']:.4f}, y={lm['y']:.4f}")
        all_valid = False

if all_valid:
    print("✓ All coordinates are in valid 0-1 range!")
else:
    print("✗ Some coordinates are out of range!")
