from backend.pose_stream.pose_format_adapter import build_pose_format_animation_data
res = build_pose_format_animation_data(['THANK'], 'poses', fps=30)
lm = res['pose_stream'][0]['poseLandmarks']
print('Total:', len(lm))
for i in [0, 11, 12, 13, 14, 15, 16, 23, 24]:
  print(f'Point {i}: {lm[i]}')
