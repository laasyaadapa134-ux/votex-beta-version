# VOTEX Functionality and AI/API Usage

## Objective
This document clearly explains:
1. How each main feature works.
2. Which APIs and technologies are actually used.
3. Whether OpenAI or Gemini APIs are used.

---

## 1) Feature-by-feature technical flow

## A. Speech to Text
Flow:
1. User records audio or uploads file in frontend speech_to_text page.
2. Frontend sends request to backend endpoint /api/transcribe.
3. Backend processes audio with Whisper path:
   - preferred: Groq Whisper endpoint,
   - fallback: local openai-whisper model if installed.
4. Backend returns transcription JSON.
5. Frontend displays transcribed text.

Key endpoint:
- POST /api/transcribe

## B. Translate and Speak
Flow:
1. User enters source text and selects languages.
2. Frontend tries translation providers in sequence:
   - MyMemory API,
   - LibreTranslate,
   - Google translate public endpoint.
3. Frontend receives translated text.
4. Text-to-speech playback happens in browser flow.

Important note:
- This feature is mostly frontend-driven with external translation services.

## C. Text to Sign Language
Flow:
1. User enters text in frontend text_to_sign_language page.
2. Frontend calls backend endpoint /api/asl/gloss to convert text to ASL gloss tokens.
3. Frontend calls backend endpoint /api/asl/pose-stream to request pose animation data.
4. Backend returns pose frame data (MediaPipe-oriented path preferred).
5. Frontend avatar renderer consumes frames and plays sign animation.

Key endpoints:
- POST /api/asl/gloss
- POST /api/asl/pose-stream

## D. Text to Speech
Flow:
1. User enters text.
2. Frontend triggers speech synthesis path.
3. Audio playback output is returned to user.

---

## 2) Actual technologies currently used in code

Backend:
1. Python
2. Flask
3. Flask-CORS
4. Requests
5. MediaPipe data pipeline modules
6. Pose processing modules in backend package

Frontend:
1. HTML/CSS/JavaScript
2. Three.js for 3D avatar rendering
3. Browser Web Speech API in some flows

Data and assets:
1. poses and poses_mediapipe dictionaries
2. ASL gloss and pose stream generation modules

---

## 3) OpenAI/Gemini usage status (clear answer)

## OpenAI API (chat/completions)
Current status: NO direct chat-completions usage found in runtime app flow.

## Gemini API
Current status: NO Gemini API integration found in runtime app flow.

## Whisper usage
Current status: YES, speech transcription uses Whisper path:
1. Groq transcription endpoint compatible with OpenAI-style audio transcription path, or
2. local openai-whisper model as fallback.

So for judges asking "Do you use OpenAI or Gemini APIs?"
Use this exact answer:
"We do not use OpenAI ChatGPT API or Gemini API in the live app flow. We use Whisper-based transcription and MediaPipe-based sign pipeline."

---

## 4) AI usage statement for Technovation form/video

Recommended statement:
"YES, we used AI in our project. We use AI/ML components such as Whisper for speech transcription and MediaPipe-based pose pipelines for sign generation. We also used AI-assisted coding support during development, followed by human review and testing before final integration."

If asked specifically about Generative AI in app runtime:
"Our runtime app mainly uses speech and pose AI models, not a generative chat model endpoint like OpenAI GPT or Gemini."

---

## 5) External services inventory

Translation services used by frontend:
1. api.mymemory.translated.net
2. libretranslate.de
3. translate.googleapis.com endpoint

Speech transcription service path:
1. api.groq.com openai-style transcription route when API key is set
2. local whisper fallback otherwise

---

## 6) Where this is seen in project code

Main references:
1. home_page/server.py
   - /api/transcribe
   - /api/asl/gloss
   - /api/asl/pose-stream
2. frontend/translate_and_speak/script.js
   - MyMemory, LibreTranslate, Google translation calls
3. frontend/speech_to_text/script_fixed.js
   - backend transcribe endpoint usage
4. frontend/text_to_sign_language/script.js
   - gloss and pose-stream endpoint usage

---

## 7) One-slide summary for presentation

VOTEX Stack Summary:
1. Frontend: HTML/CSS/JS + Three.js
2. Backend: Python Flask APIs
3. AI/ML: Whisper transcription + MediaPipe pose pipeline
4. External APIs: translation providers
5. Not using: OpenAI Chat API or Gemini API in current live runtime

---

Last updated: April 2026
