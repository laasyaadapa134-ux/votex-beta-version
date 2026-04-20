"""
Convert .pose files to .json format for the PosePlayer
This script uses the PoseProcessor class to export pose data to JSON
"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from pose_processor import PoseProcessor

# Directory containing .pose files
POSE_DIR = os.path.join(os.path.dirname(__file__), '..', 'poses')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'poses')

def convert_pose_to_json(pose_file, output_file):
    """Convert a single .pose file to JSON"""
    print(f"\nProcessing: {pose_file}")
    
    processor = PoseProcessor(pose_file)
    
    if processor.load_pose():
        processor.inspect_pose()
        # processor.normalize_pose()  # Optional: uncomment if you want normalization
        processor.export_to_json(output_file)
        print(f"✓ Exported to: {output_file}")
        return True
    else:
        print(f"✗ Failed to load: {pose_file}")
        return False

def main():
    """Convert common ASL words to JSON"""
    # List of words to convert
    words = [
        'HELLO', 'GOOD', 'MORNING', 'HOW', 'ARE', 'YOU',
        'THANK', 'PLEASE', 'NAME', 'MY', 'IS', 'WHAT',
        'BLUE', 'APPLE', 'BOOK', 'CAT', 'DOG', 'HELLO'
    ]
    
    print("=" * 60)
    print("Converting .pose files to .json format")
    print("=" * 60)
    
    successful = 0
    failed = 0
    
    for word in words:
        pose_file = os.path.join(POSE_DIR, f"{word}.pose")
        json_file = os.path.join(OUTPUT_DIR, f"{word}.json")
        
        if os.path.exists(pose_file):
            if convert_pose_to_json(pose_file, json_file):
                successful += 1
            else:
                failed += 1
        else:
            print(f"\n✗ File not found: {pose_file}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"Conversion complete!")
    print(f"✓ Successful: {successful}")
    print(f"✗ Failed: {failed}")
    print("=" * 60)

if __name__ == "__main__":
    main()
