# Cleanup Plan for VOTEX Project

## Date: April 20, 2026

## Objective
Remove test files, debug scripts, and trial code while preserving all working functionality.

---

## ✅ PRODUCTION CODE - DO NOT DELETE

### Frontend (Port 8000 - Static Server)
```
frontend/
├── index.html                    # Homepage
├── logo.png                      # Logo
├── votex-modern.css              # Homepage styles
├── votex-modern.js               # Homepage scripts
├── illustration.png              # Homepage image
├── common-header.js              # Shared header component
├── common-header.css             # Shared header styles
├── HEADER_COMPONENT_README.md    # Header docs
├── text_to_speech/
│   ├── index.html
│   └── [all files in this folder]
├── speech_to_text/
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── translations.js
├── translate_and_speak/
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── text_to_sign_language/
    ├── index.html
    ├── styles.css
    ├── script.js                 # Main script (ACTIVE)
    ├── components/
    │   ├── ASL_Database.js       # ACTIVE
    │   ├── SignLanguageVisualizer.js  # ACTIVE
    │   ├── SignAvatar.js         # ACTIVE
    │   ├── ThreeIKAvatar.js      # ACTIVE
    │   ├── visualizer-styles.css
    │   ├── illustrated-video-styles.css
    │   ├── SignAvatar.css
    │   └── ThreeIKAvatar.css
    └── vendor/
        └── three.min.js
```

### Backend (Port 5000 - Flask API)
```
home_page/
├── server.py                     # Flask backend (needs cleanup of test routes)
├── app.py                        # Main entry point
├── requirements.txt              # Python dependencies
└── .env                          # Environment variables

backend/
├── __init__.py
├── asl_gloss/
│   ├── __init__.py
│   ├── converter.py              # English to ASL gloss conversion
│   └── rules.py                  # ASL grammar rules
└── pose_stream/
    ├── __init__.py
    ├── pose_format_adapter.py    # Pose animation processing
    └── mediapipe_loader.py       # MediaPipe JSON loader
```

### Data Directories
```
poses/                            # BODY_135 format pose files (legacy)
poses_mediapipe/                  # MediaPipe JSON pose files (ACTIVE)
pose_dictionary/                  # Pose dictionary data
```

### Configuration
```
.env                              # Environment variables
.gitignore                        # Git ignore rules
netlify.toml                      # Netlify deployment config
```

---

## ❌ FILES TO DELETE (Test/Debug/Trial Code)

### Root Test Files
```
test2.py
test3.py
test4.py
test_actual_output.py
test_api_coords.py
test_api_directly.py
test_avatar.html
test_avatar_fix.html
test_backend.py
test_coords.py
test_debug_avatar.html
test_download.py
test_hand_ranges.py
test_hello_coords.py
test_library_builder.py
test_mediapipe_extraction.py
test_neural_link_avatar.html
test_payload.json
test_pose_player.html
test_professional_avatar.html
test_simple_avatar.html
threejs_esm_starter.html
```

### Debug Files
```
debug_component_structure.py
debug_hello_output.json
debug_hello_pose.py
```

### Analysis/Utility Scripts
```
analyze_coordinate_system.py
analyze_pose_ranges.py
check_all_poses.py
check_data.py
check_pose_fps.py
create_stable_test_poses.py
create_test_mediapipe_json.py
deep_analysis.py
download_and_extract_wlasl.py
download_asl_poses.py
download_asl_poses_easy.py
download_asl_poses_simple.py
download_poses_direct.py
extract_all_wlasl_videos.py
extract_mediapipe_complete.py
extract_mediapipe_direct_urls.py
extract_mediapipe_from_video.py
extract_pose_coords.py
extract_pose_coords_mediapipe.py
extract_pose_coords_opencv.py
extract_pose_coords_simple.py
generate_test_pose.py
repair_are_pose.py
validate_and_fix_poses.py
wlasl_video_lookup.py
build_wlasl_library.py
build_wlasl_library_mediapipe.py
```

### Backup/Trial Folders
```
backup_before_kalidokit_20260411_171407/    # Old backup folder
text_to_sign_kalidokit/                     # Kalidokit POC (not in use)
Text-ASL_NEW/                                # Old trial folder
WLASL-master/                                # Dataset source (can keep if needed for reference)
temp_videos/                                 # Temporary video files
```

### Debug/Analysis Documentation
```
ALTERNATIVE_SOLUTION_ANALYSIS.md
AVATAR_SYSTEM_FIXED.md
COORDINATE_SYSTEM_ANALYSIS.md
DEBUG_INSTRUCTIONS.md
DOWNLOAD_POSE_FILES.md
FIXED_FOR_TOMORROW.txt
KALIDOKIT_POC_NEXT_STEPS.md
LICENSE_AND_IMPLEMENTATION_ANALYSIS.md
MEDIAPIPE_EXTRACTION_GUIDE.md
MEDIAPIPE_SOLUTION_PLAN.md
POSE_ANIMATION_ISSUE.md
POSE_PLAYER_README.md
ROOT_CAUSE_FOUND.md
SIGN_MT_ANALYSIS.md
TEST_MODE_ACTIVE.md
```

### Unused Components in text_to_sign_language
```
frontend/text_to_sign_language/script_real_signs.js
frontend/text_to_sign_language/script_emoji_backup.js
frontend/text_to_sign_language/backup/
frontend/text_to_sign_language/components/NeuralLinkAvatar.js
```

---

## 🔧 FILES TO MODIFY

### home_page/server.py
**Remove these test routes (lines ~140-180):**
```python
@app.route('/test_pose_player.html')
@app.route('/test_avatar.html')
@app.route('/test_debug_avatar.html')
@app.route('/test_simple_avatar.html')
@app.route('/test_professional_avatar.html')
@app.route('/test_neural_link_avatar.html')
@app.route('/threejs_esm_starter.html')
@app.route('/kalidokit-poc')
@app.route('/kalidokit-poc/<path:filename>')
```

---

## 📋 SAFE CLEANUP PROCEDURE

### Phase 1: Preparation (SAFEST)
1. ✅ Create this cleanup plan document
2. ✅ Commit current working state to git
3. ✅ Create a safety backup: `git tag pre-cleanup-backup`
4. ✅ Test all 5 main features work correctly

### Phase 2: Create Archive (SAFETY NET)
1. Create `archive/` folder in project root
2. Move (not delete) test files to archive first
3. This allows recovery if something breaks

### Phase 3: Gradual Cleanup (SAFEST APPROACH)
1. **Step 1**: Remove test routes from server.py
   - Test backend still works
2. **Step 2**: Move test HTML files to archive/
   - Test frontend still loads
3. **Step 3**: Move test Python scripts to archive/
   - Test sign language feature works
4. **Step 4**: Move debug files to archive/
5. **Step 5**: Move analysis/utility scripts to archive/
6. **Step 6**: Move backup folders to archive/
7. **Step 7**: Move debug markdown docs to archive/
8. **Step 8**: Clean up unused text_to_sign_language components

### Phase 4: Verification
After EACH step above:
1. Test homepage loads (http://127.0.0.1:8000/)
2. Test text-to-speech works
3. Test speech-to-text works
4. Test translate & speak works
5. Test text-to-sign-language works
6. Check backend API responds (http://127.0.0.1:5000/api/asl/gloss)

### Phase 5: Final Deletion
1. If everything works after 1 week, delete archive/ folder
2. Commit cleaned up codebase

---

## 🧪 Testing Checklist

Before considering cleanup complete, verify:

- [ ] Homepage loads at http://127.0.0.1:8000/
- [ ] Text-to-speech converts text and plays audio
- [ ] Speech-to-text records and transcribes
- [ ] Translate & Speak translates and speaks
- [ ] Text-to-sign-language shows avatar animation
- [ ] Backend API `/api/asl/gloss` responds
- [ ] Backend API `/api/asl/pose-stream` responds
- [ ] No console errors in browser
- [ ] No 404 errors for missing files
- [ ] All navigation links work

---

## 📝 Notes

- Keep `docs/` folder if it has important documentation
- Keep `models/` folder if it has trained models
- Keep `images/` folder for project images
- Keep `Data/` folder if it has essential data
- WLASL-master can be deleted unless needed for reference
- Consider keeping PROJECT_STRUCTURE.md and QUICK_START.md as they're useful

---

## 🚨 ROLLBACK PLAN

If anything breaks:
```bash
# If using archive approach:
# Just move files back from archive/ to root

# If already deleted:
git checkout pre-cleanup-backup
```
