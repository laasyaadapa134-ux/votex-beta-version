#!/usr/bin/env python3
from pose_format import Pose
import os

# Read the pose file
with open('GOOD_WORKING.pose', 'rb') as f:
    pose_bytes = f.read()
    
p = Pose.read(pose_bytes)

print(f"Version: {p.header.version}")
print(f"Components: {len(p.header.components)}")
print(f"Component name: {p.header.components[0].name}")
print(f"Points: {len(p.header.components[0].points)}")
print(f"Format: {p.header.components[0].format}")
print(f"Body shape: {p.body.data.shape}")
print(f"Body data size: {p.body.data.nbytes} bytes")
print(f"Confidence size: {p.body.confidence.nbytes} bytes")
print(f"Expected for 50 frames, 1 person, 33 points, 2 dims: {50*1*33*2*4} bytes")
print(f"File size: {len(pose_bytes)} bytes")
print(f"FPS: {p.body.fps}")
