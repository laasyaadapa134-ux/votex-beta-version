"""
WLASL Pose Extractor with MediaPipe
Extracts REAL pose coordinates with actual motion tracking from ASL videos
This replaces the static template approach with genuine body tracking
"""
import cv2
import json
from pathlib import Path
import sys

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("❌ MediaPipe not installed!")
    print("   Install with: pip install mediapipe")
    print("   Or use: pip install mediapipe opencv-python")


def extract_coords_with_mediapipe(video_id):
    """
    Extract pose coordinates using MediaPipe Pose tracking.
    This provides REAL motion data with changing x, y, z coordinates.
    
    Args:
        video_id (str): The WLASL video ID (e.g., '08909')
        
    Returns:
        str: Path to the exported JSON file, or None if failed
    """
    if not MEDIAPIPE_AVAILABLE:
        print("    [X] MediaPipe not available. Cannot extract poses.")
        return None
    
    # Define paths
    video_path = Path(f'C:/Users/Public/VoiceotTextConverter/WLASL-master/videos/{video_id}.mp4')
    output_dir = Path('C:/Users/Public/VoiceotTextConverter/poses')
    output_file = output_dir / f'{video_id}_coords.json'
    
    # Check if video exists
    if not video_path.exists():
        print(f"    [X] Video file not found: {video_path}")
        return None
    
    # Create output directory if needed
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Open video file
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"    [X] Failed to open video: {video_path}")
        return None
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"    [*] Processing {total_frames} frames at {fps:.1f} fps with MediaPipe...")
    
    # Initialize MediaPipe Pose
    mp_pose = mp.solutions.pose
    mp_hands = mp.solutions.hands
    
    frames_data = []
    frame_num = 0
    successful_frames = 0
    
    # Process with MediaPipe
    with mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,  # 0=Lite, 1=Full, 2=Heavy
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
            
            # Convert BGR to RGB (MediaPipe requirement)
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process pose
            pose_results = pose.process(image_rgb)
            hands_results = hands.process(image_rgb)
            
            # Extract pose landmarks (33 landmarks in MediaPipe Pose)
            # ONLY SAVE FRAMES WHERE POSE IS ACTUALLY DETECTED
            if pose_results.pose_landmarks:
                pose_landmarks = []
                for landmark in pose_results.pose_landmarks.landmark:
                    pose_landmarks.append({
                        'x': float(landmark.x),           # REAL coordinates!
                        'y': float(landmark.y),           # REAL coordinates!
                        'z': float(landmark.z),           # REAL depth!
                        'visibility': float(landmark.visibility)
                    })
                
                # Extract hand landmarks
                left_hand_landmarks = []
                right_hand_landmarks = []
                
                if hands_results.multi_hand_landmarks and hands_results.multi_handedness:
                    for hand_landmarks, handedness in zip(
                        hands_results.multi_hand_landmarks,
                        hands_results.multi_handedness
                    ):
                        # Determine if left or right hand
                        hand_label = handedness.classification[0].label
                        
                        landmarks = []
                        for landmark in hand_landmarks.landmark:
                            landmarks.append({
                                'x': float(landmark.x),
                                'y': float(landmark.y),
                                'z': float(landmark.z),
                                'visibility': 1.0
                            })
                        
                        if hand_label == 'Left':
                            left_hand_landmarks = landmarks
                        else:
                            right_hand_landmarks = landmarks
                
                # Store frame data ONLY when pose is detected
                frames_data.append({
                    'frame_number': frame_num,
                    'pose_landmarks': pose_landmarks,
                    'left_hand_landmarks': left_hand_landmarks,
                    'right_hand_landmarks': right_hand_landmarks
                })
                successful_frames += 1
            
            frame_num += 1
            
            # Progress indicator every 30 frames
            if frame_num % 30 == 0:
                progress = (frame_num / total_frames) * 100
                print(f"    [*] Progress: {progress:.1f}% ({frame_num}/{total_frames} frames, {successful_frames} with pose)")
    
    cap.release()
    
    # Prepare output JSON
    actual_frames_saved = len(frames_data)
    output_data = {
        'video_id': video_id,
        'fps': fps,
        'total_video_frames': total_frames,
        'saved_frames': actual_frames_saved,
        'frame_width': frame_width,
        'frame_height': frame_height,
        'model': 'MediaPipe_Pose_v1',
        'note': f'Real pose tracking - Only frames with detected poses saved: {actual_frames_saved}/{total_frames} frames',
        'frames': frames_data
    }
    
    # Write to file
    try:
        with open(output_file, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        success_rate = (actual_frames_saved / total_frames) * 100 if total_frames > 0 else 0
        print(f"    [OK] Saved coordinates to {output_file.name}")
        print(f"    [OK] Frames saved: {actual_frames_saved}/{total_frames} ({success_rate:.1f}%) - Filtered to only detected poses")
        return str(output_file)
    except Exception as e:
        print(f"    [X] Failed to write output: {e}")
        return None


def main():
    """Main function for command-line usage"""
    if not MEDIAPIPE_AVAILABLE:
        print("\n" + "="*70)
        print("MEDIAPIPE INSTALLATION REQUIRED")
        print("="*70)
        print("\nTo extract poses with real motion tracking, install MediaPipe:")
        print("\n  pip install mediapipe opencv-python")
        print("\nAfter installation, run this script again.")
        print("="*70)
        return
    
    if len(sys.argv) > 1:
        video_id = sys.argv[1]
        print(f"\n{'='*70}")
        print(f"Extracting pose for video: {video_id}")
        print('='*70)
        
        result = extract_coords_with_mediapipe(video_id)
        
        if result:
            print(f"\n✅ SUCCESS! Extracted real motion data to: {result}")
            print("\nThis pose file now contains ACTUAL MOVEMENT!")
            print("The x, y, z coordinates change over time.")
        else:
            print(f"\n❌ FAILED to extract coordinates")
    else:
        print("\nUsage: python extract_pose_coords_mediapipe.py <video_id>")
        print("\nExample:")
        print("  python extract_pose_coords_mediapipe.py 08909")
        print("\nThis will extract REAL pose data (not static templates).")


if __name__ == '__main__':
    main()
