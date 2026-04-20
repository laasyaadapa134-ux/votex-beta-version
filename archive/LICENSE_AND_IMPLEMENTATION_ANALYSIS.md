# Sign.MT License & Implementation Analysis

## 📜 LICENSING ANALYSIS

### **Sign.MT License Structure**

**Dual License Model:**

1. **FREE License** (CC BY-NC-SA 4.0)
   - ✅ **Individuals** (personal use)
   - ✅ **Non-profit organizations**
   - ✅ **Educational institutions**
   - ✅ **Research purposes**
   - **Conditions**: Attribution required, ShareAlike, Non-Commercial

2. **COMMERCIAL License** (Paid)
   - ❌ For-profit companies
   - ❌ Commercial products/services
   - ❌ Monetized applications
   - **Contact**: sign.mt ltd for pricing

### **Dependencies License Check**

All NPM packages used are **FREE & OPEN SOURCE**:

| Package | License | Use |
|---------|---------|-----|
| `@tensorflow/tfjs` | Apache 2.0 | ✅ FREE - ML inference |
| `@google/model-viewer` | Apache 2.0 | ✅ FREE - 3D rendering |
| `@mediapipe/holistic` | Apache 2.0 | ✅ FREE - Pose detection |
| `three` | MIT | ✅ FREE - 3D graphics |
| `@angular/*` | MIT | ✅ FREE - Framework (we don't need) |

### **Model Files Available in Repository**

✅ **Found in `src/assets/models/`**:

1. **`pose-animation/`** ⭐ **CRITICAL FOR US**
   - `model.json` (7.8 KB) - TensorFlow model architecture
   - `group1-shard1of1.bin` (1032 KB) - Model weights
   - `3d-avatar.tex` (6 KB) - Avatar texture
   - **Total**: ~1 MB

2. **`hand-shape/`** (Optional)
   - `model.json` (8.88 KB)
   - `group1-shard1of1.bin` (163 KB)
   - For hand shape classification

3. **`face-features/`** (Optional)
   - `model.json` (10.22 KB)
   - `group1-shard1of1.bin` (924 KB)
   - For facial expression

4. **`mediapipe-language-detector/`** (Not needed)
   - Language detection model

### **3D Avatar Model**

**NOT FOUND IN REPOSITORY** ❌

Sign.MT loads avatar from:
```html
<model-viewer 
  src="[AVATAR_MODEL_FILE.glb]"  <!-- Where is this file? -->
  ...
</model-viewer>
```

**Issue**: The actual 3D character model (.glb/.gltf file) is NOT in the repository!

**Options**:
1. Use free Mixamo models (https://www.mixamo.com - Adobe, free for commercial use)
2. Use Ready Player Me avatars (https://readyplayer.me - free API)
3. Create simple rigged character in Blender
4. Contact sign.mt to ask where they host their model

---

## ⚖️ LEGAL CONCLUSION

### **Can We Use This Code?**

**Depends on your use case:**

| Your Situation | Can Use? | License Terms |
|----------------|----------|---------------|
| **Personal project** | ✅ YES | Free (CC BY-NC-SA 4.0) |
| **Educational/Research** | ✅ YES | Free (CC BY-NC-SA 4.0) |
| **Non-profit organization** | ✅ YES | Free (CC BY-NC-SA 4.0) |
| **For-profit company** | ❌ NEED COMMERCIAL LICENSE | Contact sign.mt for pricing |
| **Free app with ads** | ⚠️ GRAY AREA | Technically commercial |
| **Open-source project** | ✅ YES | Must be ShareAlike |

### **What About Just Using Their Models/Libraries?**

The **TensorFlow model** (`pose-animation/model.json`) is part of the CC-licensed repository.

The **NPM packages** are all independently licensed:
- TensorFlow.js: **Apache 2.0** - ✅ Free for commercial use
- model-viewer: **Apache 2.0** - ✅ Free for commercial use  
- MediaPipe: **Apache 2.0** - ✅ Free for commercial use

**Strategy**: 
- Use the free libraries (TensorFlow, model-viewer) ✅
- Study sign.mt's architecture/approach ✅
- Train our own pose→quaternion model OR get permission to use theirs
- Use free 3D avatar from Mixamo

---

## 🎯 WHAT WE CAN DEFINITELY USE (NO LICENSE ISSUES)

### **1. Libraries (All Apache 2.0/MIT)**
```bash
npm install @tensorflow/tfjs
npm install @google/model-viewer  
npm install three
# Already have @mediapipe/holistic
```

### **2. Architecture Pattern** (Ideas are not copyrighted)
- MediaPipe → TensorFlow → Quaternions → Animation ✅
- Normalization approach ✅
- 75 landmarks → 58 bones mapping ✅

### **3. Free Alternatives**

**3D Avatar Sources (Free for commercial):**
- **Mixamo** (Adobe): Free rigged characters, animations
  - URL: https://www.mixamo.com
  - License: Free for commercial use
  - Has ready-to-use rigged characters

- **Ready Player Me**: Avatar creation API
  - URL: https://readyplayer.me
  - License: Free tier available
  - Can generate custom avatars

- **Poly Haven**: Free 3D models
  - URL: https://polyhaven.com
  - License: CC0 (public domain)

**Model Training Data (if we train our own):**
- Use our WLASL videos ✅ (We already have 22 extracted)
- Use public MediaPipe pose datasets
- Use YouTube ASL videos (with proper fair use)

---

## 🚀 RECOMMENDED IMPLEMENTATION STRATEGY

### **Approach 1: Use Sign.MT Model (If Allowed)**

**IF your use case qualifies for free license:**
1. Copy their TensorFlow model files
2. Use TensorFlow.js (Apache 2.0)
3. Use model-viewer (Apache 2.0)
4. Use Mixamo avatar (free)
5. **Add attribution**: "Based on sign.mt technology"

**IF commercial:**
1. Contact sign.mt for commercial license
2. OR: Train our own model (see Approach 2)

### **Approach 2: Build Our Own (100% Original)**

**Advantages:**
- ✅ No licensing concerns
- ✅ Optimized for our specific use case
- ✅ Full control

**Disadvantages:**
- ⏱ More time (2-4 weeks for model training)
- 🧠 Requires ML expertise
- 💰 GPU compute costs for training

**Steps:**
1. Collect training data (MediaPipe poses + correct quaternions)
2. Train TensorFlow model: 75 landmarks → 58 quaternions
3. Use same libraries (TensorFlow.js, model-viewer)
4. Use free Mixamo avatar

### **Approach 3: Hybrid (RECOMMENDED FOR NOW)**

**Use free components + study sign.mt approach:**

1. ✅ Use TensorFlow.js (Apache 2.0)
2. ✅ Use model-viewer (Apache 2.0)
3. ✅ Use Mixamo avatar (free)
4. ⚠️ Use sign.mt model ONLY if your use qualifies for free license
5. ✅ Plan to train our own model later if needed

**Timeline:**
- Week 1: Integrate TensorFlow.js + model-viewer (proper fix)
- Week 2-3: Test with sign.mt model (if allowed)
- Week 4+: Train our own model (if commercial license needed)

---

## 📋 FINAL RECOMMENDATION

### **Question 1: What is your use case?**

**A) Personal/Educational/Non-profit?**
→ ✅ Use sign.mt model freely (with attribution)
→ Timeline: 2-3 days to integrate

**B) Commercial/For-profit?**
→ ⚠️ Contact sign.mt for license OR build our own
→ Timeline: 2-3 days integration + license negotiation

**C) Open-source project?**
→ ✅ Can use if you release under ShareAlike license
→ Timeline: 2-3 days to integrate

### **Question 2: Can we proceed with implementation?**

**YES** - We can proceed with these 100% free components:
1. TensorFlow.js library ✅
2. Google model-viewer ✅
3. Mixamo 3D avatar ✅
4. Our existing MediaPipe JSON data ✅

**MAYBE** - Sign.mt's TensorFlow model:
- Depends on your commercial status
- Can use for testing/development regardless
- Production requires proper license

### **Question 3: Estimated Cost?**

**Free Components:**
- TensorFlow.js: **$0**
- model-viewer: **$0**
- Mixamo avatar: **$0**
- Development time: **Your time**

**Potential Costs:**
- Sign.mt commercial license: **Unknown** (contact them)
- Training our own model: **$50-500** (GPU compute)
- 3D avatar customization: **$0-500** (if you want custom design)

---

## ✅ NEXT STEPS (PENDING YOUR CONFIRMATION)

**Please confirm:**

1. **Your use case**: Personal / Educational / Non-profit / Commercial?

2. **Your preference**:
   - Option A: Use sign.mt model (if license allows)
   - Option B: Train our own model (100% original)
   - Option C: Hybrid approach (use for now, train later)

3. **Your commitment**: Do you have 2-3 days for proper implementation?

**Once confirmed, I will:**
1. Back up current working code ✅
2. Create feature branch for new implementation ✅
3. Install TensorFlow.js + model-viewer ✅
4. Download Mixamo avatar ✅
5. Integrate quaternion-based animation ✅
6. Test and verify ✅
7. Provide switch mechanism between old/new ✅

Let me know which option works for you!
