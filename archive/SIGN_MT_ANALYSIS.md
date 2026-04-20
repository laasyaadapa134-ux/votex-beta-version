# Sign.MT vs Our Code - Critical Differences Analysis

## Executive Summary

**Main Problem**: Our hands face backward because we're using **coordinate-based IK positioning** (manual joint placement) instead of **quaternion-based skeletal animation** like sign.mt.

**Root Cause**: We calculate XYZ positions for each finger joint, but we don't calculate the **rotations** (quaternions) that would properly orient the hand bones.

---

## Architecture Comparison

### Sign.MT Architecture (Working Perfectly)

```
User Text
    ↓
[BrowserMT] → Signed Language Glosses
    ↓
[spoken_text_to_signed_pose API] → Pose Format Data
    ↓
[Pose Landmarks: 75 points (33 pose + 21+21 hands)]
    ↓
[TensorFlow.js Model] → Converts 75 landmarks → 58 Bone Quaternions
    ↓
[Three.js QuaternionKeyframeTrack] → Animation Clips
    ↓
[model-viewer (Three.js)] → 3D Character with proper rotations
```

### Our Architecture (Hands Face Backward)

```
User Text
    ↓
[Backend: MediaPipe JSON Loader] → Pose Landmarks
    ↓
[Frontend: VOTEXMediaPipeAvatar]
    ↓
[Manual XYZ Position Calculation] → No rotations calculated
    ↓
[Three.js Cylinder Meshes] → No quaternion animation
    ↓
[updateSegments()] → Cylinders point start→end (correct)
                  → But hand coordinate system is backward (WRONG)
```

---

## KEY DIFFERENCES (What We're Missing)

### 1. **TensorFlow.js Pose→Quaternion Model** ⭐ CRITICAL

**Sign.MT Has:**
```typescript
// animation.service.ts
estimate(poses: EstimatedPose[]): {[key: string]: [number, number, number, number][]} {
  const normalized = poses.map(pose => this.normalizePose(pose).reshape([1, 75 * 3]));
  const stack = this.tf.stack(normalized, 1);
  const pred: Tensor = this.sequentialModel.predict(stack) as Tensor;  // 🔥 ML MODEL
  const sequence = pred.reshape([normalized.length, ANIMATION_KEYS.length, 4]);
  return quaternions;  // Returns 58 bones × 4 quaternion values
}
```

**Model File**: `assets/models/pose-animation/model.json`
- Input: 75 landmarks × 3 coordinates = 225 values
- Output: 58 bones × 4 quaternions = 232 values
- **This trained model KNOWS the correct hand orientation**

**We Have**: NOTHING
- We calculate XYZ positions manually
- We build hand coordinate system with cross products
- We have NO rotation/quaternion calculation
- **Result**: Positions are correct, orientations are wrong

---

### 2. **Quaternion-Based Animation System**

**Sign.MT Has:**
```typescript
// animation.component.ts
const tracks = [];
Object.entries(trackDict).forEach(([boneName, quaternions]) => {
  const times = quaternions.map((q, j) => j / this.fps);
  const flatQs = [].concat(...quaternions);  // Flatten [w,x,y,z] arrays
  tracks.push(new this.three.QuaternionKeyframeTrack(boneName, times, flatQs));
});
const newAnimation = new this.three.AnimationClip(name, 0, tracks);
scene.animationsByName.set(name, newAnimation);
scene.playAnimation(name);
```

**Animation Keys** (58 bones):
- Head, Neck, Spine (6 bones)
- Arms/Legs (14 bones)
- Left Hand: 18 bones (wrist + thumb/index/middle/ring/pinky × 3 joints each)
- Right Hand: 18 bones

**We Have**: Position-based cylinder rendering
```javascript
// ThreeIKAvatar.js
updateSegments() {
  segments.forEach(({ mesh, startName, endName }) => {
    const start = this.getJointPosition(startName);
    const end = this.getJointPosition(endName);
    mesh.position.copy(mid);  // ✅ Position correct
    mesh.setRotationFromQuaternion(quaternion);  // ⚠️ Only aligns cylinder with bone
    // BUT: No quaternion for bone rotation itself!
  });
}
```

---

### 3. **Pose Normalization**

**Sign.MT Has:**
```typescript
normalizeHolistic(pose, components, normalized=true) {
  // 1. Get landmarks (33 pose + 21+21 hands = 75 total)
  let landmarks = components.reduce((acc, c) => acc.concat(vectors[c]), []);
  
  // 2. Scale by image dimensions
  landmarks = landmarks.map(l => ({
    x: l.x * pose.image.width,
    y: l.y * pose.image.height,
    z: l.z * pose.image.width
  }));
  
  // 3. CENTER AND SCALE relative to shoulder width
  const p1 = landmarks[LEFT_SHOULDER];
  const p2 = landmarks[RIGHT_SHOULDER];
  const scale = distance(p1, p2);  // Shoulder width
  const center = midpoint(p1, p2);
  
  landmarks = landmarks.map(l => ({
    x: (l.x - center.x) / scale,
    y: (l.y - center.y) / scale,
    z: (l.z - center.z) / scale
  }));
}
```

**We Have**: Basic avatar scaling
```javascript
toAvatarVector(landmark) {
  return new THREE.Vector3(
    (landmark.x - 0.5) * this.options.avatarScale,
    (0.5 - landmark.y) * this.options.avatarScale,
    -landmark.z * this.options.avatarScale
  );
}
```
- No shoulder-width normalization
- No proper centering
- Simple 0.5 offset

---

### 4. **Model-Viewer vs Custom Avatar**

**Sign.MT Uses:**
- `<model-viewer>` from Google (Three.js wrapper)
- Pre-made 3D character model (likely Mixamo rig)
- **Rigged skeleton** with 58 bones
- Quaternions applied directly to bone rotations
- Professional animation system

**We Use:**
- Custom `VOTEXMediaPipeAvatar` class
- Manually created spheres (head) + cylinders (bones)
- **No skeleton rig** - just visual geometry
- Positions calculated, but bone rotations ignored

---

### 5. **75 Landmarks → 58 Bones Mapping**

**Sign.MT's 58 Bones for Hands** (from ANIMATION_KEYS):

**Left Hand (18 bones):**
```
mixamorigLeftHand.quaternion           → Wrist rotation
mixamorigLeftHandThumb1.quaternion     → Thumb base
mixamorigLeftHandThumb2.quaternion     → Thumb middle
mixamorigLeftHandThumb3.quaternion     → Thumb tip
mixamorigLeftHandIndex1/2/3.quaternion → Index finger (3 bones)
mixamorigLeftHandMiddle1/2/3.quaternion → Middle finger (3 bones)
mixamorigLeftHandRing1/2/3.quaternion   → Ring finger (3 bones)
mixamorigLeftHandPinky1/2/3.quaternion  → Pinky finger (3 bones)
```

**Right Hand (18 bones):** Same structure

**Our Hands:**
- We have 21 joint positions (MediaPipe hand landmarks)
- We create cylinders BETWEEN joints
- But we don't calculate rotations for each bone
- **Result**: Cylinders point correctly, but hand orientation is backward

---

## What's Actually Working in Our Code

✅ **Backend MediaPipe JSON Loader** - Correctly loads pose data
✅ **Frontend receives correct landmarks** - Snake_case conversion works
✅ **Head positioning** - Locked to chest, stable
✅ **Body pose** - Arms, legs animate correctly
✅ **Hand finger movements** - Individual finger joints move
✅ **Depth (Z-axis)** - Real depth data from extracted videos

❌ **Hand palm orientation** - Backward facing (the ONLY issue)

---

## Why Our Coordinate System Fails

**Our Current Hand Coordinate System:**
```javascript
const xAxis = indexBase.clone().sub(pinkyBase).normalize();  // Across palm
const yAxis = middleBase.clone().sub(root).normalize();       // Along fingers
const zAxis = crossVectors(yAxis, xAxis).normalize();         // Palm normal

// Problem: This creates palm normal, but doesn't create proper hand ROTATION
// We use it to position fingers in 3D space, but not to ROTATE the hand bones
```

**Why it fails:**
1. We calculate a local coordinate system ✅
2. We position fingers correctly in that system ✅
3. BUT: The system itself is oriented backward ❌
4. And: We don't apply quaternion rotations to fix it ❌

**Sign.MT Approach:**
1. They feed 75 normalized landmarks to TensorFlow model
2. Model outputs quaternions that inherently encode correct orientations
3. Quaternions are applied to pre-rigged skeleton bones
4. **The ML model has learned correct hand orientation from training data**

---

## The REAL Solution (Not Simple Axis Flips)

### Option A: Use Sign.MT's TensorFlow Model (RECOMMENDED)

**Pros:**
- Proven to work perfectly
- Handles all 58 bones properly
- Correct hand orientation guaranteed
- Professional animation quality

**Cons:**
- Need to integrate TensorFlow.js
- Need to download their model file
- Need to create quaternion-based animation system
- Bigger code change (2-3 days work)

**Implementation:**
1. Load `assets/models/pose-animation/model.json` from sign.mt
2. Normalize 75 landmarks (33 pose + 42 hands) like they do
3. Run TensorFlow model to get 58 bone quaternions
4. Apply quaternions to avatar bones using QuaternionKeyframeTrack
5. Replace our manual positioning with proper skeletal animation

---

### Option B: Use Pose-Format Library (sign.mt uses this too)

**What is pose-format?**
- Custom format for storing sign language poses
- Already includes proper orientations
- Sign.mt converts their API poses to this format

**Implementation:**
- Install `pose-format` library
- Load pose data in pose-format
- Extract normalized orientations
- May still need quaternion conversion

---

### Option C: Simple Workaround (Temporary)

**Mirror the entire avatar horizontally:**
```javascript
// In ThreeIKAvatar.js, after creating avatar
this.avatar.scale.set(-1, 1, 1);  // Mirror X-axis
```

**Result:**
- Backward-facing palms become forward-facing
- But: Text/logos would be mirrored
- Not a real fix, just visual hack

---

### Option D: Accept Current State + Extract Full Vocabulary

**Pragmatic approach:**
1. Keep backward-facing hands for now
2. Extract all 18+ WLASL videos to get working demo
3. Show user the full system works
4. Revisit hand orientation later with proper quaternion system

**User can release with:**
- Working text-to-sign translation
- Full vocabulary (18+ words)
- Smooth animations
- Only cosmetic issue: palms face away

---

## Recommended Action Plan

### Immediate (1 hour):
1. ✅ Already extracted 22 MediaPipe JSON files from videos
2. Test all extracted words (HER, HIS, I, ME, MY, etc.)
3. Verify full animation pipeline works
4. Show user working demo with multiple words

### Short-term (1-2 days):
5. Download sign.mt's TensorFlow model
6. Integrate TensorFlow.js pose→quaternion conversion
7. Implement QuaternionKeyframeTrack animation
8. Fix hand orientation properly

### Alternative Short-term (2-4 hours):
5. Apply simple mirror hack (`scale.x = -1`)
6. Test if acceptable for release
7. Extract more WLASL videos for full vocabulary
8. Release working demo, fix orientation later

---

## Critical Files to Study from Sign.MT

1. **`animation.service.ts`** - TensorFlow model integration
2. **`animation.component.ts`** - QuaternionKeyframeTrack usage
3. **`pose.service.ts`** - Pose normalization (shoulder-width centering)
4. **`three.service.ts`** - Three.js helpers
5. **`assets/models/pose-animation/model.json`** - The trained model itself

---

## Bottom Line

**Why sign.mt works perfectly:**
- They use a **trained ML model** that outputs correct bone rotations
- They use **quaternion-based skeletal animation**
- They use a **rigged 3D character** with proper bone hierarchy

**Why we have backward hands:**
- We use **manual position calculations** without rotation data
- We use **coordinate system math** (cross products) that's backward
- We have **no quaternion/rotation information** for hand bones

**The fix is NOT simple:**
- No amount of axis flipping will work
- We need to either:
  - A) Add TensorFlow quaternion model (proper fix)
  - B) Use pose-format library (medium complexity)
  - C) Mirror entire avatar (hack)
  - D) Accept it temporarily and extract full vocabulary

**User's constraint:**
> "no compromise in final look. I have to release full working version"

**My recommendation**: 
1. Show working demo with current 22 words TODAY
2. Decide together: spend 2-3 days on proper quaternion fix, or release with mirror hack and fix later
3. Don't waste more time on axis flips - we've tried 16+ variations, none work
