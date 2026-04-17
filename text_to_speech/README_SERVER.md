# Running Text to Speech with Download Feature

The download feature requires the application to be served over HTTP (not opened directly as a file).

## Quick Start - Run Local Web Server

### Option 1: Python (Recommended)
If you have Python installed:

```bash
# Navigate to the folder containing index.html
cd c:\Users\Public\VoiceotTextConverter\text_to_speech

# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Then open: http://localhost:8080

### Option 2: Node.js
If you have Node.js installed:

```bash
# Install http-server globally
npm install -g http-server

# Navigate to the folder
cd c:\Users\Public\VoiceotTextConverter\text_to_speech

# Run server
http-server -p 8080
```

Then open: http://localhost:8080

### Option 3: PHP
If you have PHP installed:

```bash
cd c:\Users\Public\VoiceotTextConverter\text_to_speech
php -S localhost:8080
```

Then open: http://localhost:8080

### Alternative Ports
If port 8080 is also in use, you can try these alternatives:
- Port 5500: `python -m http.server 5500` → http://localhost:5500
- Port 9000: `python -m http.server 9000` → http://localhost:9000
- Port 5000: `python -m http.server 5000` → http://localhost:5000
- Port 4200: `python -m http.server 4200` → http://localhost:4200

## Features
- ✅ **Convert & Speak**: Works without web server (uses browser's built-in TTS)
- ⚠️ **Download MP3**: Requires web server (downloads audio file using external API)

## Note
When opening the file directly (file://), only the "Convert & Speak" button will work properly.
