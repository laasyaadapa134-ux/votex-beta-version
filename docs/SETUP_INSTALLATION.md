# VOTEX - Setup & Installation Guide

## 📋 Prerequisites

### System Requirements
- **OS:** Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM:** Minimum 4GB (8GB+ recommended for smooth 3D rendering)
- **Disk:** 5GB+ free space
- **Browser:** Modern browser (Chrome, Firefox, Safari, Edge)

### Required Software
- **Python 3.9 or higher** - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/downloads)
- **Node.js 14+** (optional, for frontend development) - [Download](https://nodejs.org/)

### Verify Installations
```bash
python --version          # Should show 3.9+
git --version             # Should show git version
npm --version             # (optional) Should show npm version
```

---

## 🚀 Installation Steps (Any Machine)

### Step 1: Clone the Repository

```bash
# Open terminal/command prompt and navigate to where you want the project
cd Desktop  # or any desired location

# Clone the repository
git clone https://github.com/your-org/VoiceotTextConverter.git
cd VoiceotTextConverter
```

### Step 2: Set Up Python Environment

#### Windows:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

#### macOS / Linux:
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

### Step 3: Install Python Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install all dependencies from requirements.txt
pip install -r requirements.txt

# Verify Flask and key packages are installed
pip list | grep -i flask
```

**Note:** First installation may take 5-10 minutes as it downloads ML models.

### Step 4: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env   # macOS/Linux
copy .env.example .env # Windows

# Edit .env and add your configuration (optional for local development)
# nano .env (macOS/Linux)
# notepad .env (Windows)
```

### Step 5: Verify Installation

```bash
# Test Python imports
python -c "import flask; import mediapipe; print('✅ All imports successful')"

# If successful, you'll see: ✅ All imports successful
```

---

## 🎮 Running the Application (Local Development)

### Option A: Single Server (Flask Only) - SIMPLEST

**Easiest way to get started quickly:**

```bash
# Navigate to home_page directory
cd home_page

# Start Flask server
python server.py
```

**Expected Output:**
```
✅ MediaPipe JSON loader imported successfully!
📊 Server Status:
  - MediaPipe JSON: ✅ Available
  - Running on http://127.0.0.1:5000
```

**Access the app:**
- Home page: `http://localhost:5000/`
- Speech-to-Text: `http://localhost:5000/speech_to_text/`
- Text-to-Speech: `http://localhost:5000/text_to_speech/`
- Translate & Speak: `http://localhost:5000/translate_and_speak/`
- Sign Language: `http://localhost:5000/text_to_sign_language/`

✅ **This is the recommended way for first-time setup**

---

### Option B: Split Frontend & Backend (ADVANCED)

For professional development with separate static and API servers:

#### Terminal 1 - Start Backend:
```bash
cd home_page
python server.py
# Runs on http://127.0.0.1:5000
```

#### Terminal 2 - Start Frontend:
```bash
cd frontend
python -m http.server 8000
# Runs on http://127.0.0.1:8000
```

**Access the app:**
- Home: `http://localhost:8000/`
- All features available at `http://localhost:8000/[feature]/`

---

## 📁 Directory Navigation

After cloning, your folder structure should look like:

```
VoiceotTextConverter/
├── home_page/
│   ├── server.py              ← RUN THIS (Flask server)
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── index.html
│   ├── speech_to_text/
│   ├── text_to_speech/
│   ├── translate_and_speak/
│   └── text_to_sign_language/
├── backend/
│   ├── asl_gloss/
│   └── pose_stream/
├── poses/
├── poses_mediapipe/
├── .env
├── requirements.txt
└── README.md
```

---

## ✅ Testing the Installation

### Test 1: Backend APIs are Running

```bash
# In a new terminal (keeping server running), test an API endpoint:

# Windows
curl http://127.0.0.1:5000/

# macOS/Linux
curl http://127.0.0.1:5000/
```

**Expected:** Should return HTML content of home page

### Test 2: Frontend is Loading

Open browser at: `http://localhost:5000/`
- Should see VOTEX home page with logo and navigation
- No console errors

### Test 3: Sign Language Feature

1. Go to: `http://localhost:5000/text_to_sign_language/`
2. Type "HELLO" in the text box
3. Click "Animate Sign"
4. Should see 3D avatar moving

---

## 🔧 Troubleshooting

### Issue: "Python not found" or "python is not recognized"

**Solution:**
- Ensure Python is installed: `python --version`
- Windows users: Add Python to PATH
  - Control Panel → System → Advanced system settings → Environment Variables
  - Add Python installation path to PATH

### Issue: "ModuleNotFoundError: No module named 'flask'"

**Solution:**
```bash
# Ensure virtual environment is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Find and kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

### Issue: "Cannot find 'frontend/index.html'"

**Solution:**
```bash
# Ensure the frontend folder structure exists
# If running Flask, it should serve from frontend/
# Try accessing: http://localhost:5000/speech_to_text/
```

### Issue: Slow performance or 3D avatar not rendering

**Solution:**
- Check GPU drivers are up to date
- Close other browser tabs
- Use Chrome/Firefox instead of Safari
- Increase RAM allocation if on VM

---

## 🌐 Network Configuration

### For Accessing from Other Machines on Network

Replace `127.0.0.1` with your machine's IP address:

```bash
# Find your IP address
# Windows: ipconfig | findstr IPv4
# macOS/Linux: ifconfig | grep inet

# Then access from other machine:
http://YOUR_IP:5000/
```

### Firewall Configuration

If others can't access:
1. Windows Firewall → Allow Python through firewall
2. macOS: System Preferences → Security & Privacy → Firewall Options
3. Linux: `sudo ufw allow 5000`

---

## 📦 Updating Installation

### Update Code from Repository

```bash
git pull origin main
```

### Update Python Packages

```bash
pip install -r requirements.txt --upgrade
```

---

## 🛑 Stopping the Application

- **In terminal:** Press `Ctrl+C`
- **Multiple terminals:** Do `Ctrl+C` in each terminal window

---

## 🎯 Next Steps

1. ✅ Installation complete
2. 📖 Read [ARCHITECTURE_AND_FLOW.md](./ARCHITECTURE_AND_FLOW.md) to understand system design
3. 📊 Review [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) for feature details
4. 🚀 See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment

---

## 💡 Quick Tips

- **Keep server running:** Don't close the terminal while developing
- **Check console errors:** Open browser DevTools (F12) to see errors
- **Restart after changes:** Sometimes changes require server restart
- **Use virtual environment:** Always activate venv to avoid conflicts
- **Test in incognito mode:** Clears cache for accurate testing

---

**Last Updated:** April 2026
**Version:** 1.0
**Support:** Refer to README.md for additional help
