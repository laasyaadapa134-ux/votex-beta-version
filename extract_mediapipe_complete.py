"""
Complete MediaPipe Pose Extraction for WLASL Signs
Downloads videos and extracts MediaPipe format poses
"""
import json
import os
import subprocess
from pathlib import Path
import cv2

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("❌ MediaPipe not installed!")
    print("   Install with: pip install mediapipe opencv-python")
    exit(1)


def download_video_with_ytdlp(video_url, output_path):
    """Download video using yt-dlp"""
    try:
        cmd = [
            'yt-dlp',
            '-f', 'best[ext=mp4]/best',
            '-o', str(output_path),
            '--no-playlist',
            '--quiet',
            video_url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        return result.returncode == 0 and Path(output_path).exists()
    except Exception as e:
        print(f"    [WARN] Download failed: {e}")
        return False


def extract_mediapipe_from_video(video_path, word):
    """
    Extract MediaPipe poses from video and save as JSON
    Returns path to JSON file
    """
    output_dir = Path('C:/Users/Public/VoiceotTextConverter/poses_mediapipe')
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f'{word}.json'
    
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"    [X] Failed to open video: {video_path}")
        return None
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"    [*] Processing {total_frames} frames at {fps:.1f} fps...")
    
    mp_pose = mp.solutions.pose
    mp_hands = mp.solutions.hands
    
    frames_data = []
    frame_num = 0
    
    with mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        smooth_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as pose, mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as hands:
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pose_results = pose.process(image_rgb)
            hands_results = hands.process(image_rgb)
            
            if pose_results.pose_landmarks:
                # Extract pose (33 landmarks)
                pose_landmarks = []
                for landmark in pose_results.pose_landmarks.landmark:
                    pose_landmarks.append({
                        'x': float(landmark.x),
                        'y': float(landmark.y),
                        'z': float(landmark.z),
                        'visibility': float(landmark.visibility)
                    })
                
                # Extract hands (21 landmarks each)
                left_hand = []
                right_hand = []
                
                if hands_results.multi_hand_landmarks and hands_results.multi_handedness:
                    for hand_landmarks, handedness in zip(
                        hands_results.multi_hand_landmarks,
                        hands_results.multi_handedness
                    ):
                        hand_label = handedness.classification[0].label
                        landmarks = []
                        for landmark in hand_landmarks.landmark:
                            landmarks.append({
                                'x': float(landmark.x),
                                'y': float(landmark.y),
                                'z': float(landmark.z)
                            })
                        
                        if hand_label == 'Left':
                            left_hand = landmarks
                        else:
                            right_hand = landmarks
                
                frames_data.append({
                    'pose_landmarks': pose_landmarks,
                    'left_hand_landmarks': left_hand,
                    'right_hand_landmarks': right_hand
                })
            
            frame_num += 1
    
    cap.release()
    
    # Save JSON
    output_data = {
        'word': word,
        'fps': fps,
        'frame_count': len(frames_data),
        'format': 'MediaPipe_Holistic',
        'frames': frames_data
    }
    
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"    [✓] Extracted {len(frames_data)} frames → {output_file}")
    return output_file


def get_wlasl_video_url(word):
    """Get video URL for a word from WLASL dataset"""
    # Load WLASL metadata
    wlasl_json = Path('C:/Users/prasa/Downloads/WLASL-master/WLASL-master/start_kit/WLASL_v0.3.json')
    
    if not wlasl_json.exists():
        print(f"[!] WLASL metadata not found at {wlasl_json}")
        return None
    
    with open(wlasl_json, 'r') as f:
        wlasl_data = json.load(f)
    
    # Find the word
    for entry in wlasl_data:
        if entry['gloss'].upper() == word.upper():
            # Get first video instance
            if entry.get('instances'):
                video_id = entry['instances'][0]['video_id']
                # WLASL videos are on YouTube
                return f"https://www.youtube.com/watch?v={video_id}", video_id
    
    return None, None


def main():
    """Extract MediaPipe poses for essential ASL words"""
    
    # Words we need (based on your pose_dictionary/)
    words = [
        'HELLO', 'HI', 'GOOD', 'MORNING', 'HOW', 'ARE', 'YOU', 'DOING',
        'MY', 'NAME', 'IS', 'PLEASE', 'THANK', 'WHAT', 'YOUR', 'TONIGHT'
    ]
    
    print("=" * 60)
    print("MEDIAPIPE POSE EXTRACTOR FOR WLASL")
    print("=" * 60)
    print(f"Extracting {len(words)} words...")
    print()
    
    videos_dir = Path('C:/Users/Public/VoiceotTextConverter/WLASL-master/videos')
    videos_dir.mkdir(parents=True, exist_ok=True)
    
    success_count = 0
    
    for i, word in enumerate(words, 1):
        print(f"[{i}/{len(words)}] Processing '{word}'...")
        
        # Get video URL
        url_data = get_wlasl_video_url(word)
        if not url_data or not url_data[0]:
            print(f"    [X] No video found for '{word}' in WLASL dataset")
            continue
        
        url, video_id = url_data
        video_path = videos_dir / f"{word}_{video_id}.mp4"
        
        # Download if not exists
        if not video_path.exists():
            print(f"    [*] Downloading from YouTube...")
            if not download_video_with_ytdlp(url, video_path):
                print(f"    [X] Download failed")
                continue
            print(f"    [✓] Downloaded → {video_path}")
        else:
            print(f"    [✓] Video already exists")
        
        # Extract MediaPipe poses
        json_path = extract_mediapipe_from_video(video_path, word)
        if json_path:
            success_count += 1
        
        print()
    
    print("=" * 60)
    print(f"COMPLETED: {success_count}/{len(words)} words extracted")
    print("=" * 60)
    print()
    print("Next step: Update backend to load JSON files")
    print("Location: poses_mediapipe/*.json")


if __name__ == "__main__":
    main()
