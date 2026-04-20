import os
import json

def validate_and_fix_pose_file(file_path):
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)

        # Validate and normalize confidence values
        for frame in data.get('frames', []):
            for landmark in frame.get('pose_landmarks', []):
                if 'confidence' in landmark:
                    landmark['confidence'] = max(0.0, min(1.0, landmark['confidence']))

        # Save the fixed file
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Validated and fixed: {file_path}")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")


def process_all_pose_files(directory):
    for file_name in os.listdir(directory):
        if file_name.endswith('.pose'):
            file_path = os.path.join(directory, file_name)
            validate_and_fix_pose_file(file_path)


if __name__ == "__main__":
    poses_directory = "c:\\Users\\Public\\VoiceotTextConverter\\poses"
    process_all_pose_files(poses_directory)