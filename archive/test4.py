from backend.pose_stream.pose_format_adapter import load_pose_file
p = load_pose_file('poses/HELLO.pose')
d = p.body.data[0,0,0:15,:]
pts = p.header.components[0].points
for i in range(7): print(f'{pts[i]}: {d[i]}')
