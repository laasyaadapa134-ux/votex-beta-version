# Coordinate System Analysis - Avatar Orientation Issue

## MediaPipe Coordinate System (Input Data)

**MediaPipe records a person FACING the camera:**
- X: 0 (left edge) to 1 (right edge) from viewer's perspective
- Y: 0 (top) to 1 (bottom) from viewer's perspective  
- Z: Depth - **POSITIVE = toward camera** (chest/hands extended forward), **NEGATIVE = away from camera** (back)

**Example from our test data (HELLO.json):**
```json
{
  "pose_landmarks": [
    {"x": 0.5, "y": 0.25, "z": 0, "visibility": 1.0},  // Nose - centered, near top
    ...
    {"x": 0.42, "y": 0.42, "z": 0, "visibility": 1.0}, // Left Shoulder
    {"x": 0.58, "y": 0.42, "z": 0, "visibility": 1.0}  // Right Shoulder
  ]
}
```

## Three.js Scene Setup (Rendering)

**Current Configuration:**
```javascript
camera.position.set(0, 1.65, 6.6);  // Camera at POSITIVE Z
camera.lookAt(0, 0.2, 0);           // Looking at near-origin
avatarRoot.position.set(0, -0.75, 0); // Avatar slightly below origin
```

**Three.js Coordinate System:**
- +X = Right
- +Y = Up
- +Z = Toward camera (right-hand rule)

## Coordinate Transformation (toAvatarVector)

```javascript
rawX -= 0.5;           // Center: 0.5 → 0
rawY = 0.5 - rawY;     // Flip Y: top becomes positive
rawX *= 1.4;           // Scale
rawY *= 1.4;
rawZ *= 1.12;          // Scale Z slightly less
```

**Result:** MediaPipe (0.5, 0.25, 0) → Avatar (0, 0.35, 0)

## The Orientation Problem

### Sign.MT Reference (from screenshot)
- Avatar clearly faces viewer
- Palms face forward
- Simple geometric shapes (oval face, rectangle body)
- **Indication**: They likely render from the "correct" viewing angle

### Our Current Issue
**Symptoms reported:**
1. "Avatar faces backward direction"
2. "Shows action and immediately jumps down shows 1 hand"

**Possible Causes:**

### Theory 1: Z-Axis Inversion Needed
- MediaPipe records someone facing camera (positive Z = toward camera)
- When we render, we need to MIRROR the Z coordinates
- **Test**: Multiply rawZ by -1 in toAvatarVector

### Theory 2: Test Data is Too Simple
- Our test data has all Z=0 (flat, no depth)
- Real sign language has significant Z-depth (hands moving toward/away)
- **Test**: Need real MediaPipe extracted data with proper depth

### Theory 3: Hand Coordinate Frame Wrong
- toLocalHandVector builds a coordinate frame from wrist, index, pinky
- The zAxis calculation might be inverted
- Current: `zAxis = crossVectors(xAxis, yAxis)`
- **Test**: Try `zAxis = crossVectors(yAxis, xAxis)` to flip direction

### Theory 4: Avatar Jumping Issue  - Avatar position might be changing between frames
- Could be a separate bug from orientation
- **Test**: Check if avatarRoot position is being modified elsewhere

## Recommended Next Step

**DO NOT make blind changes**

1. **First**: Confirm current code shows avatar with hands (even if backward)
2. **Then**: Add debug visualization to show:
   - Which way is the avatar's "front" (add a colored cone/arrow)
   - Hand palm normal vectors
   - Z-axis of hand coordinate frames
3. **Analyze**: Visual debugging will show exact problem
4. **Fix**: Make ONE targeted change based on evidence

## Questions for User

1. Does the avatar appear at all with current restored code?
2. Does it stay on screen or "jump down"?
3. Are BOTH hands visible or only one?
4. Is the face (white sphere) visible?
