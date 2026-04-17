"""
Simple ASL Pose File Downloader - Alternative Method
Downloads pose files from direct URLs when available

Usage:
    python download_asl_poses_simple.py
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
    "GO", "COME", "WANT", "NEED", "HELP", "KNOW",
    "ARE", "IS", "DO", "CAN"
]


def download_with_requests():
    """Try downloading using requests library"""
    try:
        import requests
    except ImportError:
        print("❌ requests library not installed")
        print("   Install with: pip install requests")
        return False
    
    print("📥 Attempting to download from known sources...")
    
    # Direct links to pose files (these would need to be actual URLs)
    # This is a template - you would replace with actual working URLs
    base_urls = [
        "https://raw.githubusercontent.com/sign-language-processing/datasets/main/poses/",
        "https://huggingface.co/datasets/sign/poses/resolve/main/",
    ]
    
    downloaded = 0
    for word in TARGET_WORDS:
        filename = f"{word}.pose"
        
        for base_url in base_urls:
            try:
                url = base_url + filename
                print(f"   Trying: {word}...", end=" ")
                
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    output_file = POSE_DICTIONARY / filename
                    with open(output_file, 'wb') as f:
                        f.write(response.content)
                    print(f"✓")
                    downloaded += 1
                    break
                else:
                    print(f"✗ (HTTP {response.status_code})")
            except requests.exceptions.RequestException as e:
                print(f"✗ ({type(e).__name__})")
                continue
    
    return downloaded > 0


def install_and_use_git():
    """Clone repository and copy pose files"""
    import subprocess
    import shutil
    
    print("\n📦 Attempting to clone repository...")
    
    temp_dir = Path("temp_sign_lang_datasets")
    
    try:
        # Clone repository
        print("   Cloning sign-language-processing/datasets...")
        result = subprocess.run(
            ["git", "clone", "--depth", "1", 
             "https://github.com/sign-language-processing/datasets.git",
             str(temp_dir)],
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode != 0:
            print(f"   ✗ Git clone failed: {result.stderr}")
            return False
        
        # Find and copy pose files
        print("   Searching for .pose files...")
        pose_files = list(temp_dir.rglob("*.pose"))
        
        if not pose_files:
            print("   ✗ No .pose files found in repository")
            return False
        
        # Copy relevant files
        copied = 0
        for pose_file in pose_files:
            word = pose_file.stem.upper()
            if word in TARGET_WORDS or len(TARGET_WORDS) == 0:  # Copy all if list is empty
                dest = POSE_DICTIONARY / f"{word}.pose"
                shutil.copy2(pose_file, dest)
                print(f"   ✓ Copied: {word}.pose")
                copied += 1
        
        print(f"\n   ✅ Copied {copied} pose files")
        
        # Cleanup
        print("   Cleaning up temporary files...")
        shutil.rmtree(temp_dir)
        
        return copied > 0
        
    except subprocess.TimeoutExpired:
        print("   ✗ Git clone timed out")
        return False
    except FileNotFoundError:
        print("   ✗ Git not found - please install git")
        return False
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False
    finally:
        # Cleanup on error
        if temp_dir.exists():
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)


def show_manual_instructions():
    """Display manual download instructions"""
    print("\n" + "=" * 70)
    print("MANUAL DOWNLOAD INSTRUCTIONS")
    print("=" * 70)
    print()
    print("Since automatic download didn't work, here's how to get pose files:")
    print()
    print("🔗 OPTION 1: Direct Download from Hugging Face")
    print("   1. Visit: https://huggingface.co/datasets/sign/poses")
    print("   2. Click 'Files and versions' tab")
    print("   3. Download .pose files you need")
    print(f"   4. Save them to: {POSE_DICTIONARY.absolute()}")
    print()
    print("🔗 OPTION 2: Browse GitHub Repository")
    print("   1. Visit: https://github.com/sign-language-processing/datasets")
    print("   2. Navigate to pose files directory")
    print("   3. Download individual .pose files")
    print(f"   4. Save them to: {POSE_DICTIONARY.absolute()}")
    print()
    print("🔗 OPTION 3: Use Git (if installed)")
    print("   git clone https://github.com/sign-language-processing/datasets.git")
    print("   cd datasets")
    print(f"   # Copy .pose files to: {POSE_DICTIONARY.absolute()}")
    print()
    print("📝 IMPORTANT:")
    print("   - Files must be named in UPPERCASE (e.g., HELLO.pose, THANK.pose)")
    print("   - Files must have .pose extension")
    print("   - Replace existing demo files in pose_dictionary/")
    print()
    print("=" * 70)


def main():
    print("=" * 70)
    print("Simple ASL Pose File Downloader")
    print("=" * 70)
    print()
    
    # Ensure directory exists
    POSE_DICTIONARY.mkdir(exist_ok=True)
    print(f"📁 Target directory: {POSE_DICTIONARY.absolute()}")
    print()
    
    # Show current files
    current_files = list(POSE_DICTIONARY.glob("*.pose"))
    print(f"📋 Current files: {len(current_files)}")
    print()
    
    success = False
    
    # Try Method 1: Direct HTTP download
    print("Method 1: Direct HTTP download")
    print("-" * 70)
    if download_with_requests():
        success = True
    print()
    
    # Try Method 2: Git clone
    if not success:
        print("Method 2: Git repository clone")
        print("-" * 70)
        if install_and_use_git():
            success = True
        print()
    
    # Summary
    if success:
        new_files = list(POSE_DICTIONARY.glob("*.pose"))
        print("=" * 70)
        print(f"✅ SUCCESS! Now you have {len(new_files)} pose files")
        print()
        print("Next steps:")
        print("1. Restart your Flask server")
        print("2. Refresh your browser (Ctrl+Shift+R)")
        print("3. Enable 'Professional Motion Mode'")
        print("4. Try translating a phrase")
        print("=" * 70)
    else:
        show_manual_instructions()
    
    return 0 if success else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
