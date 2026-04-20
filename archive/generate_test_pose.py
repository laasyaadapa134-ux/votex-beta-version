"""
Generate a test pose file with actual motion to verify the 3D avatar system works
This creates a simple waving animation
"""
import json
import math

def generate_waving_animation():
    """Generate a test animation showing a person waving their right hand"""
    frames = []
    total_frames = 90
    fps = 30.0
    
    for frame_num in range(total_frames):
        # Calculate wave motion (sine wave for smooth up/down motion)
        t = frame_num / total_frames  # 0 to 1
        wave = math.sin(t * math.pi * 4) * 0.15  # Wave up and down
        
        # Base pose with 17 landmarks
        landmarks = [
            {"x": 0.5, "y": 0.15, "z": 0, "confidence": 1.0},   # 0: Nose
            {"x": 0.5, "y": 0.25, "z": 0, "confidence": 1.0},   # 1: Neck
            {"x": 0.35, "y": 0.3, "z": 0, "confidence": 1.0},   # 2: Left shoulder
            {"x": 0.35, "y": 0.45, "z": 0, "confidence": 1.0},  # 3: Left elbow
            {"x": 0.35, "y": 0.6, "z": 0, "confidence": 1.0},   # 4: Left wrist
            {"x": 0.65, "y": 0.3, "z": 0, "confidence": 1.0},   # 5: Right shoulder
            {"x": 0.65 + wave * 0.2, "y": 0.45 + wave, "z": 0, "confidence": 1.0},  # 6: Right elbow (MOVING!)
            {"x": 0.7 + wave * 0.3, "y": 0.6 + wave * 1.5, "z": 0, "confidence": 1.0},  # 7: Right wrist (MOVING!)
            {"x": 0.45, "y": 0.65, "z": 0, "confidence": 1.0},  # 8: Left hip
            {"x": 0.45, "y": 0.8, "z": 0, "confidence": 1.0},   # 9: Left knee
            {"x": 0.45, "y": 0.95, "z": 0, "confidence": 1.0},  # 10: Left ankle
            {"x": 0.55, "y": 0.65, "z": 0, "confidence": 1.0},  # 11: Right hip
            {"x": 0.55, "y": 0.8, "z": 0, "confidence": 1.0},   # 12: Right knee
            {"x": 0.55, "y": 0.95, "z": 0, "confidence": 1.0},  # 13: Right ankle
            {"x": 0.45, "y": 0.12, "z": 0, "confidence": 1.0},  # 14: Left eye
            {"x": 0.55, "y": 0.12, "z": 0, "confidence": 1.0},  # 15: Right eye
            {"x": 0.5, "y": 0.2, "z": 0, "confidence": 1.0}     # 16: Nose tip
        ]
        
        frames.append({
            "frame_number": frame_num,
            "pose_landmarks": landmarks
        })
    
    pose_data = {
        "video_id": "TEST",
        "fps": fps,
        "total_frames": total_frames,
        "frame_width": 480,
        "frame_height": 320,
        "model": "Manual_Test_Animation",
        "note": "Test animation with actual motion - waving right hand to verify avatar system works",
        "frames": frames
    }
    
    # Save to file
    output_path = "C:/Users/Public/VoiceotTextConverter/poses/TEST.pose"
    with open(output_path, 'w') as f:
        json.dump(pose_data, f, indent=2)
    
    print(f"✅ Created TEST.pose with {total_frames} frames of waving animation")
    print(f"   Right hand should wave up and down!")
    print(f"   Saved to: {output_path}")

if __name__ == "__main__":
    generate_waving_animation()
