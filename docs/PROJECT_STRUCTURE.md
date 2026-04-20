# VOTEX - Project Structure & Overview

## 📌 What is VOTEX?

**VOTEX** (Voice to Text Converter) is a comprehensive platform that bridges communication gaps by combining:

- 🎤 **Speech-to-Text** - Convert spoken words to written text
- 💬 **Text-to-Speech** - Convert written text to spoken audio
- 🗣️ **Translation & Speech** - Translate text and speak it in different languages
- 🤟 **Text-to-Sign Language** - Convert text to animated 3D sign language using AI pose estimation

**Purpose:** Enable inclusive communication for deaf, hard-of-hearing, and multilingual communities.

---

## 📂 Project Architecture

```
VoiceotTextConverter/
│
├── frontend/                          # ALL FRONTEND (Static Files + HTML/CSS/JS)
│   ├── index.html                     # Home page
│   ├── votex-modern.css               # Home page styles
│   ├── votex-modern.js                # Home page scripts
│   ├── logo.png                       # Brand logo
│   ├── illustration.png               # Hero image
│   │
│   ├── speech_to_text/                # Feature: Speech Recognition
│   │   ├── index.html                 # UI structure
│   │   ├── styles.css                 # Component styling
│   │   ├── script.js                  # Audio capture & transcription
│   │   └── script_fixed.js            # Alternative version
│   │
│   ├── text_to_speech/                # Feature: Audio Generation
│   │   ├── index.html                 # UI structure
│   │   └── README_SERVER.md           # Documentation
│   │
│   ├── translate_and_speak/           # Feature: Translation
│   │   ├── index.html                 # UI structure
│   │   ├── styles.css                 # Component styling
│   │   └── script.js                  # Translation logic
│   │
│   └── text_to_sign_language/         # Feature: Sign Language Animation
│       ├── index.html                 # UI structure
│       ├── styles.css                 # Component styling
│       ├── script.js                  # Main animation logic
│       ├── script_real_signs.js       # Real sign data handler
│       ├── components/
│       │   ├── ThreeIKAvatar.js       # 3D Avatar renderer
│       │   ├── SignAvatar.js          # Alternative avatar
│       │   ├── NeuralLinkAvatar.js    # Advanced avatar
│       │   └── *.css                  # Component styles
│       ├── vendor/                    # External libraries
│       └── backup/                    # Older versions
│
├── home_page/                         # BACKEND SERVER
│   ├── server.py                      # Flask server (MAIN ENTRY POINT)
│   ├── app.py                         # Flask app configuration
│   ├── requirements.txt               # Python dependencies
│   ├── home.html                      # Alternative home page
│   ├── votex.css                      # Styles
│   ├── votex.js                       # Scripts
│   │
│   ├── mediapipe_avatar.html          # NEW: Fixed hand avatar
│   ├── kalidokit_poc.html             # NEW: Kalidokit avatar POC
│   ├── pose_viewer_production.html    # Production pose viewer
│   │
│   ├── assets/                        # Supporting files
│   ├── poses/                         # Pre-built pose data
│   └── backups/                       # Version backups
│
├── backend/                           # BACKEND LOGIC (Python Modules)
│   ├── __init__.py
│   ├── asl_gloss/                     # ASL to pose conversion
│   │   └── *.py                       # Gloss to pose mapping
│   └── pose_stream/                   # Pose generation
│       ├── mediapipe_json_loader.py   # MediaPipe pose loading
│       └── *.py                       # Pose processing
│
├── Data/                              # Pre-built data
│   └── *.pose                         # Pose format files
│
├── poses/                             # Sign pose dictionary
│   └── *.pose                         # Individual sign poses
│
├── poses_mediapipe/                   # MediaPipe format poses
│   └── *.json                         # JSON pose files
│
├── pose_dictionary/                   # Lookup tables
│   └── *.json                         # Sign definitions
│
├── models/                            # ML models
│   └── *.pth, *.pb                    # Pre-trained models
│
├── text_to_sign_kalidokit/            # Alternative sign system
│   ├── index.html
│   ├── assets/
│   └── README.md
│
├── WLASL-master/                      # ASL Dataset
│   └── ...                            # Dataset files
│
├── netlify.toml                       # Netlify deployment config
├── .env                               # Environment variables
├── requirements.txt                   # Project dependencies
└── README.md                          # Main documentation
```

---

## 🏗️ Technology Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling & animations
- **JavaScript (ES6+)** - Client-side logic
- **Three.js** - 3D rendering for avatars
- **MediaPipe** - Pose estimation

### Backend
- **Python 3.9+** - Server language
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin support
- **MediaPipe** - Pose detection & hand tracking
- **NumPy** - Numerical computing

### Deployment
- **Netlify** - Frontend hosting (static files)
- **Flask Development Server** - Local backend
- **Python HTTP Server** - Static frontend (development)

---

## 🔄 System Workflow

```
User Input (Text/Speech)
         ↓
    Frontend (HTML/JS)
         ↓
    Backend API (Flask)
         ↓
    Process (Python/ML)
    - Speech-to-Text API
    - Translation API
    - Pose Generation
    - Sign Language Mapping
         ↓
    Return Result (JSON/Audio/Pose Data)
         ↓
    Frontend Render
    - Display text
    - Play audio
    - Animate 3D avatar
         ↓
    User Output (Screen/Speaker)
```

---

## 📡 API Endpoints

### Hosted Backend (Flask on port 5000)

| Endpoint | Method | Purpose | Input | Output |
|----------|--------|---------|-------|--------|
| `/` | GET | Home page | — | HTML |
| `/speech_to_text/` | GET | Speech-to-text UI | — | HTML |
| `/text_to_speech/` | GET | Text-to-speech UI | — | HTML |
| `/translate_and_speak/` | GET | Translation UI | — | HTML |
| `/text_to_sign_language/` | GET | Sign language UI | — | HTML |
| `/api/transcribe` | POST | Transcribe audio | audio file | `{transcript}` |
| `/api/asl/gloss` | POST | Convert English to ASL | `{text}` | `{gloss, frame_rate, ...}` |
| `/api/asl/pose-stream` | POST | Generate pose animation | `{gloss}` | `{animation_data}` |

---

## 🌐 Frontend-Backend Communication

### With Split Setup (Recommended)

**Frontend Server:** `http://localhost:8000` (Static files)
**Backend Server:** `http://localhost:5000` (Flask API)

```
Frontend (port 8000) → API Call → Backend (port 5000)
```

### For Production (Netlify + Flask)

**Frontend:** Deployed on Netlify
**Backend API:** Running on Flask (your server/VPS)

```
Frontend (Netlify CDN) → API Call → Backend (your.domain.com:5000)
```

---

## 📊 Component Descriptions

### 1. **Speech-to-Text** (`frontend/speech_to_text/`)
- Captures audio from microphone
- Sends to backend `/api/transcribe`
- Displays transcribed text
- **Tech:** Web Audio API, Flask audio processing

### 2. **Text-to-Speech** (`frontend/text_to_speech/`)
- Accepts text input
- Converts to MP3 audio
- Plays in browser
- **Tech:** Text-to-Speech API (external)

### 3. **Translate & Speak** (`frontend/translate_and_speak/`)
- Translates text to different languages
- Speaks the translated text
- **Tech:** Translation APIs (MyMemory, LibreTranslate)

### 4. **Text-to-Sign Language** (`frontend/text_to_sign_language/`)
- Converts English text to ASL gloss
- Generates pose animation data
- Renders 3D animated avatar
- **Tech:** MediaPipe, Three.js, pose estimation

---

## 🚀 Deployment Layers

### Layer 1: Frontend (Static Files)
- **What:** HTML, CSS, JS, images
- **Where:** `frontend/` folder
- **Hosting:** Netlify or any static host
- **Config:** `netlify.toml`

### Layer 2: Backend (Python API)
- **What:** Flask server with ML models
- **Where:** `home_page/server.py` + `backend/` modules
- **Hosting:** Your own VPS, cloud server, or local machine
- **Entry Point:** `python server.py`

### Layer 3: Data (Pose Dictionary)
- **What:** Pre-built sign animations
- **Where:** `poses/`, `poses_mediapipe/`, `pose_dictionary/`
- **Served by:** Backend API

---

## ⚙️ Configuration Files

### `netlify.toml`
Netlify deployment configuration
- Publishes from `frontend/` folder
- Redirects for URL routing

### `.env`
Environment variables (create from `.env.example`)
```
API_KEY=your_api_key
BACKEND_URL=http://localhost:5000
```

### `requirements.txt`
Python package dependencies
```
Flask==2.3.0
Flask-CORS==4.0.0
MediaPipe==0.10.0
... (and more)
```

### `package.json` (in home_page/)
Node.js dependencies for Three.js and other JS libraries

---

## 📌 Key Design Decisions

1. **Modular Components:** Each feature is self-contained in its own folder
2. **Separation of Concerns:** Frontend (static) separate from backend (Flask)
3. **Component-Based Architecture:** Reusable, testable components
4. **MediaPipe for Pose:** Industry-standard for pose estimation
5. **Three.js for 3D:** Mature library for 3D rendering
6. **Flask for Backend:** Lightweight, flexible, Python-based

---

## 🔗 Dependencies Overview

**Frontend Dependencies:**
- Three.js (3D rendering)
- MediaPipe JavaScript (pose detection)
- Optional: Kalidokit (character animation)

**Backend Dependencies:**
- Flask (web framework)
- MediaPipe Python (pose estimation)
- NumPy (numerical computing)
- SciPy (scientific computing)
- Requests (HTTP client)

**Optional ML Models:**
- Pose format models
- Hand tracking models
- Sign recognition models

---

## 📚 Related Documentation

- `QUICK_START.md` - Running the app
- `README_VOTEX.md` - Detailed README
- Individual `README.md` in each component folder

---

**Last Updated:** April 2026
**Version:** 1.0
**Project Owner:** VOTEX Team
