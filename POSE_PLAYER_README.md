# 3D Pose Player - Implementation Guide

## ✅ Status: Complete

### What's Implemented

#### 1. **225 .pose Files Available** 
Located in `/poses/` directory, including:
- CANDY.pose ✓
- CLOTHES.pose ✓
- HELLO.pose, THANK.pose, PLEASE.pose, and 220 more!

#### 2. **Three.js Stick Figure Avatar** 
The avatar system (`ThreeIKAvatar.js`) includes:
- ✅ **Spheres for joints** - Uses `THREE.SphereGeometry` for all joint positions
- ✅ **Lines/Cylinders for bones** - Connects joints with rendered segments
- ✅ **Frame-by-frame animation** - Processes pose streams at specified FPS
- ✅ **Smooth interpolation** - Uses lerping (`positionLerp: 0.45`, `fingerLerp: 0.72`)

#### 3. **`loadAndPlayPose(word)` Function** ✨ NEW
Fetches and plays .pose files by word name with automatic format conversion.

---

## 🚀 How to Use

### Basic Usage

```javascript
// Initialize the avatar
const avatar = window.VOTEXMediaPipeAvatar.mount('container-id', {
  targetFps: 60,
  positionLerp: 0.45,  // Body smoothing (0-1)
  fingerLerp: 0.72,    // Hand smoothing (0-1)
});

// Load and play a sign
await window.VOTEXMediaPipeAvatar.loadAndPlayPose('CANDY');

// Stop playback
window.VOTEXMediaPipeAvatar.clear();
```

### Direct Instance Usage

```javascript
// After mounting, use the instance directly
const avatar = new ThreeIKAvatar('container-id');

// Load and play
await avatar.loadAndPlayPose('CLOTHES');

// Stop
avatar.clear();
```

---

## 📁 File Structure

### Pose File Format (`.pose`)
```json
{
  "video_id": "08909",
  "fps": 25.0,
  "total_frames": 7518,
  "frame_width": 480,
  "frame_height": 320,
  "model": "OpenCV_Simple_Motion_17pt",
  "frames": [
    {
      "frame_number": 0,
      "pose_landmarks": [
        { "x": 0.5, "y": 0.15, "confidence": 1.0 },
        { "x": 0.5, "y": 0.25, "confidence": 1.0 },
        ...
      ]
    },
    ...
  ]
}
```

### MediaPipe Format (What the Avatar Uses)
```javascript
{
  poseLandmarks: [
    { x: 0.5, y: 0.15, z: 0.0, visibility: 1.0 },
    ...
  ],
  leftHandLandmarks: [...],
  rightHandLandmarks: [...]
}
```

The `loadAndPlayPose()` function **automatically converts** from .pose format to MediaPipe format.

---

## 🎬 Demo Page

Open `test_pose_player.html` in your browser to test the implementation:

```html
http://localhost:5000/test_pose_player.html
```

Features:
- Input field to enter any word
- Quick-play buttons for common signs (CANDY, CLOTHES, HELLO, etc.)
- Real-time status messages
- 3D avatar with smooth interpolation

---

## 🔧 Configuration Options

```javascript
{
  targetFps: 60,           // Animation frame rate
  limbRadius: 0.042,       // Thickness of arms/legs
  fingerRadius: 0.016,     // Thickness of finger bones
  jointRadius: 0.028,      // Size of joint spheres
  avatarScale: 2.9,        // Overall avatar size
  positionLerp: 0.45,      // Body interpolation speed (lower = smoother, more lag)
  fingerLerp: 0.72,        // Hand interpolation speed
}
```

### Interpolation Notes
- **positionLerp: 0.45** - Good balance between smoothness and responsiveness for body
- **fingerLerp: 0.72** - Faster hand movements for expressive signs
- Lower values = smoother but more delayed
- Higher values = more responsive but jerkier

---

## 📊 Implementation Details

### What Makes It Smooth?

1. **Lerping (Linear Interpolation)**
   ```javascript
   joint.position.lerp(targetPosition, smoothing);
   ```
   Gradually moves joints toward target positions instead of jumping instantly.

2. **Frame-Accurate Timing**
   ```javascript
   this.frameInterval = 1 / fps;
   ```
   Uses the actual FPS from the .pose file (usually 25-30 fps) for accurate playback.

3. **Continuous Animation Loop**
   ```javascript
   requestAnimationFrame(this.animate);
   ```
   Renders at 60fps while sampling pose data at source FPS, creating interpolated frames.

### Coordinate System Conversion

The avatar converts normalized 2D coordinates to 3D space:

```javascript
toAvatarVector(point) {
  return new THREE.Vector3(
    ((point.x || 0) - 0.5) * scale * 1.35,      // X: centered, scaled
    (0.76 - (point.y || 0)) * scale * 1.9,      // Y: flipped, scaled
    (-(point.z || 0)) * scale * 0.95            // Z: depth, scaled
  );
}
```

---

## 🧪 Testing

### Test CANDY and CLOTHES Signs

```javascript
// Test CANDY
await window.VOTEXMediaPipeAvatar.loadAndPlayPose('CANDY');

// Wait a few seconds, then test CLOTHES
setTimeout(async () => {
  await window.VOTEXMediaPipeAvatar.loadAndPlayPose('CLOTHES');
}, 5000);
```

Both signs will play with **fluid interpolation** thanks to the lerping system.

---

## 🎯 API Reference

### `loadAndPlayPose(word)`
**Description:** Fetches a .pose file and plays it with interpolation.

**Parameters:**
- `word` (string): The word/sign name (case-insensitive)

**Returns:** Promise<boolean>
- `true` - Successfully loaded and playing
- `false` - Failed to load (file not found, invalid format, etc.)

**Example:**
```javascript
const success = await avatar.loadAndPlayPose('HELLO');
if (success) {
  console.log('Playing HELLO sign!');
} else {
  console.error('Failed to load HELLO');
}
```

### Other Methods

```javascript
// Set a single frame
avatar.setFrame(frameData);

// Set a stream of frames manually
avatar.setStream(framesArray, fps);

// Stop playback and reset to neutral pose
avatar.clear();

// Stop stream but keep current pose
avatar.stopStream();

// Clean up and remove avatar
avatar.destroy();
```

---

## 🐛 Troubleshooting

### Pose File Not Loading
- Check the file exists: `/poses/WORD.pose`
- Word must match filename (case-insensitive)
- Check browser console for detailed error messages

### Avatar Not Showing
- Ensure Three.js is loaded before ThreeIKAvatar.js
- Check that the container element exists
- Verify container has non-zero dimensions

### Choppy Animation
- Increase `positionLerp` for more responsive movement
- Check FPS in the .pose file (should be 25-30)
- Ensure browser can maintain 60fps rendering

---

## 📝 Files Modified

1. **`text_to_sign_language/components/ThreeIKAvatar.js`**
   - Added `loadAndPlayPose(word)` method to class
   - Added wrapper method to global `VOTEXMediaPipeAvatar` object

2. **`test_pose_player.html`** (NEW)
   - Demo page for testing the new function
   - Shows smooth playback of CANDY and CLOTHES signs

---

## ✨ Summary

You now have:
- ✅ **225 .pose files** with MediaPipe landmarks
- ✅ **3D stick figure avatar** with spheres (joints) and lines (bones)
- ✅ **`loadAndPlayPose(word)` function** for easy playback
- ✅ **Smooth interpolation** between frames (lerping)
- ✅ **Test page** to demo CANDY and CLOTHES signs

The implementation is complete and ready to use! 🎉
