# Kalidokit POC - Setup Instructions

## 🎯 Purpose
This is a **Proof of Concept** to test if Kalidokit can correctly convert MediaPipe hand landmarks to bone rotations with proper palm orientation.

## ⚡ Quick Start

### Step 1: Download Mixamo Avatar (5 minutes)

1. **Go to Mixamo**: https://www.mixamo.com
   - Sign in (free Adobe account required)

2. **Select Character**:
   - Click "Characters" tab
   - Search for "X Bot" (recommended - simple, clean character)
   - OR choose any other character you like

3. **Download Character**:
   - Click the character
   - Click "Download" button (top right)
   - **Format**: GLB
   - **Skin**: With Skin
   - **Pose**: T-Pose (default)
   - Click "Download"

4. **Save File**:
   - Rename downloaded file to `avatar.glb`
   - Save to: `text_to_sign_kalidokit/assets/models/avatar.glb`

### Step 2: Start Server

**Option A: Using existing server**
```powershell
# If server is already running - nothing to do!
# The new routes are already added
```

**Option B: Restart server**
```powershell
cd home_page
python server.py
```

### Step 3: Open POC Page

Go to: http://127.0.0.1:5000/text-to-sign-kalidokit

### Step 4: Test

1. **Select Word**: Choose "GOOD" (real extracted data from video)
2. **Load Pose Data**: Click "Load Pose Data" button
3. **Check Debug Info**: Look at the debug panel
   - It will show Kalidokit conversion test results
   - Shows wrist and finger rotations
4. **Play Animation**: Click "▶ Play Animation" (TODO - needs implementation)

## 🔍 What We're Testing

### Critical Question
**Do hands face FORWARD (palms toward viewer) or BACKWARD?**

### How to Check (Once animation is implemented)
1. Load GOOD.json pose data
2. Play animation
3. Look at the 3D avatar's hands
4. **EXPECTED**: Palms should face toward the viewer (like in real video)
5. **PROBLEM**: If palms still face backward, Kalidokit isn't the right solution

## 📁 File Structure

```
text_to_sign_kalidokit/
├── index.html              # Main POC page
├── assets/
│   └── models/
│       └── avatar.glb      # YOU NEED TO DOWNLOAD THIS
└── README.md              # This file
```

## 🧪 Test Data Sources

**Available pose files** (in `poses_mediapipe/`):
- `GOOD.json` - ⭐ REAL data extracted from video (50 frames, 30 FPS)
- `HELLO.json` - Test data (simple coordinates)
- `HI.json` - Test data
- Plus 19 more extracted videos

## ⚙️ Libraries Used

All loaded from CDN (no npm install needed):

1. **Kalidokit** v1.1.4 (MIT License)
   - CDN: https://cdn.jsdelivr.net/npm/kalidokit@1.1.4/dist/kalidokit.umd.js
   - Purpose: Convert MediaPipe landmarks → bone rotations

2. **model-viewer** v3.4.0 (Apache 2.0)
   - CDN: https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js
   - Purpose: Load and display GLB 3D model

3. **Three.js** v0.150.0 (MIT License)
   - CDN: https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js
   - Purpose: 3D utilities

## 🚧 Current Status

### ✅ Completed
- [x] POC page created
- [x] Kalidokit library loaded
- [x] model-viewer setup
- [x] Backend routes added
- [x] Pose data loading
- [x] Kalidokit conversion test (debug output)

### 🔨 TODO (Next Steps)
- [ ] Apply Kalidokit rotations to avatar bones
- [ ] Implement animation playback
- [ ] Test palm orientation
- [ ] Verify finger movements
- [ ] Compare with original video

## 🎨 Mixamo Character Alternatives

If X Bot doesn't work well, try these:

1. **Y Bot** - Female version of X Bot
2. **Maw J Kick** - More detailed character
3. **Ortiz** - Realistic human
4. **Kaya** - Female realistic
5. **Mannequin** - Simple, good for testing

All are free to download from Mixamo!

## 📊 Comparison with Old System

| Feature | Old System | Kalidokit POC |
|---------|-----------|---------------|
| **Module** | text_to_sign_language | text_to_sign_kalidokit |
| **Approach** | Manual coordinate system | IK with Kalidokit |
| **Rendering** | Custom Three.js + cylinders | model-viewer + rigged character |
| **Palm issue** | Backward facing | **Testing if fixed** |
| **Data format** | MediaPipe JSON | MediaPipe JSON (same) |
| **Isolation** | Production code | Completely separate POC |

## 🔍 Debug Information

When you load pose data, check the debug panel for:

```
Right Hand Conversion Test:
Wrist rotation: x=0.123, y=-0.456, z=0.789
Index rotation: x=0.234, y=0.567, z=-0.123
```

These values show how Kalidokit interpreted the hand orientation.

## ⚠️ Important Notes

1. **This is ISOLATED**: Does not affect existing text-to-sign-language module
2. **POC only**: Not production-ready
3. **Test first**: We're testing if palm faces correctly
4. **Can pivot**: If this doesn't work, we try other approaches
5. **Time investment**: Only 2 hours so far

## 🚀 Next Steps (If POC Succeeds)

1. ✅ Hands face correctly → Proceed with full implementation
2. Integrate with main app
3. Add all extracted videos
4. Polish animation quality
5. Add face expressions
6. Production deployment

## 🛑 Next Steps (If POC Fails)

1. ❌ Hands still backward → Document findings
2. Try sign.mt TensorFlow approach
3. Or research other sign language libraries
4. Or accept backward hands with workaround

## 📞 Help & Support

**If avatar doesn't load:**
- Check file path: `text_to_sign_kalidokit/assets/models/avatar.glb`
- Check file size: Should be 2-15 MB
- Check browser console for errors

**If Kalidokit doesn't work:**
- Check browser console
- Verify CDN loaded: `typeof Kalidokit !== 'undefined'`

**If pose data doesn't load:**
- Check that server is running
- Verify poses_mediapipe folder exists
- Check browser network tab

---

**Created**: April 11, 2026
**Status**: POC - Testing Phase
**Goal**: Determine if Kalidokit solves palm orientation issue
