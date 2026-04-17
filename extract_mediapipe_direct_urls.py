"""
MediaPipe Pose Extraction from Direct WLASL URLs
Downloads videos directly and extracts MediaPipe format poses
"""
import json
import os
import subprocess
from pathlib import Path
import cv2
import urllib.request

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("❌ MediaPipe not installed!")
    exit(1)


def download_video_direct(url, output_path):
    """Download video directly from URL"""
    try:
        print(f"    [*] Downloading from {url[:50]}...")
        urllib.request.urlretrieve(url, str(output_path))
        if Path(output_path).exists() and Path(output_path).stat().st_size > 0:
            return True
        return False
    except Exception as e:
        print(f"    [X] Download failed: {e}")
        return False


def extract_mediapipe_from_video(video_path, word):
    """Extract MediaPipe poses from video and save as JSON"""
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
    
    print(f"    [✓] Extracted {len(frames_data)} frames → {output_file.name}")
    return output_file


def get_wlasl_video_url(word, wlasl_json_path):
    """Get direct video URL for a word from WLASL dataset"""
    with open(wlasl_json_path, 'r') as f:
        wlasl_data = json.load(f)
    
    # Find the word
    for entry in wlasl_data:
        if entry['gloss'].upper() == word.upper():
            # Get first video instance with a valid URL
            if entry.get('instances'):
                for instance in entry['instances']:
                    url = instance.get('url', '')
                    # Prefer direct MP4 URLs
                    if url and ('.mp4' in url or 'aslbricks' in url or 'aslsignbank' in url):
                        return url, instance.get('video_id', 'unknown')
    
    return None, None


def main():
    """Extract MediaPipe poses for essential ASL words"""
    
    # Words we need
    words = [
        'HELLO', 'GOOD', 'MORNING', 'HOW', 'YOU',
        'MY', 'NAME', 'PLEASE', 'WHAT', 'TONIGHT',
        'THANK', 'BOOK', 'CAT', 'BIRD', 'APPLE'
    ]
    
    print("=" * 60)
    print("MEDIAPIPE POSE EXTRACTOR FOR WLASL (Direct URLs)")
    print("=" * 60)
    print(f"Extracting {len(words)} words...")
    print()
    
    wlasl_json = Path('C:/Users/prasa/Downloads/WLASL-master/WLASL-master/start_kit/WLASL_v0.3.json')
    videos_dir = Path('C:/Users/Public/VoiceotTextConverter/WLASL-master/videos')
    videos_dir.mkdir(parents=True, exist_ok=True)
    
    success_count = 0
    
    for i, word in enumerate(words, 1):
        print(f"[{i}/{len(words)}] Processing '{word}'...")
        
        # Get video URL
        url, video_id = get_wlasl_video_url(word, wlasl_json)
        if not url:
            print(f"    [X] No video found for '{word}' in WLASL dataset")
            continue
        
        video_path = videos_dir / f"{word}_{video_id}.mp4"
        
        # Download if not exists
        if not video_path.exists():
            if not download_video_direct(url, video_path):
                print(f"    [X] Download failed, skipping...")
                continue
            print(f"    [✓] Downloaded → {video_path.name}")
        else:
            print(f"    [✓] Video already exists: {video_path.name}")
        
        # Extract MediaPipe poses
        json_path = extract_mediapipe_from_video(video_path, word)
        if json_path:
            success_count += 1
        
        print()
    
    print("=" * 60)
    print(f"COMPLETED: {success_count}/{len(words)} words extracted")
    print("=" * 60)
    
    if success_count > 0:
        print()
        print("✅ MediaPipe poses extracted successfully!")
        print(f"📁 Location: poses_mediapipe/*.json")
        print()
        print("Next steps:")
        print("1. Restart server: cd home_page && python server.py")
        print("2. Test with browser: http://127.0.0.1:5000/text-to-sign-language")
        print("3. Type a sentence and see perfect hands!")
    else:
        print()
        print("⚠️ No videos extracted. Try alternative approach...")


if __name__ == "__main__":
    main()
