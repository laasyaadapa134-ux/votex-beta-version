"""
Quick test script to extract ONE word with MediaPipe filtering
This will show you the frame reduction before re-extracting all 250 words
"""
import sys
from pathlib import Path
from extract_pose_coords_mediapipe import extract_coords_with_mediapipe
from wlasl_video_lookup import get_video_id
import subprocess
import json

def test_single_word(word="CANDY"):
    """Test extraction with frame filtering for a single word"""
    print("="*70)
    print(f"TESTING MEDIAPIPE EXTRACTION WITH FRAME FILTERING")
    print("="*70)
    print(f"Word: {word}")
    print()
    
    # Get video ID
    video_id = get_video_id(word)
    if not video_id:
        print(f"[ERROR] Could not find video ID for word: {word}")
        return
    
    print(f"Video ID: {video_id}")
    
    # Check if video exists
    video_path = Path(f'C:/Users/Public/VoiceotTextConverter/WLASL-master/videos/{video_id}.mp4')
    if not video_path.exists():
        print(f"[ERROR] Video not found: {video_path}")
        print("Download it first from the WLASL dataset")
        return
    
    print(f"Video found: {video_path.name}")
    print()
    
    # Extract with MediaPipe
    print("Extracting pose coordinates with MediaPipe...")
    print("(This will only save frames where a person is detected)")
    print()
    
    coords_file = extract_coords_with_mediapipe(video_id)
    
    if coords_file:
        print()
        print("="*70)
        print("EXTRACTION SUCCESSFUL")
        print("="*70)
        
        # Load and analyze the output
        with open(coords_file, 'r') as f:
            data = json.load(f)
        
        print(f"Output file: {Path(coords_file).name}")
        print(f"Total video frames: {data.get('total_video_frames', 0)}")
        print(f"Saved frames (with detection): {data.get('saved_frames', len(data['frames']))}")
        print(f"Frame reduction: {((data.get('total_video_frames', 0) - len(data['frames'])) / data.get('total_video_frames', 1) * 100):.1f}%")
        print(f"FPS: {data.get('fps', 30)}")
        print()
        
        # Now rename to word-based filename
        word_based_file = Path('C:/Users/Public/VoiceotTextConverter/poses') / f'{word}.pose'
        Path(coords_file).rename(word_based_file)
        print(f"Renamed to: {word_based_file.name}")
        print()
        print(f"✓ Try loading this in your avatar: http://localhost:5000/threejs_esm_starter.html")
        print(f"  Click the '{word}' button to test!")
    else:
        print()
        print("="*70)
        print("EXTRACTION FAILED")
        print("="*70)
        print("Check the error messages above")

if __name__ == '__main__':
    word = sys.argv[1] if len(sys.argv) > 1 else "CANDY"
    test_single_word(word.upper())
