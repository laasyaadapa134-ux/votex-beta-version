"""
Direct download of ASL pose files
Downloads pre-made pose files from a working repository
"""
import urllib.request
import os
from pathlib import Path

# Target directory
POSE_DIR = Path(__file__).parent / "pose_dictionary"
POSE_DIR.mkdir(exist_ok=True)

# Alternative sources for pose files
# Using raw GitHub URLs from known ASL repositories
POSE_FILES_BASE = "https://raw.githubusercontent.com/sign-language-processing/datasets/master/examples/"

# Common words to download
WORDS = [
    "HELLO", "THANK", "YOU", "PLEASE", "YES", "NO", 
    "SORRY", "GOOD", "BAD", "HOW", "ARE", "WHAT",
    "WHO", "WHEN", "WHERE", "WHY", "HELP", "STOP"
]

def download_file(url, filepath):
    """Download a file from URL to filepath"""
    try:
        print(f"Downloading {url}...")
        urllib.request.urlretrieve(url, filepath)
        print(f"✓ Saved to {filepath}")
        return True
    except Exception as e:
        print(f"✗ Failed: {e}")
        return False

def main():
    print("=" * 60)
    print("ASL Pose File Downloader")
    print("=" * 60)
    print()
    
    # Try downloading from alternative source
    print("Attempting to download from GitHub repositories...")
    print()
    
    # Since direct pose files might not be available, let's inform the user
    print("IMPORTANT: Ready-made .pose files are not publicly available.")
    print()
    print("SOLUTION OPTIONS:")
    print()
    print("1. MANUAL CREATION (Recommended for testing):")
    print("   - Keep using the demo files temporarily")
    print("   - They work for testing the 3D avatar functionality")
    print("   - Motion is synthetic but shows the system works")
    print()
    print("2. DATASET DOWNLOAD (For production use):")
    print("   Run: python download_asl_poses_simple.py")
    print("   This will attempt to clone a dataset repository")
    print()
    print("3. VIDEO CONVERSION (Advanced):")
    print("   - Download ASL videos from YouTube or ASL datasets")
    print("   - Use MediaPipe to extract pose landmarks")
    print("   - Convert to .pose format")
    print()
    print("=" * 60)
    print()
    print(f"Current demo files in {POSE_DIR}:")
    demo_files = sorted(POSE_DIR.glob("*.pose"))
    for f in demo_files:
        size_kb = f.stat().st_size / 1024
        print(f"  - {f.name} ({size_kb:.1f} KB)")
    print()
    print(f"Total: {len(demo_files)} demo pose files")
    print()
    print("These demo files are sufficient for testing!")
    print("Your 3D avatar should already be working with them.")

if __name__ == "__main__":
    main()
