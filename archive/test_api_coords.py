import requests

r = requests.post('http://127.0.0.1:5000/api/asl/pose-stream', json={'glosses':['HELLO'],'fps':10})
data = r.json()

nose_y = data['gloss_data']['HELLO'][0]['poseLandmarks'][0]['y']
print(f'Nose Y from API: {nose_y:.3f}')
print('Expected: 0.478 (from build_pose_format_animation_data test)')
print(f'Match: {abs(nose_y - 0.478) < 0.01}')
