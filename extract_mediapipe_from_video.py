"""
Extract MediaPipe Holistic data from video file
"""
import cv2
from mediapipe.python.solutions import holistic as mp_holistic
import json
import sys
from pathlib import Path

def extract_mediapipe_from_video(video_path, output_json_path):
    """Extract MediaPipe Holistic landmarks from video"""
    
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"Error: Cannot open video {video_path}")
        return False
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Processing video: {video_path}")
    print(f"  FPS: {fps}")
    print(f"  Total frames: {frame_count}")
    
    frames_data = []
    
    with mp_holistic.Holistic(
        static_image_mode=False,
        model_complexity=1,
        enable_segmentation=False,
        refine_face_landmarks=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as holistic:
        
        frame_idx = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert BGR to RGB
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = holistic.process(image_rgb)
            
            # Extract landmarks
            frame_data = {
                "pose_landmarks": [],
                "left_hand_landmarks": [],
                "right_hand_landmarks": []
            }
            
            # Pose landmarks (33 points)
            if results.pose_landmarks:
                for lm in results.pose_landmarks.landmark:
                    frame_data["pose_landmarks"].append({
                        "x": lm.x,
                        "y": lm.y,
                        "z": lm.z,
                        "visibility": lm.visibility
                    })
            
            # Left hand landmarks (21 points)
            if results.left_hand_landmarks:
                for lm in results.left_hand_landmarks.landmark:
                    frame_data["left_hand_landmarks"].append({
                        "x": lm.x,
                        "y": lm.y,
                        "z": lm.z
                    })
            
            # Right hand landmarks (21 points)
            if results.right_hand_landmarks:
                for lm in results.right_hand_landmarks.landmark:
                    frame_data["right_hand_landmarks"].append({
                        "x": lm.x,
                        "y": lm.y,
                        "z": lm.z
                    })
            
            frames_data.append(frame_data)
            
            frame_idx += 1
            if frame_idx % 10 == 0:
                print(f"  Processed {frame_idx}/{frame_count} frames...")
    
    cap.release()
    
    # Save to JSON
    word = video_path.stem.split('_')[0]  # Extract word from filename
    output_data = {
        "word": word,
        "fps": int(fps),
        "frame_count": len(frames_data),
        "format": "MediaPipe_Holistic",
        "frames": frames_data
    }
    
    with open(output_json_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\n✅ Saved {len(frames_data)} frames to {output_json_path}")
    print(f"   Word: {word}")
    print(f"   FPS: {fps}")
    
    return True

if __name__ == "__main__":
    # Accept video path from command line or use default
    if len(sys.argv) > 1:
        video_file = Path(sys.argv[1])
        # Auto-determine output filename from video filename
        word = video_file.stem.split('_')[0]
        output_file = Path(f"poses_mediapipe/{word}.json")
    else:
        video_file = Path("WLASL-master/videos/GOOD_69347.mp4")
        output_file = Path("poses_mediapipe/GOOD.json")
    
    if not video_file.exists():
        print(f"Error: Video file not found: {video_file}")
        sys.exit(1)
    
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    success = extract_mediapipe_from_video(video_file, output_file)
    
    if success:
        print("\n✅ MediaPipe extraction complete!")
    else:
        print("\n❌ MediaPipe extraction failed!")
        sys.exit(1)
