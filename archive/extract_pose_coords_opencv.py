"""
Extract pose coordinates from WLASL videos using OpenCV DNN + OpenPose
Converts video files to coordinate JSON files for ASL sign language
Uses COCO pose model with 18 keypoints
"""
import cv2
import json
from pathlib import Path
import numpy as np
import urllib.request


# OpenPose COCO model with 18 keypoints
# 0-Nose, 1-Neck, 2-RShoulder, 3-RElbow, 4-RWrist, 5-LShoulder, 6-LElbow, 7-LWrist
# 8-RHip, 9-RKnee, 10-RAnkle, 11-LHip, 12-LKnee, 13-LAnkle, 14-REye, 15-LEye, 16-REar, 17-LEar
POSE_PAIRS = [[1,0], [1,2], [1,5], [2,3], [3,4], [5,6], [6,7], [1,8], [8,9], [9,10], [1,11], [11,12], [12,13], [0,14], [0,15], [14,16], [15,17]]

def download_pose_models():
    """Download OpenPose COCO models if not already present"""
    models_dir = Path('C:/Users/Public/VoiceotTextConverter/models')
    models_dir.mkdir(parents=True, exist_ok=True)
    
    proto_file = models_dir / 'pose_deploy_linevec.prototxt'
    weights_file = models_dir / 'pose_iter_440000.caffemodel'
    
    # URLs for COCO pose model
    proto_url = 'https://raw.githubusercontent.com/CMU-Perceptual-Computing-Lab/openpose/master/models/pose/coco/pose_deploy_linevec.prototxt'
    weights_url = 'http://posefs1.perception.cs.cmu.edu/OpenPose/models/pose/coco/pose_iter_440000.caffemodel'
    
    # Download prototxt if missing
    if not proto_file.exists():
        print(f"    [*] Downloading pose model config...")
        try:
            urllib.request.urlretrieve(proto_url, proto_file)
            print(f"    [OK] Config downloaded")
        except Exception as e:
            print(f"    [ERROR] Failed to download config: {e}")
            return None, None
    
    # Download weights if missing (large file ~200MB)
    if not weights_file.exists():
        print(f"    [*] Downloading pose model weights (~200MB, this may take a while)...")
        try:
            urllib.request.urlretrieve(weights_url, weights_file)
            print(f"    [OK] Weights downloaded")
        except Exception as e:
            print(f"    [ERROR] Failed to download weights: {e}")
            return None, None
    
    return str(proto_file), str(weights_file)


def extract_coords(video_id):
    """
    Extract pose coordinates from a video using OpenCV DNN + OpenPose.
    
    Args:
        video_id (str): The WLASL video ID (e.g., '02997')
        
    Returns:
        str: Path to the exported JSON file, or None if failed
    """
    # Define paths
    video_path = Path(f'C:/Users/Public/VoiceotTextConverter/WLASL-master/videos/{video_id}.mp4')
    output_dir = Path('C:/Users/Public/VoiceotTextConverter/poses')
    output_file = output_dir / f'{video_id}_coords.json'
    
    # Check if video exists
    if not video_path.exists():
        print(f"    [X] Video file not found: {video_path}")
        return None
    
    # Create output directory if needed
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Download/verify pose models
    proto_file, weights_file = download_pose_models()
    if not proto_file or not weights_file:
        print(f"    [X] Failed to get pose models")
        return None
    
    # Load OpenPose model
    try:
        net = cv2.dnn.readNetFromCaffe(proto_file, weights_file)
    except Exception as e:
        print(f"    [X] Failed to load model: {e}")
        return None
    
    # Open video file
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"    [X] Failed to open video: {video_path}")
        return None
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Extract coordinates for each frame
    frames_data = []
    frame_num = 0
    
    print(f"    [*] Processing {total_frames} frames...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_height, frame_width = frame.shape[:2]
        
        # Prepare input blob
        in_width = 368
        in_height = 368
        blob = cv2.dnn.blobFromImage(frame, 1.0/255, (in_width, in_height), (0, 0, 0), swapRB=False, crop=False)
        
        net.setInput(blob)
        output = net.forward()
        
        # Extract keypoints
        points = []
        for i in range(18):  # 18 keypoints in COCO model
            prob_map = output[0, i, :, :]
            min_val, prob, min_loc, point = cv2.minMaxLoc(prob_map)
            
            # Scale points to original frame size
            x = (frame_width * point[0]) / output.shape[3]
            y = (frame_height * point[1]) / output.shape[2]
            
            if prob > 0.1:  # Confidence threshold
                points.append({
                    'x': float(x / frame_width),   # Normalize to 0-1
                    'y': float(y / frame_height),  # Normalize to 0-1
                    'confidence': float(prob)
                })
            else:
                points.append({
                    'x': 0.0,
                    'y': 0.0,
                    'confidence': 0.0
                })
        
        frames_data.append({
            'frame_number': frame_num,
            'pose_landmarks': points
        })
        
        frame_num += 1
        
        # Progress indicator
        if frame_num % 30 == 0:
            progress = (frame_num / total_frames) * 100
            print(f"    [*] Progress: {progress:.1f}% ({frame_num}/{total_frames} frames)")
    
    cap.release()
    
    # Prepare output JSON
    output_data = {
        'video_id': video_id,
        'fps': fps,
        'total_frames': total_frames,
        'model': 'OpenPose_COCO_18pt',
        'frames': frames_data
    }
    
    # Write to file
    try:
        with open(output_file, 'w') as f:
            json.dump(output_data, f, indent=2)
        print(f"    [OK] Saved coordinates: {output_file}")
        return str(output_file)
    except Exception as e:
        print(f"    [X] Failed to write output: {e}")
        return None


if __name__ == '__main__':
    # Test with a video ID
    import sys
    if len(sys.argv) > 1:
        video_id = sys.argv[1]
        result = extract_coords(video_id)
        if result:
            print(f"\n[SUCCESS] Extracted coordinates to: {result}")
        else:
            print(f"\n[FAILED] Could not extract coordinates")
    else:
        print("Usage: python extract_pose_coords_opencv.py <video_id>")
