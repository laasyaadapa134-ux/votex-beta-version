"""
ASL Pose File Downloader
Downloads real ASL pose files from available datasets and saves them to pose_dictionary/

Usage:
    python download_asl_poses.py

Requirements:
    pip install sign-language-datasets pose-format requests
"""

import os
import sys
from pathlib import Path
import json

# Configuration
POSE_DICTIONARY = Path(__file__).parent / "pose_dictionary"
COMMON_WORDS = [
    # Greetings & Basic
    "HELLO", "HI", "GOODBYE", "BYE", "PLEASE", "THANK", "YOU", "SORRY",
    
    # Questions
    "WHAT", "WHO", "WHERE", "WHEN", "WHY", "HOW",
    
    # Pronouns
    "I", "ME", "MY", "YOU", "YOUR", "WE", "THEY",
    
    # Common verbs
    "GO", "COME", "SEE", "LOOK", "WANT", "NEED", "HAVE", "GET", "GIVE",
    "KNOW", "THINK", "HELP", "LIKE", "LOVE", "EAT", "DRINK",
    
    # Common words
    "YES", "NO", "GOOD", "BAD", "HAPPY", "SAD", "NAME", "DAY", "NIGHT",
    "TIME", "TODAY", "TOMORROW", "YESTERDAY", "MORNING", "AFTERNOON", "EVENING",
    
    # Useful phrases
    "ARE", "IS", "WAS", "WERE", "DO", "DOES", "DOING", "DONE",
    "CAN", "WILL", "WOULD", "SHOULD", "COULD",
    "FINE", "OK", "OKAY", "NICE", "GREAT", "BEAUTIFUL"
]


def check_dependencies():
    """Check if required packages are installed"""
    missing = []
    
    try:
        import sign_language_datasets
    except ImportError:
        missing.append("sign-language-datasets")
    
    try:
        from pose_format import Pose
    except ImportError:
        missing.append("pose-format")
    
    try:
        import requests
    except ImportError:
        missing.append("requests")
    
    if missing:
        print("❌ Missing required packages:")
        for pkg in missing:
            print(f"   - {pkg}")
        print("\nInstall with:")
        print(f"   pip install {' '.join(missing)}")
        return False
    
    return True


def download_from_sign_language_datasets():
    """
    Download pose files from sign-language-datasets library
    This uses the official sign language processing datasets
    """
    try:
        print("📦 Loading sign-language-datasets library...")
        from sign_language_datasets.datasets.config import SignDatasetConfig
        from sign_language_datasets.datasets import get_dataset
        from pose_format import Pose
        
        print("🔍 Attempting to download ASL datasets...")
        print("   Note: This may take a while for the first download\n")
        
        # Try different dataset configurations
        dataset_configs = [
            {"name": "aslg-pc12", "version": "1.0.0"},
            {"name": "dgs_corpus", "version": "3.0.0"},  # German, but has pose data
            {"name": "how2sign", "version": "1.0.0"},
        ]
        
        downloaded = 0
        for config_data in dataset_configs:
            try:
                print(f"📥 Trying dataset: {config_data['name']}...")
                config = SignDatasetConfig(
                    name=config_data['name'],
                    version=config_data.get('version', '1.0.0'),
                    include_video=False,
                    include_pose="openpose"
                )
                
                dataset = get_dataset(config)
                
                # Process dataset
                for i, item in enumerate(dataset):
                    if i >= 100:  # Limit to first 100 items to avoid huge downloads
                        break
                    
                    # Extract pose data
                    if 'pose' in item or 'openpose' in item:
                        gloss = item.get('gloss', f'SIGN_{i}').upper()
                        if gloss in COMMON_WORDS:
                            pose_data = item.get('pose') or item.get('openpose')
                            
                            # Save pose file
                            output_file = POSE_DICTIONARY / f"{gloss}.pose"
                            if isinstance(pose_data, Pose):
                                with open(output_file, 'wb') as f:
                                    pose_data.write(f)
                                print(f"   ✓ Downloaded: {gloss}.pose")
                                downloaded += 1
                
                if downloaded > 0:
                    print(f"\n✅ Downloaded {downloaded} pose files from {config_data['name']}")
                    return downloaded
                    
            except Exception as e:
                print(f"   ⚠️  Failed: {e}")
                continue
        
        return downloaded
        
    except Exception as e:
        print(f"❌ Error with sign-language-datasets: {e}")
        return 0


def download_from_github_releases():
    """
    Download pre-built pose files from GitHub releases
    """
    import requests
    
    print("📥 Checking GitHub releases for pose files...")
    
    # GitHub API endpoints for pose files
    repos = [
        "sign-language-processing/datasets",
        "sign-language-processing/pose",
    ]
    
    downloaded = 0
    for repo in repos:
        try:
            # Check releases
            url = f"https://api.github.com/repos/{repo}/releases/latest"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                release = response.json()
                assets = release.get('assets', [])
                
                for asset in assets:
                    if asset['name'].endswith('.pose'):
                        # Extract gloss name from filename
                        gloss = Path(asset['name']).stem.upper()
                        
                        if gloss in COMMON_WORDS:
                            # Download the file
                            print(f"   Downloading {asset['name']}...")
                            file_response = requests.get(asset['browser_download_url'], timeout=30)
                            
                            if file_response.status_code == 200:
                                output_file = POSE_DICTIONARY / f"{gloss}.pose"
                                with open(output_file, 'wb') as f:
                                    f.write(file_response.content)
                                print(f"   ✓ Downloaded: {gloss}.pose")
                                downloaded += 1
                
        except Exception as e:
            print(f"   ⚠️  Failed to check {repo}: {e}")
            continue
    
    return downloaded


def create_sample_from_videos():
    """
    Alternative: Create pose files from ASL videos using MediaPipe
    This requires additional setup but works when datasets aren't available
    """
    print("\n💡 Alternative Method: Convert videos to pose files")
    print("   To use this method:")
    print("   1. Download ASL videos from https://www.spreadthesign.com")
    print("   2. Install: pip install mediapipe opencv-python")
    print("   3. Run a separate script to extract poses from videos")
    print("   (This is more complex - datasets are recommended)")


def create_downloader_info():
    """
    Create a README with manual download instructions
    """
    readme_content = """# ASL Pose Files - Manual Download Guide

## Automatic Download Failed
The automatic download script couldn't fetch pose files. Here are manual alternatives:

## Option 1: Hugging Face Hub (Easiest)
1. Visit: https://huggingface.co/datasets/sign/poses
2. Click "Files and versions"
3. Download individual .pose files for common words
4. Place them in this folder: `pose_dictionary/`

## Option 2: GitHub Repository
1. Visit: https://github.com/sign-language-processing/datasets
2. Browse to the 'poses' directory
3. Download .pose files directly
4. Place them in: `pose_dictionary/`

## Option 3: Clone Repository
```bash
git clone https://github.com/sign-language-processing/datasets.git
cd datasets
# Copy .pose files from their location to your pose_dictionary/
```

## Option 4: Use Python Library
```bash
pip install sign-language-datasets
```

Then run:
```python
from sign_language_datasets.datasets.config import SignDatasetConfig
from sign_language_datasets.datasets import get_dataset

config = SignDatasetConfig(name="aslg-pc12", version="1.0.0")
dataset = get_dataset(config)

# Extract and save poses from dataset
```

## File Naming Convention
Files must be named in UPPERCASE with .pose extension:
- HELLO.pose
- THANK.pose
- YOU.pose
- etc.

## Current Demo Files
Your current pose_dictionary/ contains demo files with synthetic motion.
Replace these with real pose files downloaded from above sources.
"""
    
    readme_file = POSE_DICTIONARY / "DOWNLOAD_INSTRUCTIONS.md"
    with open(readme_file, 'w') as f:
        f.write(readme_content)
    
    print(f"📝 Created manual download guide: {readme_file}")


def main():
    """Main execution"""
    print("=" * 70)
    print("ASL Pose File Downloader")
    print("=" * 70)
    print()
    
    # Check dependencies
    if not check_dependencies():
        print("\n⚠️  Cannot proceed without required packages")
        print("   Install them first, then run this script again")
        return 1
    
    # Ensure pose_dictionary exists
    POSE_DICTIONARY.mkdir(exist_ok=True)
    print(f"📁 Pose directory: {POSE_DICTIONARY}")
    print()
    
    # List current files
    current_files = list(POSE_DICTIONARY.glob("*.pose"))
    print(f"📋 Current pose files: {len(current_files)}")
    if current_files:
        for f in current_files[:10]:  # Show first 10
            print(f"   - {f.name}")
        if len(current_files) > 10:
            print(f"   ... and {len(current_files) - 10} more")
    print()
    
    # Backup existing files
    backup_dir = POSE_DICTIONARY / "backup_demo_files"
    if current_files and not backup_dir.exists():
        print("💾 Backing up current demo files...")
        backup_dir.mkdir(exist_ok=True)
        for pose_file in current_files:
            import shutil
            shutil.copy2(pose_file, backup_dir / pose_file.name)
        print(f"   ✓ Backed up to: {backup_dir}")
        print()
    
    # Try downloading
    total_downloaded = 0
    
    print("🚀 Starting download attempts...\n")
    
    # Method 1: sign-language-datasets library
    print("Method 1: Using sign-language-datasets library")
    print("-" * 70)
    downloaded = download_from_sign_language_datasets()
    total_downloaded += downloaded
    print()
    
    # Method 2: GitHub releases
    if total_downloaded == 0:
        print("Method 2: Checking GitHub releases")
        print("-" * 70)
        downloaded = download_from_github_releases()
        total_downloaded += downloaded
        print()
    
    # Summary
    print("=" * 70)
    if total_downloaded > 0:
        print(f"✅ SUCCESS! Downloaded {total_downloaded} real ASL pose files")
        print()
        print("📂 Files saved to:", POSE_DICTIONARY)
        print()
        print("Next steps:")
        print("1. Restart your server")
        print("2. Open the sign language translator")
        print("3. Enable 'Professional Motion Mode'")
        print("4. Type a phrase like 'hello thank you'")
        print("5. Watch the 3D avatar perform real ASL signs!")
    else:
        print("⚠️  Automatic download failed")
        print()
        print("Creating manual download instructions...")
        create_downloader_info()
        create_sample_from_videos()
        print()
        print("See DOWNLOAD_INSTRUCTIONS.md for manual download steps")
    
    print("=" * 70)
    
    return 0 if total_downloaded > 0 else 1


if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️  Download cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
