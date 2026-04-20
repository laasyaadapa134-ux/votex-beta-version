# ASL Pose File Download Guide

This guide explains how to download real ASL pose files to replace the demo files in your project.

## Quick Start

### Method 1: Automatic Download (Recommended)

1. **Install required packages:**
   ```bash
   pip install sign-language-datasets pose-format requests
   ```

2. **Run the downloader:**
   ```bash
   python download_asl_poses.py
   ```

3. **Wait for downloads** - this may take several minutes

4. **Restart your server:**
   ```bash
   cd home_page
   python server.py
   ```

### Method 2: Simple Alternative

If Method 1 fails, try the simpler script:

```bash
pip install requests
python download_asl_poses_simple.py
```

---

## What These Scripts Do

### `download_asl_poses.py` (Full-Featured)
- Tries to download from sign-language-datasets library
- Checks GitHub releases for pose files
- Downloads 50+ common ASL words
- Backs up your existing demo files
- Creates detailed error reports if downloads fail

### `download_asl_poses_simple.py` (Lightweight)
- Uses direct HTTP requests
- Attempts to clone Git repository if available
- Simpler with fewer dependencies
- Good fallback option

---

## Manual Download (If Scripts Fail)

If automatic downloads don't work, you can download pose files manually:

### Option A: Hugging Face Hub
1. Visit: https://huggingface.co/datasets/sign/poses
2. Click "Files and versions"
3. Download individual `.pose` files
4. Save to: `pose_dictionary/`

### Option B: GitHub Repository
1. Visit: https://github.com/sign-language-processing/datasets
2. Browse to the poses directory
3. Download `.pose` files
4. Save to: `pose_dictionary/`

### Option C: Clone Repository
```bash
git clone https://github.com/sign-language-processing/datasets.git
cd datasets
# Find .pose files and copy to your pose_dictionary/
```

---

## File Requirements

**Important:**
- Files must be named in **UPPERCASE** (e.g., `HELLO.pose`, `THANK.pose`)
- Files must have `.pose` extension
- Files must be in OpenPose 135 format (same as current demo files)
- Place files in: `C:\Users\Public\VoiceotTextConverter\pose_dictionary\`

---

## Recommended Words to Download

### Priority 1 (Most Common):
- HELLO, HI, GOODBYE, BYE
- PLEASE, THANK, YOU, SORRY
- YES, NO
- I, ME, MY, YOUR

### Priority 2 (Questions):
- WHAT, WHO, WHERE, WHEN, WHY, HOW

### Priority 3 (Common Verbs):
- GO, COME, WANT, NEED, HELP
- KNOW, THINK, LIKE, LOVE
- EAT, DRINK, SEE, LOOK

### Priority 4 (Useful Words):
- GOOD, BAD, FINE, NICE, GREAT
- HAPPY, SAD, TIRED, SICK
- TODAY, TOMORROW, YESTERDAY
- MORNING, AFTERNOON, EVENING, NIGHT

### Priority 5 (Grammar):
- ARE, IS, WAS, WERE
- DO, DOES, DOING, DONE
- CAN, WILL, WOULD, SHOULD

---

## After Download

### 1. Verify Files
Check that pose files are in the correct location:
```bash
cd pose_dictionary
dir *.pose
```

You should see files like:
```
HELLO.pose
THANK.pose
YOU.pose
...
```

### 2. Restart Server
Stop the current server (Ctrl+C) and restart:
```bash
cd home_page
python server.py
```

### 3. Test in Browser
1. Open: http://127.0.0.1:5000/text-to-sign-language
2. **Hard refresh**: Press `Ctrl+Shift+R`
3. Enable **"Professional Motion Mode"** checkbox
4. Type a phrase like: "hello thank you"
5. Click "Translate to Signs"
6. **Expected result**: 3D avatar performs real ASL signs!

---

## Troubleshooting

### Script says "Missing required packages"
Install them:
```bash
pip install sign-language-datasets pose-format requests
```

### "Download failed" or "No files downloaded"
- Check your internet connection
- Try the simple script: `python download_asl_poses_simple.py`
- Or download manually using instructions above

### Files downloaded but avatar still shows random motion
- Make sure files are named in UPPERCASE (e.g., `HELLO.pose` not `hello.pose`)
- Restart the Flask server
- Hard refresh browser (Ctrl+Shift+R)
- Check server logs for errors

### Git not found
- Install Git: https://git-scm.com/downloads
- Or use manual download methods instead

### Server not using new files
- Check `.env` file - make sure `ASL_POSE_DICTIONARY` points to: `C:/Users/Public/VoiceotTextConverter/pose_dictionary`
- Restart server completely
- Verify files exist in pose_dictionary/

---

## Current Demo Files

Your current `pose_dictionary/` contains these demo files:
- ARE.pose, DOING.pose, GOOD.pose, HELLO.pose, HI.pose
- HOW.pose, IS.pose, MORNING.pose, MY.pose, NAME.pose
- PLEASE.pose, THANK.pose, TONIGHT.pose, WHAT.pose
- YOU.pose, YOUR.pose

These were generated with `fake_openpose_135_pose()` and contain synthetic skeletal motion (valid structure but not real ASL signs).

**The download scripts will back up these files** before replacing them, so you won't lose the originals.

---

## Technical Details

### Pose File Format
- Format: OpenPose 135 format
- Structure: Binary file containing skeletal landmark data
- Contains: 33 body landmarks + 21 landmarks per hand
- Frame rate: Typically 30 FPS, interpolated to 60 FPS by backend

### Dependencies
```
sign-language-datasets  # Official dataset library
pose-format            # Pose file I/O and manipulation
requests               # HTTP downloads
scipy                  # Smoothing algorithms (savgol_filter)
numpy                  # Numerical operations
```

### Dataset Sources
- **sign-language-datasets**: Official Python library for sign language datasets
- **Hugging Face Hub**: sign/poses dataset
- **GitHub**: sign-language-processing/datasets repository

---

## Support

If you encounter issues:

1. **Check server logs** - they show which pose files are being loaded
2. **Verify file format** - files must be binary `.pose` format, not text or JSON
3. **Test with one word** - download just HELLO.pose first to verify it works
4. **Check browser console** - press F12 to see JavaScript errors

Remember: The 3D avatar pipeline is working! The only issue is that demo pose files contain synthetic motion instead of real ASL signs. Once you replace them with real pose files, you'll see proper sign language.

---

## Success Checklist

✅ Downloaded real `.pose` files to `pose_dictionary/`  
✅ Files named in UPPERCASE with `.pose` extension  
✅ Restarted Flask server  
✅ Hard refreshed browser (Ctrl+Shift+R)  
✅ Professional Motion Mode is ON  
✅ Translated a phrase  
✅ 3D avatar shows meaningful sign language motion  

If all checkboxes are complete, you're done! 🎉
