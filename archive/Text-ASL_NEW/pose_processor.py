import os
import json
from pose_format import Pose

class PoseProcessor:
    def __init__(self, pose_file):
        self.pose_file = pose_file
        self.pose = None

    def load_pose(self):
        """Load a .pose file using the pose-format library."""
        if not os.path.exists(self.pose_file):
            print(f"Error: File {self.pose_file} not found.")
            return False

        try:
            with open(self.pose_file, "rb") as f:
                self.pose = Pose.read(f.read())
            print(f"Loaded pose file: {self.pose_file}")
            return True
        except Exception as e:
            print(f"Error loading pose file: {e}")
            return False

    def inspect_pose(self):
        """Print details about the pose file."""
        if not self.pose:
            print("No pose data loaded.")
            return

        print(f"Total frames: {len(self.pose.body.data)}")
        print(f"Frame rate (fps): {self.pose.body.fps}")
        components = []
        for component in self.pose.header.components:
            if component.name:
                components.append(component.name)
        print(f"Available components: {', '.join(components)}")

    def normalize_pose(self):
        """Normalize the pose data to center it based on shoulder landmarks."""
        if not self.pose:
            print("No pose data loaded.")
            return

        try:
            num_points = self.pose.body.data.shape[1]
            if num_points >= 13:  # Need at least 13 points for shoulder normalization
                left_shoulder_idx = 11  # MediaPipe index for left shoulder
                right_shoulder_idx = 12  # MediaPipe index for right shoulder

                # Calculate the center point between shoulders
                left_shoulder = self.pose.body.data[:, left_shoulder_idx, :2].mean(axis=0)
                right_shoulder = self.pose.body.data[:, right_shoulder_idx, :2].mean(axis=0)
                center = (left_shoulder + right_shoulder) / 2

                # Normalize all points by subtracting the center
                self.pose.body.data[:, :, :2] -= center
                print("Pose data normalized.")
            else:
                print(f"Pose normalization skipped: only {num_points} point(s) available, need at least 13.")
        except Exception as e:
            print(f"Error normalizing pose: {e}")

    def standardize_pose(self):
        """Interpolate missing hand data for smooth motion."""
        if not self.pose:
            print("No pose data loaded.")
            return

        try:
            # Note: interpolate_missing_frames requires additional pose_format utilities
            # For now, this is a placeholder - implement custom interpolation if needed
            print("Pose data standardization skipped (requires additional utilities).")
        except Exception as e:
            print(f"Error standardizing pose: {e}")

    def export_to_json(self, output_file):
        """Export the processed pose data to a lightweight JSON format."""
        if not self.pose:
            print("No pose data loaded.")
            return

        try:
            import numpy as np
            data = {
                "frames": [],
                "fps": float(self.pose.body.fps)
            }
            for frame in self.pose.body.data:
                frame_data = []
                for point in frame:
                    # Convert to numpy array and flatten to handle nested structures
                    point_array = np.array(point).flatten()
                    if len(point_array) >= 3:
                        frame_data.append({
                            "x": float(point_array[0]), 
                            "y": float(point_array[1]), 
                            "confidence": float(point_array[2])
                        })
                    elif len(point_array) >= 2:
                        frame_data.append({
                            "x": float(point_array[0]), 
                            "y": float(point_array[1]), 
                            "confidence": 1.0
                        })
                data["frames"].append({"pose_landmarks": frame_data})

            with open(output_file, "w") as f:
                json.dump(data, f, indent=2)
            print(f"Pose data exported to {output_file}.")
        except Exception as e:
            print(f"Error exporting pose data: {e}")

if __name__ == "__main__":
    processor = PoseProcessor("../poses/HELLO.pose")
    if processor.load_pose():
        processor.inspect_pose()
        processor.normalize_pose()
        processor.standardize_pose()
        processor.export_to_json("hello_output.json")