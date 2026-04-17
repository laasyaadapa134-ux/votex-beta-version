"""
Simple Test: Create Minimal MediaPipe JSON for Testing
This creates a basic waving animation in correct MediaPipe format
"""
import json
from pathlib import Path
import math

def create_neutral_pose():
    """Create a neutral standing pose with hand visible"""
    pose = []
    # MediaPipe has 33 pose landmarks
    # Key ones: 0=nose, 11=left shoulder, 12=right shoulder, 15=left wrist, 16=right wrist
    
    # Simplified - just create basic positions
    landmark_positions = {
        0: (0.5, 0.3, 0),  # nose
        11: (0.4, 0.5, 0),  # left shoulder
        12: (0.6, 0.5, 0),  # right shoulder
        13: (0.35, 0.65, 0),  # left elbow
        14: (0.65, 0.65, 0),  # right elbow
        15: (0.3, 0.75, 0),  # left wrist
        16: (0.7, 0.75, 0),  # right wrist
        23: (0.45, 0.8, 0),  # left hip
        24: (0.55, 0.8, 0),  # right hip
    }
    
    for i in range(33):
        if i in landmark_positions:
            x, y, z = landmark_positions[i]
        else:
            x, y, z = 0.5, 0.5, 0  # default center
        pose.append({'x': x, 'y': y, 'z': z, 'visibility': 1.0})
    
    return pose

def create_waving_hand(frame_num, total_frames):
    """Create hand landmarks for waving gesture"""
    # 21 hand landmarks (0=wrist, 1-20=fingers)
    hand = []
    
    # Wrist waves back and forth
    wave_offset = math.sin((frame_num / total_frames) * math.pi * 4) * 0.1
    
    wrist_x = 0.7 + wave_offset
    wrist_y = 0.6
    
    # Simple hand structure
    hand.append({'x': wrist_x, 'y': wrist_y, 'z': 0})  # wrist
    
    # Fingers spread out
    for i in range(1, 21):
        offset_x = (i % 5) * 0.02 - 0.04
        offset_y = -(i // 5) * 0.03
        hand.append({
            'x': wrist_x + offset_x,
            'y': wrist_y + offset_y,
            'z': 0
        })
    
    return hand

def create_test_sign(word, frame_count=30):
    """Create a test sign animation"""
    frames = []
    
    for i in range(frame_count):
        frames.append({
            'pose_landmarks': create_neutral_pose(),
            'left_hand_landmarks': [],  # No left hand for simplicity
            'right_hand_landmarks': create_waving_hand(i, frame_count)
        })
    
    return {
        'word': word,
        'fps': 30,
        'frame_count': frame_count,
        'format': 'MediaPipe_Holistic',
        'frames': frames
    }

def main():
    """Create test MediaPipe JSON files"""
    output_dir = Path('C:/Users/Public/VoiceotTextConverter/poses_mediapipe')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Create test signs
    test_words = ['HELLO', 'HI', 'GOOD', 'HOW', 'ARE', 'YOU']
    
    print("Creating test MediaPipe JSON files...")
    for word in test_words:
        data = create_test_sign(word, frame_count=30)
        output_file = output_dir / f'{word}.json'
        
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"  ✓ Created {word}.json (30 frames)")
    
    print()
    print(f"✅ Created {len(test_words)} test signs in poses_mediapipe/")
    print()
    print("These are simple waving animations to PROVE the system works.")
    print("Once working, we'll replace with real WLASL signs.")
    print()
    print("Next: Restart server and test!")

if __name__ == "__main__":
    main()
