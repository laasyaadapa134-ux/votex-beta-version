from backend.pose_stream.pose_format_adapter import load_pose_file
import os

# Test multiple pose files
test_words = ['HELLO', 'THANK', 'GOOD', 'YES', 'NO']

print("=" * 80)
print("CHECKING MULTIPLE POSE FILES FOR CORRUPTION")
print("=" * 80)

for word in test_words:
    pose_path = f'poses/{word}.pose'
    if not os.path.exists(pose_path):
        print(f"\n❌ {word}: FILE NOT FOUND")
        continue
    
    try:
        pose = load_pose_file(pose_path)
        
        # Get point names
        all_point_names = []
        for comp in pose.header.components:
            all_point_names.extend(list(comp.points))
        
        # Find key body points
        nose_idx = all_point_names.index('Nose') if 'Nose' in all_point_names else None
        ls_idx = all_point_names.index('LShoulder') if 'LShoulder' in all_point_names else None
        rs_idx = all_point_names.index('RShoulder') if 'RShoulder' in all_point_names else None
        lh_idx = all_point_names.index('LHip') if 'LHip' in all_point_names else None
        rh_idx = all_point_names.index('RHip') if 'RHip' in all_point_names else None
        
        if nose_idx is None:
            print(f"\n❌ {word}: No Nose point found!")
            continue
        
        # Get first frame
        frame = pose.body.data[0, 0, :, :]
        
        nose = frame[nose_idx]
        ls = frame[ls_idx] if ls_idx else None
        rs = frame[rs_idx] if rs_idx else None
        lh = frame[lh_idx] if lh_idx else None
        rh = frame[rh_idx] if rh_idx else None
        
        print(f"\n✓ {word}:")
        print(f"  Nose:         ({nose[0]:7.3f}, {nose[1]:7.3f})")
        if ls is not None:
            print(f"  L-Shoulder:   ({ls[0]:7.3f}, {ls[1]:7.3f})")
        if rs is not None:
            print(f"  R-Shoulder:   ({rs[0]:7.3f}, {rs[1]:7.3f})")
        if lh is not None:
            print(f"  L-Hip:        ({lh[0]:7.3f}, {lh[1]:7.3f})")
        if rh is not None:
            print(f"  R-Hip:        ({rh[0]:7.3f}, {rh[1]:7.3f})")
        
        # Check if it makes anatomical sense
        issues = []
        
        # Shoulders should be below nose (higher Y value in pose-format where Y goes up)
        if ls is not None and ls[1] > nose[1]:
            issues.append("  ⚠️  Left shoulder Y > Nose Y (shoulder above nose?)")
        if rs is not None and rs[1] > nose[1]:
            issues.append("  ⚠️  Right shoulder Y > Nose Y (shoulder above nose?)")
        
        # Hips should be even more below shoulders
        if ls is not None and lh is not None and lh[1] > ls[1]:
            issues.append("  ⚠️  Hip Y > Shoulder Y (hip above shoulder?)")
        
        # Shoulders should be roughly at same height
        if ls is not None and rs is not None and abs(ls[1] - rs[1]) > 2.0:
            issues.append(f"  ⚠️  Shoulders height diff: {abs(ls[1] - rs[1]):.2f} (too large)")
        
        # Left shoulder should be to the left (smaller X)
        if ls is not None and rs is not None and ls[0] > rs[0]:
            issues.append("  ⚠️  Left shoulder X > Right shoulder X (SWAPPED!)")
        
        if issues:
            print("\n  🔴 ANATOMICAL ISSUES DETECTED:")
            for issue in issues:
                print(issue)
        else:
            print("  ✅ Anatomy looks reasonable")
            
    except Exception as e:
        print(f"\n❌ {word}: ERROR - {e}")

print("\n" + "=" * 80)
print("CONCLUSION:")
print("=" * 80)
print("If all files show anatomical issues, the pose files are CORRUPTED")
print("or were extracted with WRONG coordinate system assumptions.")
print("=" * 80)
