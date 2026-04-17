"""
WLASL Library Builder with MediaPipe
Builds ASL pose library with REAL motion tracking
Replaces the old static template approach
"""
import json
import os
import sys
from pathlib import Path
import subprocess
import time

# Import MediaPipe extraction function
from extract_pose_coords_mediapipe import extract_coords_with_mediapipe

def download_video(video_url, output_path):
    """
    Download a video using yt-dlp (works for YouTube, direct URLs, etc).
    
    Args:
        video_url (str): Full URL to the video
        output_path (str): Path to save the video
        
    Returns:
        bool: True if successful, False otherwise
    """
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
        
        if result.returncode == 0 and Path(output_path).exists():
            return True
        else:
            return False
            
    except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
        return False


def build_wlasl_library_mediapipe(max_words=50):
    """
    Build ASL pose library from WLASL dataset using MediaPipe for REAL motion tracking.
    
    Args:
        max_words (int): Number of words to process (default: 50)
    """
    # Paths
    wlasl_json_path = Path('C:/Users/prasa/Downloads/WLASL-master/WLASL-master/start_kit/WLASL_v0.3.json')
    poses_dir = Path('C:/Users/Public/VoiceotTextConverter/poses')
    temp_videos_dir = Path('C:/Users/Public/VoiceotTextConverter/temp_videos')
    
    # Create directories
    poses_dir.mkdir(parents=True, exist_ok=True)
    temp_videos_dir.mkdir(parents=True, exist_ok=True)
    
    # Load WLASL JSON
    print("=" * 70)
    print("WLASL LIBRARY BUILDER WITH MEDIAPIPE")
    print("=" * 70)
    print(f"Loading WLASL dataset from: {wlasl_json_path}")
    
    if not wlasl_json_path.exists():
        print(f"[ERROR] WLASL JSON not found at: {wlasl_json_path}")
        return
    
    with open(wlasl_json_path, 'r', encoding='utf-8') as f:
        wlasl_data = json.load(f)
    
    total_entries = len(wlasl_data)
    words_to_process = min(max_words, total_entries)
    
    print(f"Total words in dataset: {total_entries}")
    print(f"Processing: {words_to_process} words with REAL MediaPipe tracking")
    print("=" * 70)
    print()
    
    # Statistics
    stats = {
        'success': 0,
        'already_exists': 0,
        'download_failed': 0,
        'extraction_failed': 0,
        'no_video_id': 0
    }
    
    # Process each word
    for idx, entry in enumerate(wlasl_data[:words_to_process], 1):
        gloss = entry.get('gloss', '').upper()
        instances = entry.get('instances', [])
        
        if not gloss:
            print(f"Progress: [{idx}/{words_to_process}] - Skipped (no gloss)")
            stats['no_video_id'] += 1
            continue
        
        # Check if already processed
        output_pose_file = poses_dir / f"{gloss}.pose"
        if output_pose_file.exists():
            print(f"Progress: [{idx}/{words_to_process}] - {gloss} (already exists)")
            stats['already_exists'] += 1
            continue
        
        # Get first video ID
        if not instances or len(instances) == 0:
            print(f"Progress: [{idx}/{words_to_process}] - {gloss} (no video instances)")
            stats['no_video_id'] += 1
            continue
        
        video_id = instances[0].get('video_id')
        video_url = instances[0].get('url')
        
        if not video_id or not video_url:
            print(f"Progress: [{idx}/{words_to_process}] - {gloss} (no video_id or URL)")
            stats['no_video_id'] += 1
            continue
        
        print(f"Progress: [{idx}/{words_to_process}] - Processing {gloss}")
        print(f"    Video ID: {video_id}")
        
        # Define temp video path
        temp_video_path = temp_videos_dir / f"{video_id}.mp4"
        expected_video_dir = Path('C:/Users/Public/VoiceotTextConverter/WLASL-master/videos')
        expected_video_dir.mkdir(parents=True, exist_ok=True)
        expected_video_path = expected_video_dir / f"{video_id}.mp4"
        
        try:
            # Step 1: Download video
            print(f"    [1/3] Downloading video...")
            download_success = download_video(video_url, temp_video_path)
            
            if not download_success or not temp_video_path.exists():
                print(f"    [SKIP] Download failed for {gloss}")
                stats['download_failed'] += 1
                continue
            
            # Move to expected location
            if temp_video_path.exists():
                temp_video_path.rename(expected_video_path)
            
            # Step 2: Extract coordinates with MediaPipe
            print(f"    [2/3] Extracting with MediaPipe (REAL motion tracking)...")
            coords_json_path = extract_coords_with_mediapipe(video_id)
            
            if not coords_json_path:
                print(f"    [SKIP] MediaPipe extraction failed for {gloss}")
                stats['extraction_failed'] += 1
                # Clean up
                if expected_video_path.exists():
                    expected_video_path.unlink()
                continue
            
            # Step 3: Convert to .pose format
            print(f"    [3/3] Saving as {gloss}.pose...")
            
            # Read the extracted coordinates JSON
            with open(coords_json_path, 'r', encoding='utf-8') as f:
                coord_data = json.load(f)
            
            # Add gloss metadata
            coord_data['gloss'] = gloss
            coord_data['wlasl_video_id'] = video_id
            
            # Save as .pose file
            with open(output_pose_file, 'w', encoding='utf-8') as f:
                json.dump(coord_data, f, indent=2)
            
            # Clean up
            if expected_video_path.exists():
                video_size_mb = expected_video_path.stat().st_size / (1024*1024)
                expected_video_path.unlink()
                print(f"          Deleted MP4 ({video_size_mb:.1f} MB)")
            
            if Path(coords_json_path).exists():
                Path(coords_json_path).unlink()
            
            print(f"    [OK] ✅ Saved {gloss}.pose with REAL MOTION!")
            stats['success'] += 1
            
        except Exception as e:
            print(f"    [ERROR] Failed to process {gloss}: {e}")
            stats['extraction_failed'] += 1
            
            # Clean up on error
            if temp_video_path.exists():
                temp_video_path.unlink()
            if expected_video_path.exists():
                expected_video_path.unlink()
        
        # Small delay
        time.sleep(0.5)
    
    # Final summary
    print()
    print("=" * 70)
    print("LIBRARY BUILD COMPLETE (WITH MEDIAPIPE)")
    print("=" * 70)
    print(f"Total processed:      {words_to_process}")
    print(f"Successfully created: {stats['success']} (with REAL motion!)")
    print(f"Already existed:      {stats['already_exists']}")
    print(f"Download failed:      {stats['download_failed']}")
    print(f"Extraction failed:    {stats['extraction_failed']}")
    print(f"No video ID:          {stats['no_video_id']}")
    print()
    print(f"Output directory: {poses_dir}")
    print(f"Total .pose files: {len(list(poses_dir.glob('*.pose')))}")
    print("\n✅ All new poses have REAL MOTION DATA!")
    print("="*70)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Build ASL pose library with MediaPipe (real motion)')
    parser.add_argument('--max-words', type=int, default=50, 
                        help='Number of words to process (default: 50, recommended for MediaPipe)')
    
    args = parser.parse_args()
    
    print("\n⚠️  MediaPipe extraction is slower but produces REAL motion!")
    print("    Recommended: Start with 10-20 words to test\n")
    
    build_wlasl_library_mediapipe(args.max_words)
