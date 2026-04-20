"""
Download common WLASL videos and extract MediaPipe landmarks automatically.
"""
import json
import os
import subprocess
import sys
from pathlib import Path

# Common words for text-to-sign language conversion
COMMON_WORDS = [
    # Pronouns & common
    'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their',
    'me', 'him', 'us', 'them',
    
    # Question words
    'what', 'where', 'when', 'who', 'why', 'how', 'which',
    
    # Common verbs
    'am', 'is', 'are', 'was', 'were', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
    'go', 'come', 'want', 'need', 'like', 'love', 'see', 'know', 'think', 'make',
    'get', 'give', 'take', 'eat', 'drink', 'sleep', 'work', 'play', 'help', 'learn',
    'teach', 'read', 'write', 'speak', 'listen', 'understand', 'walk', 'run', 'sit',
    'stand', 'open', 'close', 'start', 'stop', 'finish', 'buy', 'sell', 'pay',
    
    # Common adjectives
    'good', 'bad', 'happy', 'sad', 'big', 'small', 'hot', 'cold', 'new', 'old',
    'young', 'easy', 'hard', 'right', 'wrong', 'clean', 'dirty', 'full', 'empty',
    'fast', 'slow', 'loud', 'quiet', 'beautiful', 'ugly',
    
    # Greetings & polite
    'hello', 'hi', 'goodbye', 'bye', 'please', 'thank', 'sorry', 'welcome',
    
    # Time
    'today', 'tomorrow', 'yesterday', 'now', 'later', 'before', 'after', 'morning',
    'afternoon', 'evening', 'night', 'day', 'week', 'month', 'year',
    
    # Common nouns
    'name', 'family', 'friend', 'mother', 'father', 'brother', 'sister', 'child',
    'baby', 'boy', 'girl', 'man', 'woman', 'person', 'people', 'time', 'water',
    'food', 'home', 'house', 'school', 'work', 'book', 'computer', 'phone', 'car',
    'money', 'door', 'window', 'chair', 'table', 'bed', 'room',
    
    # Numbers (if available)
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    
    # Other common
    'yes', 'no', 'not', 'can', 'will', 'must', 'should', 'all', 'some', 'many',
    'more', 'less', 'and', 'or', 'but', 'because', 'if', 'with', 'without', 'for',
    'about', 'in', 'on', 'at', 'from', 'to', 'up', 'down', 'here', 'there'
]

def load_wlasl_data():
    """Load WLASL v0.3 dataset."""
    wlasl_path = Path('WLASL-master/WLASL-master/start_kit/WLASL_v0.3.json')
    with open(wlasl_path) as f:
        return json.load(f)

def find_gloss_videos(wlasl_data, gloss):
    """Find all video instances for a given gloss."""
    gloss_lower = gloss.lower()
    for entry in wlasl_data:
        if entry['gloss'].lower() == gloss_lower:
            return entry.get('instances', [])
    return []

def download_video(video_id, url, output_dir):
    """Download a video using yt-dlp."""
    output_path = Path(output_dir) / f"{video_id}.mp4"
    
    # Skip if already exists
    if output_path.exists():
        print(f"  ✓ Already downloaded: {video_id}")
        return output_path
    
    try:
        cmd = [
            'yt-dlp',
            '-f', 'best[height<=480]',  # Lower quality for faster download
            '-o', str(output_path),
            url
        ]
        
        print(f"  Downloading {video_id}...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0 and output_path.exists():
            print(f"  ✓ Downloaded: {video_id}")
            return output_path
        else:
            print(f"  ✗ Failed to download {video_id}: {result.stderr[:100]}")
            return None
            
    except Exception as e:
        print(f"  ✗ Error downloading {video_id}: {e}")
        return None

def extract_mediapipe(video_path, output_dir):
    """Extract MediaPipe landmarks from video."""
    try:
        cmd = [
            sys.executable,
            'extract_mediapipe_from_video.py',
            str(video_path)
        ]
        
        print(f"  Extracting MediaPipe data...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        if result.returncode == 0:
            print(f"  ✓ Extracted MediaPipe data")
            return True
        else:
            print(f"  ✗ Extraction failed: {result.stderr[:100]}")
            return False
            
    except Exception as e:
        print(f"  ✗ Error extracting: {e}")
        return False

def main():
    print("=== WLASL Video Download & MediaPipe Extraction ===\n")
    
    # Load WLASL dataset
    print("Loading WLASL dataset...")
    wlasl_data = load_wlasl_data()
    print(f"Loaded {len(wlasl_data)} glosses\n")
    
    # Create output directories
    video_dir = Path('WLASL-master/videos')
    pose_dir = Path('poses_mediapipe')
    video_dir.mkdir(exist_ok=True, parents=True)
    pose_dir.mkdir(exist_ok=True)
    
    # Statistics
    stats = {
        'total': 0,
        'downloaded': 0,
        'extracted': 0,
        'failed': 0,
        'skipped': 0
    }
    
    print(f"Processing {len(COMMON_WORDS)} common words...\n")
    
    for word in COMMON_WORDS:
        stats['total'] += 1
        print(f"[{stats['total']}/{len(COMMON_WORDS)}] {word.upper()}")
        
        # Check if already extracted
        existing_pose = pose_dir / f"{word.upper()}.json"
        if existing_pose.exists():
            print(f"  ✓ Already extracted: {word.upper()}.json")
            stats['skipped'] += 1
            continue
        
        # Find videos for this gloss
        instances = find_gloss_videos(wlasl_data, word)
        
        if not instances:
            print(f"  ✗ No videos found for '{word}'")
            stats['failed'] += 1
            continue
        
        # Try to download and extract first available instance
        success = False
        for instance in instances[:3]:  # Try up to 3 instances
            video_id = instance.get('video_id')
            url = instance.get('url')
            
            if not video_id or not url:
                continue
            
            # Download video
            video_path = download_video(f"{word.upper()}_{video_id}", url, video_dir)
            
            if video_path:
                stats['downloaded'] += 1
                
                # Extract MediaPipe
                if extract_mediapipe(video_path, pose_dir):
                    stats['extracted'] += 1
                    success = True
                    break
        
        if not success:
            stats['failed'] += 1
        
        print()  # Blank line between words
    
    # Print summary
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"Total words attempted:  {stats['total']}")
    print(f"Already had:            {stats['skipped']}")
    print(f"Videos downloaded:      {stats['downloaded']}")
    print(f"MediaPipe extracted:    {stats['extracted']}")
    print(f"Failed:                 {stats['failed']}")
    print(f"\nTotal pose files: {len(list(pose_dir.glob('*.json')))}")
    print("="*50)

if __name__ == '__main__':
    main()
