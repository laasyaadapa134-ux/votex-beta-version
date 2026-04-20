import sys
sys.path.insert(0, 'backend')
from pose_stream.pose_format_adapter import build_pose_format_animation_data

result = build_pose_format_animation_data(['HELLO'], 'poses', fps=10)
frame0 = result['pose_stream'][0]['poseLandmarks']

print('Frame 0 MediaPipe landmarks after transformation:')
print(f'Nose (0):       x={frame0[0]["x"]:.3f}, y={frame0[0]["y"]:.3f}')
print(f'LShoulder (11): x={frame0[11]["x"]:.3f}, y={frame0[11]["y"]:.3f}')
print(f'RShoulder (12): x={frame0[12]["x"]:.3f}, y={frame0[12]["y"]:.3f}')
print(f'LWrist (15):    x={frame0[15]["x"]:.3f}, y={frame0[15]["y"]:.3f}')
print(f'RWrist (16):    x={frame0[16]["x"]:.3f}, y={frame0[16]["y"]:.3f}')

print('\nExpected MediaPipe positions for normal human:')
print('Nose should be around:     x=0.5, y=0.3-0.4')
print('Shoulders should be:       x=0.3-0.7, y=0.4-0.5')
print('Wrists should be:          x=0.2-0.8, y=0.5-0.7')
