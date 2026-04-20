import cv2
import mediapipe as mp
import json
import os
from pathlib import Path

# Initialize MediaPipe Holistic
mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(
    static_image_mode=False,
    model_complexity=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

def extract_mediapipe_from_video(video_path, output_path):
    """Extract MediaPipe landmarks from video and save as JSON"""
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"❌ Failed to open: {video_path}")
        return False
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Processing: {video_path}")
    print(f"  FPS: {fps}, Total frames: {total_frames}")
    
    frames_data = []
    frame_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process frame
        results = holistic.process(frame_rgb)
        
        # Extract landmarks
        frame_data = {
            'pose_landmarks': [],
            'left_hand_landmarks': [],
            'right_hand_landmarks': []
        }
        
        # Pose landmarks (33 points)
        if results.pose_landmarks:
            frame_data['pose_landmarks'] = [
                {'x': lm.x, 'y': lm.y, 'z': lm.z, 'visibility': lm.visibility}
                for lm in results.pose_landmarks.landmark
            ]
        
        # Left hand landmarks (21 points)
        if results.left_hand_landmarks:
            frame_data['left_hand_landmarks'] = [
                {'x': lm.x, 'y': lm.y, 'z': lm.z}
                for lm in results.left_hand_landmarks.landmark
            ]
        
        # Right hand landmarks (21 points)
        if results.right_hand_landmarks:
            frame_data['right_hand_landmarks'] = [
                {'x': lm.x, 'y': lm.y, 'z': lm.z}
                for lm in results.right_hand_landmarks.landmark
            ]
        
        frames_data.append(frame_data)
        frame_count += 1
        
        if frame_count % 10 == 0:
            print(f"  Processed {frame_count}/{total_frames} frames...", end='\r')
    
    cap.release()
    
    # Save to JSON
    output_data = {
        'fps': fps,
        'frame_count': len(frames_data),
        'frames': frames_data
    }
    
    with open(output_path, 'w') as f:
        json.dump(output_data, f)
    
    print(f"  ✅ Saved {len(frames_data)} frames to {output_path}")
    return True

def main():
    video_dir = Path("WLASL-master/videos")
    output_dir = Path("poses_mediapipe")
    output_dir.mkdir(exist_ok=True)
    
    # Get all mp4 files
    video_files = list(video_dir.glob("*.mp4"))
    
    # Skip corrupted HELLO file
    video_files = [v for v in video_files if v.stat().st_size > 1000]  # Skip files < 1KB
    
    print(f"Found {len(video_files)} valid videos to process\n")
    
    success_count = 0
    failed_count = 0
    
    for video_file in sorted(video_files):
        # Extract word name from filename (e.g., GOOD_69347.mp4 -> GOOD)
        word = video_file.stem.split('_')[0]
        output_file = output_dir / f"{word}.json"
        
        try:
            if extract_mediapipe_from_video(str(video_file), str(output_file)):
                success_count += 1
            else:
                failed_count += 1
        except Exception as e:
            print(f"❌ Error processing {video_file.name}: {e}")
            failed_count += 1
        
        print()  # Blank line between files
    
    print("\n" + "="*60)
    print(f"Extraction Complete!")
    print(f"  ✅ Success: {success_count}")
    print(f"  ❌ Failed: {failed_count}")
    print(f"  📁 Output: {output_dir}/")
    print("="*60)

if __name__ == "__main__":
    main()
