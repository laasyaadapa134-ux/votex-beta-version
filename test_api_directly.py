import requests
import json

# Test the API directly
url = "http://127.0.0.1:5000/api/asl/pose-stream"
payload = {
    "glosses": ["TEST"],
    "fps": 30,
    "transition_frames": 8,
    "smoothing_engine": "pose-format"
}

print("Sending request to:", url)
print("Payload:", json.dumps(payload, indent=2))
print("\n" + "=" * 80)

response = requests.post(url, json=payload, timeout=10)

print(f"Response Status: {response.status_code}")
print("=" * 80)

if response.ok:
    data = response.json()
    print(f"\nResponse Keys: {list(data.keys())}")
    print(f"Mode: {data.get('mode', 'N/A')}")
    print(f"FPS: {data.get('fps', 'N/A')}")
    print(f"Glosses: {data.get('glosses', 'N/A')}")
    print(f"Frame Count: {data.get('frame_count', 'N/A')}")
    
    if 'gloss_data' in data:
        gloss_keys = list(data['gloss_data'].keys())
        print(f"\nGloss Data Keys: {gloss_keys}")
        
        if gloss_keys:
            first_key = gloss_keys[0]
            frames = data['gloss_data'][first_key]
            print(f"\nFrames for '{first_key}': {len(frames)}")
            
            if frames:
                print(f"\nFirst Frame Structure:")
                first_frame = frames[0]
                print(f"  Keys: {list(first_frame.keys())}")
                
                if 'poseLandmarks' in first_frame:
                    pose_lm = first_frame['poseLandmarks']
                    print(f"  Pose Landmarks: {len(pose_lm)}")
                    print(f"  Sample landmarks (0-4):")
                    for i in range(min(5, len(pose_lm))):
                        lm = pose_lm[i]
                        print(f"    [{i}] x={lm['x']:.3f}, y={lm['y']:.3f}, z={lm['z']:.3f}")
                
                if 'leftHandLandmarks' in first_frame:
                    print(f"  Left Hand Landmarks: {len(first_frame['leftHandLandmarks'])}")
                
                if 'rightHandLandmarks' in first_frame:
                    print(f"  Right Hand Landmarks: {len(first_frame['rightHandLandmarks'])}")
else:
    print(f"ERROR: {response.text}")
