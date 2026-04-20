# VOTEX - Architecture & Flow Diagram

## 🎯 System Overview (For Teachers & Non-Technical Audience)

Think of VOTEX like a translator that helps people communicate in different ways:

```
                    VOTEX - Bridge to Inclusive Communication
                                    
                            🎤 LISTEN
                              ↓
                        [SPEECH RECOGNITION]
                              ↓
                        📝 CONVERT TO TEXT
                              ↓
                        🌍 TRANSLATE
                              ↓
                        🔊 SPEAK OUT LOUD
                              ↓
                        🤟 SHOW IN SIGN LANGUAGE
                              ↓
                        🎬 ANIMATE 3D AVATAR
```

**Real World Example:**
```
Person A (Deaf): Reads the sign language animation
                        ↑
                  [3D AVATAR MOVES]
                        ↑
                   "Hello" (converted to signs)
                        ↑
Person B (Hearing): Says "Hello" into microphone
                        ↑
                [SPEECH RECOGNIZED]
```

---

## 🏗️ Technical Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              FRONTEND (Static Files)                │  │
│  │                                                      │  │
│  │  ┌─────────────┐  ┌────────────────┐              │  │
│  │  │  Home Page  │  │ Speech-to-Text │              │  │
│  │  ├─────────────┤  ├────────────────┤              │  │
│  │  │ index.html  │  │  index.html    │              │  │
│  │  │ styles.css  │  │  styles.css    │              │  │
│  │  │ script.js   │  │  script.js     │              │  │
│  │  └─────────────┘  └────────────────┘              │  │
│  │                                                      │  │
│  │  ┌─────────────────┐  ┌──────────────────────────┐ │  │
│  │  │  Text-to-Speech │  │ Text-to-Sign-Language  │ │  │
│  │  ├─────────────────┤  ├──────────────────────────┤ │  │
│  │  │  index.html     │  │  index.html            │ │  │
│  │  │  styles.css     │  │  styles.css            │ │  │
│  │  │  script.js      │  │  script.js             │ │  │
│  │  └─────────────────┘  │  (3D Avatar Rendering) │ │  │
│  │                        └──────────────────────────┘ │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                        🌐 Port 8000                        │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP
                      (JSON API Calls)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER (Flask)                  │
│                    🖥️ Python Application                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Flask Routes & Endpoints               │  │
│  │                                                      │  │
│  │  GET  / → Home page                                │  │
│  │  GET  /speech_to_text/ → Speech UI                 │  │
│  │  GET  /text_to_sign_language/ → Sign language UI   │  │
│  │  POST /api/transcribe → Speech-to-text processing  │  │
│  │  POST /api/asl/gloss → English to ASL conversion   │  │
│  │  POST /api/asl/pose-stream → Pose animation data   │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Backend Processing Modules              │  │
│  │                                                      │  │
│  │  ┌─────────────────┐  ┌──────────────────────────┐ │  │
│  │  │ Speech-to-Text  │  │  Translation (External  │ │  │
│  │  │   Processor     │  │   APIs: MyMemory, etc)  │ │  │
│  │  └─────────────────┘  └──────────────────────────┘ │  │
│  │                                                      │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │   ASL Sign Language Processing             │    │  │
│  │  │  - Gloss Conversion                        │    │  │
│  │  │  - Pose Generation (MediaPipe)             │    │  │
│  │  │  - Animation Data Creation                 │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Data & Resources                       │  │
│  │                                                      │  │
│  │  📁 poses/ - Sign pose dictionary                  │  │
│  │  📁 poses_mediapipe/ - JSON pose files             │  │
│  │  📁 models/ - ML models for pose estimation       │  │
│  │  📁 backend/ - Python processing modules           │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                        🖥️ Port 5000                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### Flow 1: Speech-to-Text Feature

```
USER INTERACTION:
┌─────────────────────────────────────────────────────────┐
│  1. User clicks microphone button                       │
│  2. Browser asks for microphone permission             │
│  3. User speaks: "Hello"                               │
│  4. Audio recorded in browser                          │
└─────────────────────────────────────────────────────────┘
                          ↓

DATA TRANSMISSION:
┌─────────────────────────────────────────────────────────┐
│  POST /api/transcribe                                  │
│  {                                                      │
│    "audio": [binary audio data],                       │
│    "format": "wav"                                     │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
                          ↓

BACKEND PROCESSING:
┌─────────────────────────────────────────────────────────┐
│  1. Receive audio file                                 │
│  2. Process audio → extract features                   │
│  3. Apply speech recognition model                     │
│  4. Convert to text: "Hello"                           │
│  5. Return result                                      │
└─────────────────────────────────────────────────────────┘
                          ↓

RESPONSE:
┌─────────────────────────────────────────────────────────┐
│  {                                                      │
│    "status": "success",                               │
│    "transcript": "Hello",                             │
│    "confidence": 0.95                                 │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
                          ↓

FRONTEND DISPLAY:
┌─────────────────────────────────────────────────────────┐
│  Show text: "Hello"                                    │
│  Display confidence: 95%                              │
└─────────────────────────────────────────────────────────┘
```

---

### Flow 2: Text-to-Sign-Language Feature

```
USER INTERACTION:
┌─────────────────────────────────────────────────────────┐
│  1. User types: "Hello"                                │
│  2. Clicks "Animate Sign" button                       │
└─────────────────────────────────────────────────────────┘
                          ↓

STEP 1 - ENGLISH TO ASL GLOSS:
┌─────────────────────────────────────────────────────────┐
│  POST /api/asl/gloss                                   │
│  { "text": "Hello" }                                   │
│                                                         │
│  Backend converts:                                     │
│  "Hello" → "HELLO" (ASL gloss/sign name)              │
│                                                         │
│  Response: { "gloss": "HELLO", "signs": [...] }      │
└─────────────────────────────────────────────────────────┘
                          ↓

STEP 2 - GLOSS TO POSE ANIMATION:
┌─────────────────────────────────────────────────────────┐
│  POST /api/asl/pose-stream                             │
│  { "gloss": "HELLO" }                                  │
│                                                         │
│  Backend generates:                                    │
│  - Body pose (33 landmarks: head, arms, torso, legs)  │
│  - Hand pose (21 landmarks per hand)                   │
│  - Keyframe sequence (frames over time)                │
│  - Frame rate (30 fps)                                 │
│                                                         │
│  Response: {                                           │
│    "animation": [...keyframes...],                    │
│    "fps": 30,                                         │
│    "duration": 1.5                                    │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
                          ↓

STEP 3 - FRONTEND RENDERING:
┌─────────────────────────────────────────────────────────┐
│  Three.js processes pose data:                         │
│  1. Create 3D skeleton (bones/joints)                  │
│  2. Load animation keyframes                           │
│  3. Set up camera & lighting                          │
│  4. Start animation loop                              │
└─────────────────────────────────────────────────────────┘
                          ↓

USER OUTPUT:
┌─────────────────────────────────────────────────────────┐
│  👁️ Watch 3D avatar perform "HELLO" sign               │
│     - Arms move in proper ASL positions                │
│     - Hands show correct shape & orientation           │
│     - Body posture matches sign language convention    │
└─────────────────────────────────────────────────────────┘
```

---

### Flow 3: Translation & Speech

```
USER INPUT:
┌─────────────────────────────────────────────────────────┐
│  1. User types: "Bonjour"                              │
│  2. Selects language: French → English                │
│  3. Clicks "Translate & Speak"                        │
└─────────────────────────────────────────────────────────┘
                          ↓

TRANSLATION:
┌─────────────────────────────────────────────────────────┐
│  Call external Translation API:                        │
│  - Input: "Bonjour" (French)                          │
│  - Output: "Hello" (English)                          │
│                                                         │
│  [Uses: MyMemory, LibreTranslate, or Google Translate]│
└─────────────────────────────────────────────────────────┘
                          ↓

TEXT-TO-SPEECH:
┌─────────────────────────────────────────────────────────┐
│  Convert text to audio:                               │
│  - Input: "Hello" (English text)                      │
│  - Output: MP3/WAV audio file                         │
│  - Speak it through browser speaker                  │
└─────────────────────────────────────────────────────────┘
                          ↓

OUTPUT:
┌─────────────────────────────────────────────────────────┐
│  Translated text: "Hello"                             │
│  🔊 Audio playing                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Relationships

```
                          Frontend
                      (User Interface)
                            |
        ____________________|____________________
        |                   |                   |
    
    Speech Input         Text Input        Sign Output
        |                   |                   |
        ↓                   ↓                   ↓
    
    ┌─────────────────────────────────────────────┐
    │          Backend API Endpoints              │
    ├─────────────────────────────────────────────┤
    │  /api/transcribe                            │
    │  /api/asl/gloss                             │
    │  /api/asl/pose-stream                       │
    │  /api/translate (external)                  │
    │  /api/tts (external)                        │
    └─────────────────────────────────────────────┘
        |                   |
        ↓                   ↓
    
    Speech Processing    NLP Processing
    ML Models           ML Models
        |                   |
        ↓                   ↓
    
    ┌─────────────────────────────────────────────┐
    │         Data Storage & Resources            │
    ├─────────────────────────────────────────────┤
    │  Pose Dictionary: poses/                    │
    │  MediaPipe Poses: poses_mediapipe/          │
    │  ML Models: models/                         │
    │  Gloss Mapping: backend/asl_gloss/          │
    └─────────────────────────────────────────────┘
```

---

## 🌐 Network Communication

### Development (Local Machine)

```
Browser (Frontend)          Flask Server (Backend)
http://localhost:8000       http://localhost:5000
      ↕                           ↕
  Static Files            Python Processing
  HTML/CSS/JS             + ML Models
                          + Data Files
      
  ← → HTTP/JSON  Requests & Responses
```

### Production (Deployed)

```
Browser (CDN)               Backend Server (VPS)
https://votex.netlify.app   https://api.votex.com
      ↕                           ↕
  Static Files            Python Processing
  (Cached Globally)       + ML Models
                          + Data Files
      
  ← → HTTPS/JSON  Secure Requests & Responses
```

---

## 📊 Technology Relationships

```
┌──────────────────────────────────────────────────────────┐
│                    User Browser                          │
└──────────────────────────────────────────────────────────┘
                            ↓
                  ┌─────────────────────┐
                  │   Three.js Library  │
                  │  (3D Rendering)     │
                  └─────────────────────┘
                            ↓
                  ┌─────────────────────┐
                  │  MediaPipe JS/Py    │
                  │ (Pose Estimation)   │
                  └─────────────────────┘
                            ↓
                  ┌─────────────────────┐
                  │  Web Audio API      │
                  │ (Audio Processing)  │
                  └─────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │     HTTP/JSON Communication           │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │        Flask Web Framework            │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │      Python Processing Layer          │
        │ - Speech Recognition                  │
        │ - NLP/Translation                    │
        │ - Pose Generation                    │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │      ML Models & Data                 │
        │ - MediaPipe Models                    │
        │ - Sign Dictionaries                   │
        │ - Pose Files                          │
        └───────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

### Option 1: Local Development
```
Your Computer
├── Frontend Server (port 8000)
│   └── Static files
└── Backend Server (port 5000)
    └── Flask + Python
```

### Option 2: Hybrid Deployment (Recommended for Start-ups)
```
Internet Users → Netlify CDN → Frontend (Static)
                     ↓
                Your Backend Server (Flask)
                     ↓
                Your Database/Data
```

### Option 3: Full Cloud Deployment
```
Internet Users → CDN → Cloud Frontend
                     ↓
                Cloud Backend (AWS/GCP/Azure)
                     ↓
                Cloud Database
```

---

## 📌 Key Architectural Principles

1. **Separation of Concerns**
   - Frontend handles UI/UX
   - Backend handles processing
   - Data layer handles storage

2. **Modularity**
   - Each feature is self-contained
   - Easy to add/remove components
   - Independent testing possible

3. **Scalability**
   - Frontend can scale on CDN
   - Backend can scale horizontally
   - Database can scale vertically or via sharding

4. **Security**
   - HTTPS for data in transit
   - Environment variables for secrets
   - Input validation on backend

5. **Performance**
   - Caching of static assets
   - Lazy loading of models
   - Efficient pose data format

---

**Last Updated:** April 2026
**Version:** 1.0
