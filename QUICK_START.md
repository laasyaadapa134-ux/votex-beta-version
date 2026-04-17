# Quick Start Guide - Pose Player Demo

## 🚀 How to Run

### Option 1: Using Flask Server (Recommended)

1. **Start the server:**
   ```bash
   cd C:\Users\Public\VoiceotTextConverter\home_page
   python server.py
   ```

2. **Open the demo page:**
   ```
   http://localhost:5000/test_pose_player.html
   ```

### Option 2: Simple Python HTTP Server

1. **Start from project root:**
   ```bash
   cd C:\Users\Public\VoiceotTextConverter
   python -m http.server 8000
   ```

2. **Open the demo page:**
   ```
   http://localhost:8000/test_pose_player.html
   ```

---

## 🎮 Using the Demo

1. **Type a word** in the input field (e.g., CANDY, CLOTHES)
2. **Click "▶ Play Sign"** or press Enter
3. Watch the 3D avatar perform the sign with smooth interpolation!

### Quick Test Buttons
- 🍬 CANDY
- 👕 CLOTHES  
- 👋 HELLO
- 🙏 THANK
- 🙌 PLEASE
- 😊 HAPPY

---

## 💻 Using in Your Own Code

### HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>My ASL App</title>
</head>
<body>
  <div id="avatar-container" style="width: 600px; height: 500px;"></div>

  <!-- Load Three.js -->
  <script src="/text-to-sign-language/vendor/three.min.js"></script>
  
  <!-- Load ThreeIKAvatar -->
  <script src="/text-to-sign-language/components/ThreeIKAvatar.js"></script>

  <script>
    // Initialize avatar
    const avatar = window.VOTEXMediaPipeAvatar.mount('avatar-container');

    // Load and play a sign
    async function playSign(word) {
      await window.VOTEXMediaPipeAvatar.loadAndPlayPose(word);
    }

    // Example: Play CANDY
    playSign('CANDY');
  </script>
</body>
</html>
```

### JavaScript Usage

```javascript
// Initialize
const avatar = window.VOTEXMediaPipeAvatar.mount('container-id', {
  targetFps: 60,
  positionLerp: 0.45,
  fingerLerp: 0.72
});

// Play signs
await window.VOTEXMediaPipeAvatar.loadAndPlayPose('CANDY');
await window.VOTEXMediaPipeAvatar.loadAndPlayPose('CLOTHES');

// Stop
window.VOTEXMediaPipeAvatar.clear();
```

---

## 📦 What You Have

- **225 .pose files** in `/poses/` directory
- **3D Avatar with:**
  - Spheres for joints (head, shoulders, elbows, wrists, etc.)
  - Cylinders for bones (connecting joints)
  - Smooth interpolation between frames
  - MediaPipe landmark support

---

## 🎯 Available Words

You have 225 signs available! Some examples:

**Common Words:**
- HELLO, HI, GOODBYE, BYE
- PLEASE, THANK, YOU, SORRY
- YES, NO, GOOD, BAD
- HAPPY, SAD, LOVE, HELP

**Food:**
- CANDY, APPLE, COFFEE, WATER
- BREAD, CHOCOLATE, COOKIE

**Clothing:**
- CLOTHES, SHIRT, SHOES, DRESS

**Actions:**
- EAT, DRINK, WALK, RUN, DANCE
- WORK, STUDY, PLAY, SLEEP

**And many more!** Check the `/poses/` folder for all available signs.

---

## 🔥 Features

### Smooth Interpolation
The avatar uses **lerping (linear interpolation)** to create smooth transitions between pose frames:

- Body movements: 45% lerp speed (smooth and stable)
- Hand/finger movements: 72% lerp speed (more expressive)

This makes signs like CANDY and CLOTHES look **fluid and natural**!

### Automatic Format Conversion
The `loadAndPlayPose()` function automatically converts:
- `.pose` file format (x, y, confidence)
- → MediaPipe format (x, y, z, visibility)

No manual conversion needed!

---

## 🎨 Customization

### Adjust Smoothness

```javascript
// Smoother body, faster hands
const avatar = window.VOTEXMediaPipeAvatar.mount('container', {
  positionLerp: 0.3,   // Lower = smoother body (0.1 - 0.9)
  fingerLerp: 0.8      // Higher = faster hands (0.1 - 0.9)
});
```

### Adjust Size

```javascript
const avatar = window.VOTEXMediaPipeAvatar.mount('container', {
  avatarScale: 3.5,       // Larger avatar
  jointRadius: 0.035,     // Bigger joint spheres
  limbRadius: 0.05        // Thicker limbs
});
```

---

## ✅ Testing Checklist

- [x] 225 .pose files extracted
- [x] CANDY.pose exists
- [x] CLOTHES.pose exists
- [x] Three.js stick figure avatar implemented
- [x] Spheres for joints ✓
- [x] Lines/Cylinders for bones ✓
- [x] Frame-by-frame animation ✓
- [x] Smooth interpolation ✓
- [x] `loadAndPlayPose(word)` function ✓
- [x] Demo page created ✓

## 🎉 Everything is ready!

Open `test_pose_player.html` and see CANDY and CLOTHES signs in fluid 3D animation!
