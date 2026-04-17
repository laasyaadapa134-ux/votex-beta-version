"""
WLASL Library Builder - Extract coordinates for top 1000 ASL words
Downloads videos from YouTube and extracts pose coordinates using MediaPipe
"""
import json
import os
import sys
from pathlib import Path
import subprocess
import time

# Import our existing functions
from extract_pose_coords_simple import extract_coords
from wlasl_video_lookup import get_video_id


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
        # yt-dlp command to download video
        # Format: best quality MP4, save to specific path
        cmd = [
            'yt-dlp',
            '-f', 'best[ext=mp4]/best',  # Best MP4 format
            '-o', str(output_path),       # Output path
            '--no-playlist',              # Don't download playlists
            '--quiet',                    # Minimal output
            video_url
        ]
        
        # Run yt-dlp
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        if result.returncode == 0 and Path(output_path).exists():
            return True
        else:
            print(f"    [WARN] Download failed: {result.stderr[:100]}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"    [WARN] Download timeout for {video_url}")
        return False
    except FileNotFoundError:
        print(f"    [ERROR] yt-dlp not installed. Install with: pip install yt-dlp")
        return False
    except Exception as e:
        print(f"    [WARN] Download error: {e}")
        return False


def build_wlasl_library(max_words=1000):
    """
    Build ASL pose library from WLASL dataset.
    Downloads videos, extracts coordinates, and saves as .pose files.
    
    Args:
        max_words (int): Number of words to process (default: 1000)
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
    print("WLASL LIBRARY BUILDER")
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
    print(f"Processing: {words_to_process} words")
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
        
        # Skip if no gloss
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
        
        if not video_id:
            print(f"Progress: [{idx}/{words_to_process}] - {gloss} (no video_id)")
            stats['no_video_id'] += 1
            continue
        
        if not video_url:
            print(f"Progress: [{idx}/{words_to_process}] - {gloss} (no video URL)")
            stats['no_video_id'] += 1
            continue
        
        print(f"Progress: [{idx}/{words_to_process}] - Processing {gloss}")
        print(f"    Video ID: {video_id}, URL: {video_url}")
        
        # Define temp video path
        temp_video_path = temp_videos_dir / f"{video_id}.mp4"
        
        try:
            # Step 1: Download video
            print(f"    [1/4] Downloading from {video_url[:50]}...")
            download_success = download_video(video_url, temp_video_path)
            
            if not download_success or not temp_video_path.exists():
                print(f"    [SKIP] Download failed for {gloss}")
                stats['download_failed'] += 1
                continue
            
            # Step 2: Extract coordinates
            print(f"    [2/4] Extracting pose coordinates...")
            
            # Temporarily create symlink or copy to expected location
            # extract_coords expects: C:/Users/Public/VoiceotTextConverter/WLASL-master/videos/{video_id}.mp4
            expected_video_dir = Path('C:/Users/Public/VoiceotTextConverter/WLASL-master/videos')
            expected_video_dir.mkdir(parents=True, exist_ok=True)
            expected_video_path = expected_video_dir / f"{video_id}.mp4"
            
            # Move temp video to expected location
            if temp_video_path.exists():
                temp_video_path.rename(expected_video_path)
            
            # Extract coordinates using our existing function
            coords_json_path = extract_coords(video_id)
            
            if not coords_json_path:
                print(f"    [SKIP] Coordinate extraction failed for {gloss}")
                stats['extraction_failed'] += 1
                # Clean up
                if expected_video_path.exists():
                    expected_video_path.unlink()
                continue
            
            # Step 3: Convert to .pose format (JSON content, .pose extension)
            print(f"    [3/4] Saving as {gloss}.pose...")
            
            # Read the extracted coordinates JSON
            with open(coords_json_path, 'r', encoding='utf-8') as f:
                coord_data = json.load(f)
            
            # Add gloss metadata
            coord_data['gloss'] = gloss
            coord_data['wlasl_video_id'] = video_id
            
            # Save as .pose file (JSON format internally)
            with open(output_pose_file, 'w', encoding='utf-8') as f:
                json.dump(coord_data, f, indent=2)
            
            # Step 4: Delete MP4 and temp JSON to save space
            print(f"    [4/4] Cleaning up...")
            if expected_video_path.exists():
                video_size_mb = expected_video_path.stat().st_size / (1024*1024)
                expected_video_path.unlink()
                print(f"          Deleted MP4 ({video_size_mb:.1f} MB)")
            
            # Delete intermediate JSON (we have .pose now)
            if Path(coords_json_path).exists():
                Path(coords_json_path).unlink()
            
            print(f"    [OK] Saved {gloss}.pose ({output_pose_file.stat().st_size / 1024:.1f} KB)")
            stats['success'] += 1
            
        except Exception as e:
            print(f"    [ERROR] Failed to process {gloss}: {e}")
            stats['extraction_failed'] += 1
            
            # Clean up on error
            if temp_video_path.exists():
                temp_video_path.unlink()
            if expected_video_path.exists():
                expected_video_path.unlink()
        
        # Small delay to avoid rate limiting
        time.sleep(0.5)
    
    # Final summary
    print()
    print("=" * 70)
    print("LIBRARY BUILD COMPLETE")
    print("=" * 70)
    print(f"Total processed:      {words_to_process}")
    print(f"Successfully created: {stats['success']}")
    print(f"Already existed:      {stats['already_exists']}")
    print(f"Download failed:      {stats['download_failed']}")
    print(f"Extraction failed:    {stats['extraction_failed']}")
    print(f"No video ID:          {stats['no_video_id']}")
    print()
    print(f"Output directory: {poses_dir}")
    print(f"Total .pose files: {len(list(poses_dir.glob('*.pose')))}")
    print("=" * 70)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Build ASL pose library from WLASL dataset')
    parser.add_argument('--max-words', type=int, default=1000, 
                        help='Maximum number of words to process (default: 1000)')
    parser.add_argument('--resume', action='store_true',
                        help='Skip words that already have .pose files')
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("WLASL Library Builder")
    print("=" * 70)
    print()
    print("REQUIREMENTS:")
    print("  1. yt-dlp installed: pip install yt-dlp")
    print("  2. MediaPipe installed: pip install mediapipe opencv-python")
    print("  3. Internet connection for downloading videos")
    print()
    print("NOTE: This will download up to 1000 videos from WLASL sources.")
    print("      (Videos from aslbricks.org, YouTube, and other sources)")
    print("      Videos are deleted after processing to save disk space.")
    print("      Estimated time: 5-10 hours for 1000 words")
    print()
    
    response = input("Continue? (yes/no): ").strip().lower()
    if response not in ['yes', 'y']:
        print("Cancelled.")
        sys.exit(0)
    
    print()
    build_wlasl_library(max_words=args.max_words)
