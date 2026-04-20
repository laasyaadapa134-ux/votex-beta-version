from backend.pose_stream.pose_format_adapter import build_pose_format_animation_data

result = build_pose_format_animation_data(['HELLO'], 'poses', fps=60)
print(f'Success! Frames: {len(result["pose_stream"])}, FPS: {result["fps"]}')
print(f'First frame keys: {list(result["pose_stream"][0].keys())}')
print(f'Sample pose landmark: {result["pose_stream"][0].get("poseLandmarks", [])[:3]}')
