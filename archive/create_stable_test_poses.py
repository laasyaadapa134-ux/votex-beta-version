"""
Create STABLE test MediaPipe JSON (no wild movements)
Simple static pose with minimal hand motion
"""
import json
from pathlib import Path
import math

def create_stable_pose():
    """Create a stable standing pose"""
    pose = []
    # MediaPipe landmarks: 0-32 (33 total)
    # Important: y=0 is TOP, y=1 is BOTTOM
    
    landmark_positions = {
        0: (0.5, 0.25, 0),    # nose - near top
        11: (0.42, 0.42, 0),  # left shoulder
        12: (0.58, 0.42, 0),  # right shoulder
        13: (0.38, 0.58, 0),  # left elbow
        14: (0.62, 0.58, 0),  # right elbow
        15: (0.35, 0.70, 0),  # left wrist
        16: (0.65, 0.70, 0),  # right wrist - stable position
        23: (0.44, 0.75, 0),  # left hip
        24: (0.56, 0.75, 0),  # right hip
        25: (0.43, 0.88, 0),  # left knee
        26: (0.57, 0.88, 0),  # right knee
        27: (0.42, 0.98, 0),  # left ankle
        28: (0.58, 0.98, 0),  # right ankle
    }
    
    for i in range(33):
        if i in landmark_positions:
            x, y, z = landmark_positions[i]
        else:
            x, y, z = 0.5, 0.5, 0  # default center
        pose.append({'x': x, 'y': y, 'z': z, 'visibility': 1.0})
    
    return pose

def create_stable_hand(frame_num, total_frames):
    """Create hand with SLIGHT waving motion"""
    hand = []
    
    # Very small wave motion (only ±0.02 movement)
    wave = math.sin((frame_num / total_frames) * math.pi * 2) * 0.02
    
    # Wrist position - consistent with pose landmark 16 (0.65, 0.70)
    wrist_x = 0.65
    wrist_y = 0.70
    wrist_z = -0.05 + wave  # slight forward/back motion
    
    hand.append({'x': wrist_x, 'y': wrist_y, 'z': wrist_z})  # wrist
    
    # Create 20 finger landmarks in a natural hand shape
    # Fingers point upward (lower y values = higher on screen)
    finger_layout = [
        # Thumb (spread out to side)
        {'x': 0.02, 'y': -0.02, 'z': 0.01},
        {'x': 0.03, 'y': -0.04, 'z': 0.01},
        {'x': 0.04, 'y': -0.06, 'z': 0.01},
        {'x': 0.05, 'y': -0.08, 'z': 0.01},
        # Index finger (pointing up)
        {'x': 0.01, 'y': -0.02, 'z': 0},
        {'x': 0.01, 'y': -0.05, 'z': 0},
        {'x': 0.01, 'y': -0.08, 'z': 0},
        {'x': 0.01, 'y': -0.11, 'z': 0},
        # Middle finger
        {'x': 0, 'y': -0.02, 'z': 0},
        {'x': 0, 'y': -0.05, 'z': 0},
        {'x': 0, 'y': -0.09, 'z': 0},
        {'x': 0, 'y': -0.12, 'z': 0},
        # Ring finger
        {'x': -0.01, 'y': -0.02, 'z': 0},
        {'x': -0.01, 'y': -0.05, 'z': 0},
        {'x': -0.01, 'y': -0.08, 'z': 0},
        {'x': -0.01, 'y': -0.10, 'z': 0},
        # Pinky
        {'x': -0.02, 'y': -0.02, 'z': 0},
        {'x': -0.02, 'y': -0.04, 'z': 0},
        {'x': -0.02, 'y': -0.06, 'z': 0},
        {'x': -0.02, 'y': -0.08, 'z': 0},
    ]
    
    for offset in finger_layout:
        hand.append({
            'x': wrist_x + offset['x'],
            'y': wrist_y + offset['y'],
            'z': wrist_z + offset['z']
        })
    
    return hand

def create_test_sign(word, frame_count=20):
    """Create a test sign with stable animation"""
    frames = []
    
    for i in range(frame_count):
        frames.append({
            'pose_landmarks': create_stable_pose(),
            'left_hand_landmarks': [],  # No left hand
            'right_hand_landmarks': create_stable_hand(i, frame_count)
        })
    
    return {
        'word': word,
        'fps': 30,
        'frame_count': frame_count,
        'format': 'MediaPipe_Holistic',
        'frames': frames
    }

def main():
    """Create stable test MediaPipe JSON files"""
    output_dir = Path('C:/Users/Public/VoiceotTextConverter/poses_mediapipe')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    test_words = ['HELLO', 'HI', 'GOOD', 'HOW', 'ARE', 'YOU']
    
    print("Creating STABLE test MediaPipe JSON files...")
    for word in test_words:
        data = create_test_sign(word, frame_count=20)
        output_file = output_dir / f'{word}.json'
        
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"  ✓ Created {word}.json (20 frames, stable pose)")
    
    print()
    print("✅ Created stable test poses")
    print("   - Body stays centered")
    print("   - Hand position fixed at (0.65, 0.70)")
    print("   - Only slight wave motion for testing")

if __name__ == "__main__":
    main()
