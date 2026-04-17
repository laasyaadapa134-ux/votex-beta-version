"""Check the FPS of pose files"""
from pose_format import Pose
from pathlib import Path

test_files = ['poses/HELLO.pose', 'poses/HOW.pose', 'poses/ARE.pose', 'poses/YOU.pose']

for filepath in test_files:
    path = Path(filepath)
    if not path.exists():
        continue
    
    with open(path, 'rb') as f:
        pose = Pose.read(f.read())
    
    fps = float(getattr(pose.body, "fps", 0) or 0)
    frame_count = pose.body.data.shape[0]
    duration = frame_count / fps if fps > 0 else 0
    
    print(f"{path.name:15s} - {frame_count:3d} frames @ {fps:5.1f} FPS = {duration:.2f} seconds")
