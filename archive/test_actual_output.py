import sys
sys.path.insert(0, 'backend')
from pose_stream.pose_format_adapter import build_pose_format_animation_data

result = build_pose_format_animation_data(['HELLO'], 'poses', fps=10)
frame0 = result['pose_stream'][0]

print("Frame 0 data check:")
print("="*60)

# Check pose landmarks
pose = frame0['poseLandmarks']
print(f"\nPose landmarks: {len(pose)} points")
print(f"Nose (0): x={pose[0]['x']:.3f}, y={pose[0]['y']:.3f}")
print(f"LShoulder (11): x={pose[11]['x']:.3f}, y={pose[11]['y']:.3f}")
print(f"RShoulder (12): x={pose[12]['x']:.3f}, y={pose[12]['y']:.3f}")

# Check hand landmarks
left_hand = frame0.get('leftHandLandmarks', [])
right_hand = frame0.get('rightHandLandmarks', [])

print(f"\nLeft hand landmarks: {len(left_hand)} points")
if len(left_hand) > 0:
    print(f"Wrist (0): x={left_hand[0]['x']:.3f}, y={left_hand[0]['y']:.3f}")
    print(f"Thumb tip (4): x={left_hand[4]['x']:.3f}, y={left_hand[4]['y']:.3f}")
    print(f"Index tip (8): x={left_hand[8]['x']:.3f}, y={left_hand[8]['y']:.3f}")

print(f"\nRight hand landmarks: {len(right_hand)} points")
if len(right_hand) > 0:
    print(f"Wrist (0): x={right_hand[0]['x']:.3f}, y={right_hand[0]['y']:.3f}")
    print(f"Thumb tip (4): x={right_hand[4]['x']:.3f}, y={right_hand[4]['y']:.3f}")
    print(f"Index tip (8): x={right_hand[8]['x']:.3f}, y={right_hand[8]['y']:.3f}")

print("\n" + "="*60)
print("Expected MediaPipe range: all coordinates should be 0.0 to 1.0")
print("If hands look wrong, coordinates may be outside valid range or incorrectly positioned")
