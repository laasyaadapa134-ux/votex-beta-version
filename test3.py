from backend.pose_stream.pose_format_adapter import load_pose_file
p = load_pose_file('poses/THANK.pose')
d = p.body.data[0,0,0:15,:]
pts = p.header.components[0].points
for i in range(15): print(f'{pts[i]}: {d[i]}')
