"""
Quick test of the fixed download functionality
Tests downloading 1 video from the actual WLASL URL
"""
from build_wlasl_library import download_video
from pathlib import Path
import json

# Load WLASL JSON
wlasl_json = Path('C:/Users/prasa/Downloads/WLASL-master/WLASL-master/start_kit/WLASL_v0.3.json')
with open(wlasl_json, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Get first word
first_word = data[0]
gloss = first_word['gloss']
video_id = first_word['instances'][0]['video_id']
video_url = first_word['instances'][0]['url']

print("=" * 70)
print("DOWNLOAD TEST")
print("=" * 70)
print(f"Word: {gloss}")
print(f"Video ID: {video_id}")
print(f"URL: {video_url}")
print()

# Test download
temp_dir = Path('C:/Users/Public/VoiceotTextConverter/temp_videos')
temp_dir.mkdir(parents=True, exist_ok=True)
output_file = temp_dir / f"{video_id}.mp4"

print("Attempting download...")
result = download_video(video_url, output_file)

if result:
    print(f"[OK] Download successful!")
    print(f"     File: {output_file}")
    print(f"     Size: {output_file.stat().st_size / (1024*1024):.2f} MB")
    
    # Clean up
    output_file.unlink()
    print("     (Deleted test file)")
else:
    print(f"[FAIL] Download failed")
    print(f"       Check if yt-dlp is installed: pip install yt-dlp")

print("=" * 70)
