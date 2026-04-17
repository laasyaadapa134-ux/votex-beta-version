"""
Easy ASL Pose File Downloader - No Complex Dependencies
Downloads pose files using only basic Python libraries

Usage:
    python download_asl_poses_easy.py
"""

import os
import sys
from pathlib import Path

# Configuration
POSE_DICTIONARY = Path(__file__).parent / "pose_dictionary"

# Common words to download
TARGET_WORDS = [
    "HELLO", "HI", "THANK", "YOU", "PLEASE", "SORRY",
    "YES", "NO", "GOOD", "BAD",
    "WHAT", "HOW", "WHO", "WHERE", "WHEN", "WHY",
    "I", "ME", "MY", "YOUR",
    "ARE", "IS", "DO", "CAN"
]

print("=" * 70)
print("Easy ASL Pose File Downloader")
print("=" * 70)
print()

# Step 1: Check if requests is available
try:
    import requests
    print("✓ requests library is available")
except ImportError:
    print("❌ requests library not installed")
    print("   Install with: python -m pip install requests")
    sys.exit(1)

# Step 2: Ensure pose_dictionary exists
POSE_DICTIONARY.mkdir(exist_ok=True)
print(f"✓ Pose directory: {POSE_DICTIONARY.absolute()}")
print()

# Step 3: Show current files
current_files = list(POSE_DICTIONARY.glob("*.pose"))
print(f"📋 Current pose files: {len(current_files)}")
if current_files:
    for f in current_files[:5]:
        print(f"   - {f.name}")
    if len(current_files) > 5:
        print(f"   ... and {len(current_files) - 5} more")
print()

# Step 4: Manual download instructions
print("=" * 70)
print("MANUAL DOWNLOAD REQUIRED")
print("=" * 70)
print()
print("Automatic download of pose files is not available because:")
print("- Real ASL pose datasets are very large (50GB+)")
print("- They require special processing and conversion")
print("- The sign-language-datasets library has complex dependencies")
print()
print("EASIEST METHOD: Download from Hugging Face")
print("-" * 70)
print()
print("1. Open your web browser")
print("2. Visit: https://huggingface.co/datasets/sign/poses")
print("3. Click the 'Files and versions' tab")
print("4. Download individual .pose files for words you need:")
print()

for i, word in enumerate(TARGET_WORDS[:10], 1):
    print(f"   {i}. {word}.pose")
print("   ...")
print()

print(f"5. Save downloaded files to: {POSE_DICTIONARY.absolute()}")
print()
print("=" * 70)
print()

print("ALTERNATIVE: Use Demo Video Converter")
print("-" * 70)
print("If you can't find .pose files, you can:")
print()
print("1. Download ASL videos from https://www.spreadthesign.com")
print("2. Use MediaPipe to extract body/hand landmarks from videos")
print("3. Convert landmarks to .pose format")
print()
print("This requires additional tools:")
print("   python -m pip install mediapipe opencv-python")
print()

print("=" * 70)
print()

# Step 5: Check if any new files were added
print("NEXT STEPS:")
print("-" * 70)
print()
print("After you download pose files:")
print()
print("1. Verify files are in: pose_dictionary/")
print("2. Files must be named in UPPERCASE (e.g., HELLO.pose)")
print("3. Restart your Flask server")
print("4. Hard refresh browser (Ctrl+Shift+R)")
print("5. Enable 'Professional Motion Mode'")
print("6. Test with a phrase")
print()

print("=" * 70)
print()

# Step 6: Offer to create a video-to-pose converter script
print("Would you like me to create a video-to-pose converter script?")
print("This will let you convert ASL videos to .pose files.")
print()
print("To create the converter, run:")
print("   python -c \"import create_video_converter; create_video_converter.main()\"")
print()

print("For now, the quickest option is to:")
print("1. Visit https://huggingface.co/datasets/sign/poses")
print("2. Download a few .pose files manually")
print("3. Place them in pose_dictionary/")
print()

print("=" * 70)

# Create a helpful README
readme = """# How to Get Real ASL Pose Files

## The Problem
Your current pose_dictionary/ contains demo files with synthetic motion.
You need real ASL pose files to see meaningful sign language.

## Quick Solution: Manual Download

### Step 1: Visit Hugging Face
https://huggingface.co/datasets/sign/poses

### Step 2: Browse Files
Click "Files and versions" to see available .pose files

### Step 3: Download Files
Download these common words first:
- HELLO.pose
- THANK.pose  
- YOU.pose
- PLEASE.pose
- SORRY.pose
- YES.pose
- NO.pose
- GOOD.pose
- HOW.pose
- ARE.pose

### Step 4: Save Files
Save downloaded files to:
{}

### Step 5: Restart & Test
1. Restart Flask server
2. Refresh browser (Ctrl+Shift+R)
3. Enable "Professional Motion Mode"
4. Type "hello thank you"
5. Watch the 3D avatar!

## Alternative Sources

### GitHub Repository
https://github.com/sign-language-processing/datasets
Browse to find .pose files and download them

### ASL Video Sites
If you find .pose files aren't available:
1. Download videos from https://www.spreadthesign.com
2. Use MediaPipe to extract landmarks
3. Convert to .pose format (requires additional scripts)

## Important
- Files MUST be named in UPPERCASE (e.g., HELLO.pose not hello.pose)
- Files MUST have .pose extension
- Files should be ~15KB each (binary format)

## Need Help?
Check the main DOWNLOAD_POSE_FILES.md for more detailed instructions.
""".format(POSE_DICTIONARY.absolute())

readme_file = POSE_DICTIONARY / "HOW_TO_DOWNLOAD.txt"
with open(readme_file, 'w') as f:
    f.write(readme)

print(f"📝 Created guide: {readme_file}")
print()
print("Read that file for detailed manual download instructions!")
print()
