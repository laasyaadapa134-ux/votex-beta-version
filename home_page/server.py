import os
import sys
import tempfile
from pathlib import Path

from flask import Flask, send_from_directory, request, jsonify, redirect
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

DEFAULT_POSE_DICTIONARY = os.path.join(BASE_DIR, 'poses')  # Old BODY_135 format
DEFAULT_MEDIAPIPE_DICTIONARY = os.path.join(BASE_DIR, 'poses_mediapipe')  # New MediaPipe JSON format

load_dotenv(os.path.join(BASE_DIR, '.env'))
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

try:
    from backend import build_fluent_pose_animation_data, build_pose_animation_data, build_pose_format_animation_data, english_to_asl_gloss_data
    BACKEND_IMPORT_ERROR = None
except Exception as exc:
    build_fluent_pose_animation_data = None
    build_pose_animation_data = None
    build_pose_format_animation_data = None
    english_to_asl_gloss_data = None
    BACKEND_IMPORT_ERROR = str(exc)

# Import MediaPipe JSON loader (NEW - direct MediaPipe format support)
try:
    from backend.pose_stream.mediapipe_json_loader import build_mediapipe_json_animation_data
    MEDIAPIPE_JSON_AVAILABLE = True
    print("✅ MediaPipe JSON loader imported successfully!")
    sys.stdout.flush()
except Exception as exc:
    build_mediapipe_json_animation_data = None
    MEDIAPIPE_JSON_AVAILABLE = False
    print(f"[!] MediaPipe JSON loader unavailable: {exc}")
    sys.stdout.flush()

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

print(f"\n📊 Server Status:")
print(f"  - MediaPipe JSON: {'✅ Available' if MEDIAPIPE_JSON_AVAILABLE else '❌ Unavailable'}")
print(f"  - DEFAULT_MEDIAPIPE_DICTIONARY: {DEFAULT_MEDIAPIPE_DICTIONARY}")
print(f"  - DEFAULT_POSE_DICTIONARY: {DEFAULT_POSE_DICTIONARY}\n")
sys.stdout.flush()


@app.route('/')
def home():
    return send_from_directory('.', 'home.html')


# Routes with underscores (matching folder names) - works in Flask and Netlify
@app.route('/text_to_speech')
@app.route('/text_to_speech/')
def text_to_speech():
    return send_from_directory(os.path.join(BASE_DIR, 'text_to_speech'), 'index.html')

@app.route('/speech_to_text')
@app.route('/speech_to_text/')
def speech_to_text():
    return send_from_directory(os.path.join(BASE_DIR, 'speech_to_text'), 'index.html')

@app.route('/translate_and_speak')
@app.route('/translate_and_speak/')
def translate_and_speak():
    return send_from_directory(os.path.join(BASE_DIR, 'translate_and_speak'), 'index.html')

@app.route('/text_to_sign_language')
@app.route('/text_to_sign_language/')
def text_to_sign_language():
    return send_from_directory(os.path.join(BASE_DIR, 'text_to_sign_language'), 'index.html')

@app.route('/speech_to_text/<path:filename>')
def speech_to_text_static(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'speech_to_text'), filename)

@app.route('/text_to_speech/<path:filename>')
def text_to_speech_static(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'text_to_speech'), filename)

@app.route('/translate_and_speak/<path:filename>')
def translate_and_speak_static(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'translate_and_speak'), filename)

@app.route('/text_to_sign_language/<path:filename>')
def serve_text_to_sign_language_file(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'text_to_sign_language'), filename)

# Backward compatibility: redirect old dashed URLs to underscore URLs
@app.route('/text-to-speech')
def redirect_text_to_speech():
    return redirect('/text_to_speech/', 301)

@app.route('/speech-to-text')
def redirect_speech_to_text():
    return redirect('/speech_to_text/', 301)

@app.route('/translate-and-speak')
def redirect_translate_and_speak():
    return redirect('/translate_and_speak/', 301)

@app.route('/text-to-sign-language')
def redirect_text_to_sign_language():
    return redirect('/text_to_sign_language/', 301)


# NEW: Kalidokit POC Module (isolated from existing text-to-sign-language)
@app.route('/kalidokit-poc')
def text_to_sign_kalidokit():
    # Serve the Kalidokit POC page
    return send_from_directory('../text_to_sign_kalidokit', 'index.html')


@app.route('/kalidokit-poc/<path:filename>')
def serve_kalidokit_file(filename):
    # Serve static files for Kalidokit POC component
    return send_from_directory('../text_to_sign_kalidokit', filename)


@app.route('/poses/<path:filename>')
def poses_static(filename):
    # Serve .pose files from poses directory
    return send_from_directory('../poses', filename)


# NEW: Serve MediaPipe JSON pose files
@app.route('/poses_mediapipe/<path:filename>')
def poses_mediapipe_static(filename):
    # Serve MediaPipe JSON files for Kalidokit POC
    return send_from_directory('../poses_mediapipe', filename)


@app.route('/test_pose_player.html')
def test_pose_player():
    # Serve test pose player from parent directory
    return send_from_directory('..', 'test_pose_player.html')


@app.route('/test_avatar.html')
def test_avatar():
    # Serve test avatar page from parent directory
    return send_from_directory('..', 'test_avatar.html')


@app.route('/test_debug_avatar.html')
def test_debug_avatar():
    # Serve debug avatar page from parent directory
    return send_from_directory('..', 'test_debug_avatar.html')


@app.route('/test_simple_avatar.html')
def test_simple_avatar():
    # Serve simple avatar test page
    return send_from_directory('..', 'test_simple_avatar.html')


@app.route('/test_professional_avatar.html')
def test_professional_avatar():
    # Serve professional avatar page
    return send_from_directory('..', 'test_professional_avatar.html')


@app.route('/test_neural_link_avatar.html')
def test_neural_link_avatar():
    # Serve Neural-Link Mannequin avatar page
    return send_from_directory('..', 'test_neural_link_avatar.html')


@app.route('/threejs_esm_starter.html')
def threejs_esm_starter():
    # Serve Three.js ESM starter template
    return send_from_directory('..', 'threejs_esm_starter.html')


@app.route('/api/asl/gloss', methods=['POST'])
def asl_gloss_api():
    if english_to_asl_gloss_data is None:
        return jsonify({"error": "ASL backend unavailable", "details": BACKEND_IMPORT_ERROR}), 500

    payload = request.get_json(silent=True) or {}
    text = (payload.get('text') or '').strip()

    if not text:
        return jsonify({"error": "Request JSON must include non-empty 'text'"}), 400

    return jsonify(english_to_asl_gloss_data(text))


@app.route('/api/asl/pose-stream', methods=['POST'])
def asl_pose_stream_api():
    """Process glosses and return pose animation stream"""
    if build_pose_animation_data is None:
        return jsonify({"error": "ASL backend unavailable", "details": BACKEND_IMPORT_ERROR}), 500

    payload = request.get_json(silent=True) or {}
    glosses = payload.get('glosses', [])
    
    if not glosses or not isinstance(glosses, list):
        return jsonify({"error": "Request must include 'glosses' as a non-empty array"}), 400
    
    # ==================== TEST MODE DISABLED - Using real pose files now ====================
    # import math
    # print(f"[TEST MODE] Generating simple animation for: {glosses}")
    # ... (test animation code commented out)
    # ==================== END TEST MODE ====================
    
    dictionary_path = payload.get('dictionary_path', DEFAULT_POSE_DICTIONARY)
    fps = payload.get('fps', 10)  # Default to 10 FPS for readable playback
    transition_frames = payload.get('transition_frames', 4)
    smoothing_engine = payload.get('smoothing_engine', 'mediapipe-json')  # NEW: prefer MediaPipe JSON
    
    try:
        result = None
        
        # TRY MEDIAPIPE JSON FIRST (native format, no conversion needed)
        if smoothing_engine == 'mediapipe-json' and MEDIAPIPE_JSON_AVAILABLE:
            try:
                print(f"[MediaPipe JSON] Loading from {DEFAULT_MEDIAPIPE_DICTIONARY}")
                result = build_mediapipe_json_animation_data(
                    glosses=glosses,
                    dictionary_path=Path(DEFAULT_MEDIAPIPE_DICTIONARY),
                    fps=fps,
                    transition_frames=transition_frames
                )
                print(f"[MediaPipe JSON] Success! {result['frame_count']} frames at {result['fps']} FPS")
            except Exception as e:
                print(f'MediaPipe JSON loading failed: {e}, falling back to pose-format...')
        
        # Try pose-format (BODY_135) if MediaPipe JSON not available
        if not result and smoothing_engine in ['pose-format', 'mediapipe-json'] and build_pose_format_animation_data:
            try:
                print(f"[Pose-Format] Loading BODY_135 from {dictionary_path}")
                result = build_pose_format_animation_data(
                    glosses=glosses,
                    dictionary_path=dictionary_path,
                    fps=fps,
                    transition_frames=transition_frames
                )
            except Exception as e:
                print(f'Pose-format smoothing failed: {e}, falling back...')
        
        # Try fluent synthesis
        if not result and build_fluent_pose_animation_data:
            try:
                result = build_fluent_pose_animation_data(
                    glosses=glosses,
                    dictionary_path=dictionary_path,
                    fps=fps,
                    transition_frames=transition_frames
                )
            except Exception as e:
                print(f'Fluent synthesis failed: {e}, falling back...')
        
        # Fallback to basic renderer
        if not result and build_pose_animation_data:
            result = build_pose_animation_data(
                glosses=glosses,
                dictionary_path=dictionary_path,
                fps=fps,
                transition_frames=transition_frames
            )
        
        if not result:
            return jsonify({"error": "No pose animation backend available"}), 500
        
        # Transform backend format to frontend-expected format
        # Frontend expects: { gloss_data: { [wordKey]: [frames with pose_landmarks] }, fps: number }
        
        # Check if result is already in gloss_data format (MediaPipe JSON)
        if 'gloss_data' in result:
            # MediaPipe JSON format - already has gloss_data
            response_data = {
                "gloss_data": result['gloss_data'],
                "fps": result.get('fps', fps),
                "glosses": list(result['gloss_data'].keys()),
                "frame_count": result.get('frame_count', 0)
            }
        else:
            # Old pose_stream format - convert to gloss_data
            pose_stream = result.get('pose_stream', [])
            fps_value = result.get('fps', fps)
            
            # Create gloss_data format: use first gloss as key, all frames as value
            gloss_key = glosses[0].upper() if glosses else "SIGN"
            
            response_data = {
                "gloss_data": {
                    gloss_key: pose_stream  # pose_stream already contains frames with pose_landmarks
                },
                "fps": fps_value,
                "glosses": result.get('glosses', glosses),
                "frame_count": len(pose_stream)
            }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f'Error in pose-stream API: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to build pose stream: {str(e)}"}), 500


@app.route('/<path:filename>')
def static_files(filename):
    # Serve other static files (css, images, js) from home_page
    if os.path.exists(filename):
        return send_from_directory('.', filename)
    # fallback
    return ('Not found', 404)


@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio/video files using Whisper API"""
    try:
        # Check if file or URL is provided
        if 'file' in request.files:
            audio_file = request.files['file']
            
            # Save temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1]) as temp_file:
                audio_file.save(temp_file.name)
                temp_path = temp_file.name
            
            # Use free Whisper API or local processing
            # For now, using OpenAI Whisper (you can replace with Groq's free Whisper API)
            try:
                # Try Groq's free Whisper API (faster and free)
                result = transcribe_with_groq(temp_path)
            except:
                # Fallback to basic error message
                result = {"error": "Transcription service unavailable. Please install OpenAI Whisper locally or add API key."}
            
            # Clean up temp file
            os.unlink(temp_path)
            
            return jsonify(result)
            
        elif 'url' in request.json:
            url = request.json['url']
            
            # Download audio from URL
            response = requests.get(url, stream=True)
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                for chunk in response.iter_content(chunk_size=8192):
                    temp_file.write(chunk)
                temp_path = temp_file.name
            
            # Transcribe
            try:
                result = transcribe_with_groq(temp_path)
            except:
                result = {"error": "Transcription service unavailable"}
            
            # Clean up
            os.unlink(temp_path)
            
            return jsonify(result)
        
        else:
            return jsonify({"error": "No file or URL provided"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def transcribe_with_groq(audio_path):
    """Transcribe using Groq's free Whisper API"""
    # Note: Groq offers free Whisper transcription
    # You can also use: https://github.com/openai/whisper for local transcription
    
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')  # User can set this
    
    if not GROQ_API_KEY:
        # Try local Whisper if installed
        try:
            import whisper
            model = whisper.load_model("base")
            result = model.transcribe(audio_path)
            return {"text": result["text"]}
        except ImportError:
            return {
                "error": "No API key found and Whisper not installed locally",
                "instructions": "Install with: pip install openai-whisper OR set GROQ_API_KEY environment variable"
            }
    
    # Use Groq API
    try:
        with open(audio_path, 'rb') as audio_file:
            response = requests.post(
                'https://api.groq.com/openai/v1/audio/transcriptions',
                headers={'Authorization': f'Bearer {GROQ_API_KEY}'},
                files={'file': audio_file},
                data={'model': 'whisper-large-v3'}
            )
        
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"API error: {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
