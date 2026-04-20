import json
d = json.load(open('C:/Users/Public/VoiceotTextConverter/poses_mediapipe/GOOD.json'))
f0 = d['frames'][0]
print(f"Frames: {len(d['frames'])}")
print(f"FPS: {d['fps']}")
print(f"Pose landmarks: {len(f0.get('pose_landmarks', []))} points")
print(f"Right hand: {len(f0.get('right_hand_landmarks', []))} points")
print(f"Left hand: {len(f0.get('left_hand_landmarks', []))} points")
print("✅ Data structure is valid" if all([
    'frames' in d,
    'fps' in d,
    'pose_landmarks' in f0,
    'right_hand_landmarks' in f0,
    'left_hand_landmarks' in f0
]) else "❌ Missing required fields")
