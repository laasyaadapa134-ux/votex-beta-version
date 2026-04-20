"""
Extract pose coordinates from WLASL videos using MediaPipe Holistic
Converts video files to coordinate JSON files for ASL sign language
"""
import cv2
import mediapipe as mp
import json
from pathlib import Path
import numpy as np


def extract_coords(video_id):
    """
    Extract pose, left hand, and right hand coordinates from a video using MediaPipe.
    
    Args:
        video_id (str): The WLASL video ID (e.g., '02997')
        
    Returns:
        str: Path to the exported JSON file, or None if failed
    """
    # Define paths
    video_path = Path(f'C:/Users/Public/VoiceotTextConverter/WLASL-master/videos/{video_id}.mp4')
    output_dir = Path('C:/Users/Public/VoiceotTextConverter/poses')
    output_file = output_dir / f'{video_id}_coords.json'
    
    # Check if video exists
    if not video_path.exists():
        print(f"[X] Video file not found: {video_path}")
        return None
    
    # Create output directory if needed
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Initialize MediaPipe Holistic
    mp_holistic = mp.solutions.holistic
    holistic = mp_holistic.Holistic(
        static_image_mode=False,
        model_complexity=1,
        smooth_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    # Open video file
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"[X] Failed to open video: {video_path}")
        return None
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps if fps > 0 else 0
    
    print(f"[VIDEO] Processing: {video_id}.mp4")
    print(f"        FPS: {fps:.2f}, Frames: {frame_count}, Duration: {duration:.2f}s")
    
    # Storage for all frames
    all_frames = []
    frame_idx = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = holistic.process(image_rgb)
        
        # Extract coordinates
        frame_data = {
            'frame_number': frame_idx,
            'pose_landmarks': None,
            'left_hand_landmarks': None,
            'right_hand_landmarks': None
        }
        
        # Extract pose landmarks (33 landmarks)
        if results.pose_landmarks:
            frame_data['pose_landmarks'] = [
                {
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                }
                for landmark in results.pose_landmarks.landmark
            ]
        
        # Extract left hand landmarks (21 landmarks)
        if results.left_hand_landmarks:
            frame_data['left_hand_landmarks'] = [
                {
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z
                }
                for landmark in results.left_hand_landmarks.landmark
            ]
        
        # Extract right hand landmarks (21 landmarks)
        if results.right_hand_landmarks:
            frame_data['right_hand_landmarks'] = [
                {
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z
                }
                for landmark in results.right_hand_landmarks.landmark
            ]
        
        all_frames.append(frame_data)
        frame_idx += 1
        
        # Progress indicator
        if frame_idx % 30 == 0:
            progress = (frame_idx / frame_count) * 100 if frame_count > 0 else 0
            print(f"        Progress: {frame_idx}/{frame_count} frames ({progress:.1f}%)")
    
    # Release resources
    cap.release()
    holistic.close()
    
    # Prepare output data
    output_data = {
        'video_id': video_id,
        'metadata': {
            'fps': fps,
            'total_frames': frame_idx,
            'duration_seconds': duration,
            'video_path': str(video_path)
        },
        'frames': all_frames
    }
    
    # Save to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"[OK] Exported {frame_idx} frames to: {output_file}")
    print(f"     File size: {output_file.stat().st_size / 1024:.1f} KB")
    
    return str(output_file)


def extract_coords_batch(video_ids):
    """
    Process multiple videos in batch.
    
    Args:
        video_ids (list): List of video IDs to process
        
    Returns:
        dict: Results with success/failure counts
    """
    results = {
        'success': [],
        'failed': [],
        'total': len(video_ids)
    }
    
    print("=" * 70)
    print(f"BATCH PROCESSING: {len(video_ids)} videos")
    print("=" * 70)
    print()
    
    for i, video_id in enumerate(video_ids, 1):
        print(f"[{i}/{len(video_ids)}] Processing video: {video_id}")
        output_path = extract_coords(video_id)
        
        if output_path:
            results['success'].append(video_id)
        else:
            results['failed'].append(video_id)
        
        print()
    
    # Summary
    print("=" * 70)
    print("BATCH PROCESSING COMPLETE")
    print("=" * 70)
    print(f"[OK] Success: {len(results['success'])}")
    print(f"[X]  Failed:  {len(results['failed'])}")
    
    if results['failed']:
        print("\nFailed videos:")
        for vid in results['failed']:
            print(f"  - {vid}")
    
    return results


def get_landmark_stats(json_file):
    """
    Analyze extracted coordinate file and show statistics.
    
    Args:
        json_file (str): Path to the coordinate JSON file
    """
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    frames = data['frames']
    pose_detected = sum(1 for f in frames if f['pose_landmarks'] is not None)
    left_hand_detected = sum(1 for f in frames if f['left_hand_landmarks'] is not None)
    right_hand_detected = sum(1 for f in frames if f['right_hand_landmarks'] is not None)
    
    total_frames = len(frames)
    
    print(f"[STATS] Landmark Detection Statistics")
    print(f"        Total frames: {total_frames}")
    print(f"        Pose landmarks: {pose_detected}/{total_frames} ({pose_detected/total_frames*100:.1f}%)")
    print(f"        Left hand: {left_hand_detected}/{total_frames} ({left_hand_detected/total_frames*100:.1f}%)")
    print(f"        Right hand: {right_hand_detected}/{total_frames} ({right_hand_detected/total_frames*100:.1f}%)")


# Test the function
if __name__ == "__main__":
    print("=" * 70)
    print("MediaPipe Pose Coordinate Extractor")
    print("=" * 70)
    print()
    
    # Test case: Extract coordinates for 'apple' (video ID from WLASL lookup)
    test_video_id = '02997'  # First video for "apple"
    
    print(f"Test: Extracting coordinates for video ID: {test_video_id}")
    print()
    
    result = extract_coords(test_video_id)
    
    if result:
        print()
        print("=" * 70)
        print("SUCCESS! Coordinate extraction complete.")
        print("=" * 70)
        print()
        
        # Show statistics
        get_landmark_stats(result)
        
        print()
        print("Next steps:")
        print("  1. Check the JSON file to verify coordinates")
        print("  2. Convert JSON to .pose format (pose-format library)")
        print("  3. Save as APPLE.pose in pose_dictionary/")
    else:
        print()
        print("=" * 70)
        print("FAILED - Video file not found")
        print("=" * 70)
        print()
        print("To download WLASL videos, you need to:")
        print("  1. Visit: https://dxli94.github.io/WLASL/")
        print("  2. Download the video dataset (separate from the metadata)")
        print("  3. Extract to: C:/Users/Public/VoiceotTextConverter/WLASL-master/videos/")
        print()
        print("Note: WLASL videos are hosted on YouTube and require separate download.")
        print("      The metadata JSON only contains video IDs, not the actual videos.")
