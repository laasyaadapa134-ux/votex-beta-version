import sys
sys.path.insert(0, 'backend')
from pose_stream.pose_format_adapter import get_component_ranges
from pose_format import Pose

p = Pose.read(open('poses/HELLO.pose','rb').read())
r = get_component_ranges(p)

print('Detected ranges:')
print(f'Pose: {r.get("pose")}')
print(f'Left hand: {r.get("left_hand")}')
print(f'Right hand: {r.get("right_hand")}')

names = r.get('point_names', [])
print(f'\nTotal point names: {len(names)}')

if r.get('left_hand'):
    lh = r['left_hand']
    print(f'\nLeft hand points ({lh[0]} to {lh[1]}):')
    print(names[lh[0]:lh[1]][:15])

if r.get('right_hand'):
    rh = r['right_hand']
    print(f'\nRight hand points ({rh[0]} to {rh[1]}):')
    print(names[rh[0]:rh[1]][:15])
