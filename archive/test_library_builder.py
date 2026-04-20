"""
Test the WLASL library builder with a small sample (3 words)
This verifies the setup before running the full 1000-word extraction
"""
import json
from pathlib import Path

# Check dependencies
print("=" * 70)
print("DEPENDENCY CHECK")
print("=" * 70)
print()

# Check 1: yt-dlp
try:
    import subprocess
    result = subprocess.run(['yt-dlp', '--version'], capture_output=True, text=True)
    print(f"[OK] yt-dlp installed: {result.stdout.strip()}")
except FileNotFoundError:
    print("[X] yt-dlp NOT installed")
    print("    Install with: pip install yt-dlp")
except Exception as e:
    print(f"[X] yt-dlp check failed: {e}")

# Check 2: MediaPipe
try:
    import mediapipe
    print(f"[OK] mediapipe installed: {mediapipe.__version__}")
except ImportError:
    print("[X] mediapipe NOT installed")
    print("    Install with: pip install mediapipe")

# Check 3: OpenCV
try:
    import cv2
    print(f"[OK] opencv-python installed: {cv2.__version__}")
except ImportError:
    print("[X] opencv-python NOT installed")
    print("    Install with: pip install opencv-python")

# Check 4: WLASL JSON
wlasl_json_path = Path('C:/Users/prasa/Downloads/WLASL-master/WLASL-master/start_kit/WLASL_v0.3.json')
if wlasl_json_path.exists():
    print(f"[OK] WLASL JSON found: {wlasl_json_path}")
    
    # Show first 3 words
    with open(wlasl_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"    Total words: {len(data)}")
    print(f"    First 3 words for testing:")
    for i, entry in enumerate(data[:3], 1):
        gloss = entry.get('gloss', 'N/A')
        instances = entry.get('instances', [])
        video_id = instances[0].get('video_id') if instances else 'N/A'
        print(f"      {i}. {gloss} (video_id: {video_id})")
else:
    print(f"[X] WLASL JSON NOT found: {wlasl_json_path}")

print()
print("=" * 70)
print("READY STATUS")
print("=" * 70)
print()
print("To install missing dependencies:")
print("  pip install yt-dlp mediapipe opencv-python")
print()
print("To run small test (3 words):")
print("  python build_wlasl_library.py --max-words 3")
print()
print("To run full extraction (1000 words):")
print("  python build_wlasl_library.py --max-words 1000")
print()
print("Estimated time:")
print("  - 3 words: ~5-10 minutes")
print("  - 100 words: ~1-2 hours")
print("  - 1000 words: ~10-15 hours")
print()
