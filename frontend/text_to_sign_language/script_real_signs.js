// REAL Sign Language Translator
// Uses actual sign language resources, not emojis

const CONFIG = {
  maxChars: 500,
  defaultSpeed: 2500, // Comfortable viewing speed (2.5 seconds per sign for video playback)
  
  signLanguages: {
    asl: { name: 'American Sign Language', code: 'us' },
    bsl: { name: 'British Sign Language', code: 'gb' },
    auslan: { name: 'Australian Sign Language', code: 'au' }
  },
  
  // Real sign language resources
  signDictionaries: {
    asl: 'https://www.handspeak.com/word/',
    bsl: 'https://www.signbsl.com/sign/',
    lifeprint: 'https://www.lifeprint.com/asl101/pages-signs/',
    spreadthesign: 'https://www.spreadthesign.com/en.us/search/'
  }
};

const state = {
  inputMode: 'type',
  isRecording: false,
  recognition: null,
  currentText: '',
  words: [],
  currentWordIndex: 0,
  isPlaying: false,
  speed: 1,
  loop: false,
  playbackInterval: null,
  selectedLanguage: 'asl',
  professionalMode: true,
  poseDictionaryPath: '',
  lastProfessionalError: ''
};

// DOM Elements
const elements = {
  typeModeBtn: document.getElementById('typeModeBtn'),
  speakModeBtn: document.getElementById('speakModeBtn'),
  typeInputArea: document.getElementById('typeInputArea'),
  speakInputArea: document.getElementById('speakInputArea'),
  textInput: document.getElementById('textInput'),
  charCount: document.getElementById('charCount'),
  clearTextBtn: document.getElementById('clearTextBtn'),
  micBtn: document.getElementById('micBtn'),
  micStatus: document.getElementById('micStatus'),
  transcriptDisplay: document.getElementById('transcriptDisplay'),
  signLanguageSelect: document.getElementById('signLanguageSelect'),
  professionalModeToggle: document.getElementById('professionalModeToggle'),
  poseDictionaryPath: document.getElementById('poseDictionaryPath'),
  selectedLangDisplay: document.getElementById('selectedLangDisplay'),
  translateBtn: document.getElementById('translateBtn'),
  signVideoArea: document.getElementById('signVideoArea'),
  videoControls: document.getElementById('videoControls'),
  currentWordDisplay: document.getElementById('currentWordDisplay'),
  progressBar: document.getElementById('progressBar'),
  currentTime: document.getElementById('currentTime'),
  totalTime: document.getElementById('totalTime'),
  restartBtn: document.getElementById('restartBtn'),
  prevBtn: document.getElementById('prevBtn'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  nextBtn: document.getElementById('nextBtn'),
  loopBtn: document.getElementById('loopBtn'),
  wordCountDisplay: document.getElementById('wordCountDisplay'),
  wordChips: document.getElementById('wordChips'),
  speedBtns: document.querySelectorAll('.speed-btn'),
  downloadBtn: document.getElementById('downloadBtn')
};

// ============================================
// Initialization
// ============================================
let signVisualizer = null;
let signAvatar = null;
let ikAvatar = null;

document.addEventListener('DOMContentLoaded', () => {
  signVisualizer = new SignLanguageVisualizer('signVideoArea');
  signAvatar = new SignAvatar('signVideoArea');
  if (window.VOTEXMediaPipeAvatar) {
    ikAvatar = window.VOTEXMediaPipeAvatar;
  }

  initializeProfessionalControls();
  initializeEventListeners();
  initializeSpeechRecognition();
});

function initializeProfessionalControls() {
  const savedMode = window.localStorage.getItem('votex.professionalMode');

  state.professionalMode = savedMode !== 'false';
  state.poseDictionaryPath = '';

  if (elements.professionalModeToggle) {
    elements.professionalModeToggle.checked = state.professionalMode;
  }

  if (elements.poseDictionaryPath) {
    elements.poseDictionaryPath.value = state.poseDictionaryPath;
  }

  window.localStorage.removeItem('votex.poseDictionaryPath');
}

function showWelcomeMessage() {
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    border: 2px solid #4f46e5;
    z-index: 10000;
    max-width: 600px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  `;
  message.innerHTML = `
    <strong>📚 Real Sign Language Dictionary</strong><br>
    <span style="font-size: 0.9em; color: #94a3b8;">
    This tool links to actual sign language resources like HandSpeak and Spread the Sign
    </span>
  `;
  document.body.appendChild(message);
  setTimeout(() => message.remove(), 5000);
}

function initializeEventListeners() {
  elements.typeModeBtn.addEventListener('click', () => switchInputMode('type'));
  elements.speakModeBtn.addEventListener('click', () => switchInputMode('speak'));
  elements.textInput.addEventListener('input', updateCharCount);
  elements.clearTextBtn.addEventListener('click', clearTextInput);
  elements.micBtn.addEventListener('click', toggleRecording);
  elements.signLanguageSelect.addEventListener('change', updateSelectedLanguage);
  elements.professionalModeToggle.addEventListener('change', updateProfessionalMode);
  elements.poseDictionaryPath.addEventListener('input', updatePoseDictionaryPath);
  elements.translateBtn.addEventListener('click', translateToSigns);
  elements.restartBtn.addEventListener('click', restart);
  elements.prevBtn.addEventListener('click', previousWord);
  elements.playPauseBtn.addEventListener('click', togglePlayPause);
  elements.nextBtn.addEventListener('click', nextWord);
  elements.loopBtn.addEventListener('click', toggleLoop);
  elements.speedBtns.forEach(btn => {
    btn.addEventListener('click', () => changeSpeed(parseFloat(btn.dataset.speed)));
  });
  elements.downloadBtn.addEventListener('click', downloadSigns);
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ============================================
// Input Mode Management
// ============================================
function switchInputMode(mode) {
  state.inputMode = mode;
  if (mode === 'type') {
    elements.typeModeBtn.classList.add('active');
    elements.speakModeBtn.classList.remove('active');
    elements.typeInputArea.style.display = 'block';
    elements.speakInputArea.style.display = 'none';
  } else {
    elements.typeModeBtn.classList.remove('active');
    elements.speakModeBtn.classList.add('active');
    elements.typeInputArea.style.display = 'none';
    elements.speakInputArea.style.display = 'block';
  }
}

function updateCharCount() {
  const count = elements.textInput.value.length;
  elements.charCount.textContent = count;
  state.currentText = elements.textInput.value;
}

function clearTextInput() {
  elements.textInput.value = '';
  updateCharCount();
  resetSignOutput();
}

// ============================================
// Speech Recognition
// ============================================
function initializeSpeechRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    state.recognition = new SpeechRecognition();
    state.recognition.continuous = true;
    state.recognition.interimResults = true;
    state.recognition.lang = 'en-US';
    
    state.recognition.onstart = () => {
      state.isRecording = true;
      elements.micBtn.classList.add('recording');
      elements.micStatus.textContent = '🔴 Recording... Click to stop';
      elements.micStatus.classList.add('recording');
    };
    
    state.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      state.currentText = finalTranscript + interimTranscript;
      elements.transcriptDisplay.textContent = state.currentText;
      elements.transcriptDisplay.classList.add('has-content');
    };
    
    state.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      stopRecording();
      showNotification('Microphone error: ' + event.error, 'error');
    };
    
    state.recognition.onend = () => {
      if (state.isRecording) {
        state.recognition.start();
      }
    };
  } else {
    console.warn('Speech recognition not supported');
    elements.micBtn.disabled = true;
    elements.micStatus.textContent = 'Speech recognition not supported in this browser';
  }
}

function toggleRecording() {
  if (state.isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  if (!state.recognition) {
    showNotification('Speech recognition not available', 'error');
    return;
  }
  
  elements.transcriptDisplay.textContent = '';
  state.currentText = '';
  
  try {
    state.recognition.start();
  } catch (error) {
    console.error('Error starting recognition:', error);
  }
}

function stopRecording() {
  if (state.recognition && state.isRecording) {
    state.isRecording = false;
    state.recognition.stop();
    elements.micBtn.classList.remove('recording');
    elements.micStatus.textContent = 'Click to start recording';
    elements.micStatus.classList.remove('recording');
  }
}

// ============================================
// Language Selection
// ============================================
function updateSelectedLanguage() {
  state.selectedLanguage = elements.signLanguageSelect.value;
  const langInfo = CONFIG.signLanguages[state.selectedLanguage];
  elements.selectedLangDisplay.textContent = langInfo ? langInfo.name : 'Sign Language';
}

function updateProfessionalMode() {
  state.professionalMode = !!elements.professionalModeToggle.checked;
  window.localStorage.setItem('votex.professionalMode', String(state.professionalMode));
}

function updatePoseDictionaryPath() {
  state.poseDictionaryPath = (elements.poseDictionaryPath.value || '').trim();
  window.localStorage.setItem('votex.poseDictionaryPath', state.poseDictionaryPath);
}

// ============================================
// Translation to Signs
// ============================================
async function translateToSigns() {
  const text = getCurrentSourceText();
  
  if (!text) {
    resetSignOutput();
    showNotification('Please enter or speak some text first', 'warning');
    return;
  }
  
  state.currentText = text;
  state.words = await getSignTokens(text);
  
  if (state.words.length === 0) {
    showNotification('No valid words to translate', 'warning');
    return;
  }
  
  state.currentWordIndex = 0;
  state.isPlaying = false;
  
  // Hide video controls - using avatar animation
  elements.videoControls.style.display = 'none';
  elements.downloadBtn.style.display = 'none';
  
  // Hide word chips and current word display
  const wordChipsContainer = document.querySelector('.word-chips-container');
  const currentWordBox = document.querySelector('.current-word-box');
  if (wordChipsContainer) wordChipsContainer.style.display = 'none';
  if (currentWordBox) currentWordBox.style.display = 'none';
  
  const usedProfessionalStream = await tryProfessionalPoseStream(text, state.words);

  if (!usedProfessionalStream && (!state.professionalMode || state.selectedLanguage !== 'asl') && signAvatar) {
    signAvatar.clear();
    signAvatar.displaySentence(state.words, { loop: true });
  }

  if (!usedProfessionalStream && state.professionalMode && state.selectedLanguage === 'asl') {
    resetSignOutput();
    showNotification(state.lastProfessionalError || 'Professional motion backend is unavailable', 'error');
    return;
  }

  const signUnitCount = countSignUnits(state.words);
  showNotification(
    `${usedProfessionalStream ? 'Playing professional pose stream' : 'Showing'} ${signUnitCount} sign sequence${signUnitCount === 1 ? '' : 's'} in sign language`,
    'success'
  );
}

async function tryProfessionalPoseStream(text, glossTokens) {
  state.lastProfessionalError = '';

  if (!ikAvatar || !state.professionalMode || state.selectedLanguage !== 'asl' || !Array.isArray(glossTokens) || glossTokens.length === 0) {
    return false;
  }

  const poseFormatPayload = await requestPoseStream(text, glossTokens, 'pose-format');
  if (poseFormatPayload) {
    mountAndPlayPoseStream(poseFormatPayload);
    return true;
  }

  const fluentPayload = await requestPoseStream(text, glossTokens, 'fluent');
  if (fluentPayload) {
    mountAndPlayPoseStream(fluentPayload);
    return true;
  }

  const lerpPayload = await requestPoseStream(text, glossTokens, 'lerp');
  if (lerpPayload) {
    mountAndPlayPoseStream(lerpPayload);
    return true;
  }

  return false;
}

const BACKEND_BASE_URL = (() => {
  const configuredBase = window.VOTEX_BACKEND_URL || document.body?.dataset?.backendUrl;
  if (configuredBase) {
    return configuredBase.replace(/\/$/, '');
  }

  const isLocalStaticFrontend = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && window.location.port
    && window.location.port !== '5000';

  return isLocalStaticFrontend ? 'http://127.0.0.1:5000' : window.location.origin;
})();

const buildBackendUrl = (path) => `${BACKEND_BASE_URL}${path}`;

async function requestPoseStream(text, glossTokens, smoothingEngine) {
  const buildRequestBody = (includeDictionaryPath) => ({
    text,
    glosses: glossTokens,
    dictionary_path: includeDictionaryPath && state.poseDictionaryPath ? state.poseDictionaryPath : undefined,
    fps: 60,
    transition_frames: smoothingEngine === 'fluent' ? 10 : smoothingEngine === 'pose-format' ? 8 : 6,
    smoothing_engine: smoothingEngine
  });

  try {
    let response = await fetch(buildBackendUrl('/api/asl/pose-stream'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buildRequestBody(true))
    });

    if (!response.ok && state.poseDictionaryPath) {
      response = await fetch(buildBackendUrl('/api/asl/pose-stream'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(buildRequestBody(false))
      });
    }

    if (!response.ok) {
      let errorMessage = `Professional motion request failed with status ${response.status}`;
      try {
        const errorPayload = await response.json();
        if (errorPayload && errorPayload.error) {
          errorMessage = errorPayload.error;
        }
      } catch (parseError) {
        console.error('Failed to parse pose-stream error payload:', parseError);
      }
      state.lastProfessionalError = errorMessage;
      return null;
    }

    const payload = await response.json();
    if (!Array.isArray(payload.pose_stream) || payload.pose_stream.length === 0) {
      state.lastProfessionalError = 'Backend returned an empty motion stream';
      return null;
    }

    state.lastProfessionalError = '';
    return payload;
  } catch (error) {
    state.lastProfessionalError = `Pose stream request failed for ${smoothingEngine}`;
    console.error(`Pose stream request failed for ${smoothingEngine}:`, error);
    return null;
  }
}

function mountAndPlayPoseStream(payload) {
  if (!ikAvatar) {
    return;
  }

  if (signAvatar) {
    signAvatar.clear();
  }

  ikAvatar.mount('signVideoArea', { targetFps: payload.fps || 60 });
  ikAvatar.setStream(payload.pose_stream, payload.fps || 60);
}

async function getSignTokens(text) {
  if (state.selectedLanguage !== 'asl') {
    return normalizeTextForSigns(text);
  }

  try {
    const response = await fetch(buildBackendUrl('/api/asl/gloss'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`Gloss API failed with status ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload.gloss_tokens)) {
      throw new Error('Gloss API returned an invalid payload');
    }

    return payload.gloss_tokens.map((token) => token.toLowerCase());
  } catch (error) {
    console.error('Falling back to frontend normalization:', error);
    showNotification('ASL backend unavailable, using frontend fallback', 'info');
    return normalizeTextForSigns(text);
  }
}

function getCurrentSourceText() {
  if (state.inputMode === 'speak') {
    return (elements.transcriptDisplay.textContent || state.currentText || '').trim();
  }

  return (elements.textInput.value || state.currentText || '').trim();
}

function resetSignOutput() {
  state.words = [];
  state.currentWordIndex = 0;
  state.isPlaying = false;
  stopPlayback();

  if (ikAvatar) {
    ikAvatar.clear();
  }

  if (signAvatar) {
    signAvatar.clear();
  }

  elements.videoControls.style.display = 'none';
  elements.downloadBtn.style.display = 'none';
  elements.signVideoArea.innerHTML = `
    <div class="video-placeholder">
      <div class="placeholder-content">
        <div class="placeholder-icon">🤟</div>
        <h3>Start Translating</h3>
        <p>Type or speak text to see sign language demonstrations</p>
      </div>
    </div>
  `;
}

function normalizeTextForSigns(text) {
  const normalizedText = text
    .toLowerCase()
    .replace(/waht/g, 'what')
    .replace(/what's/g, 'what is')
    .replace(/what s/g, 'what is')
    .replace(/who's/g, 'who is')
    .replace(/where's/g, 'where is')
    .replace(/how's/g, 'how is')
    .replace(/i'm/g, 'i am')
    .replace(/you're/g, 'you are')
    .replace(/they're/g, 'they are')
    .replace(/we're/g, 'we are')
    .replace(/can't/g, 'can not')
    .replace(/don't/g, 'do not')
    .replace(/doesn't/g, 'does not')
    .replace(/didn't/g, 'did not')
    .replace(/[^\w\s'-]/g, ' ')
    .replace(/\b(s)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const rawTokens = normalizedText.split(' ').filter(Boolean);

  return rawTokens.map((token, index) => {
    if (token === 'doing') {
      return 'doing';
    }

    if (token === 'your') {
      return 'your';
    }

    if (token === 'name') {
      return 'name';
    }

    if (token === 'is' && rawTokens[index - 1] === 'what') {
      return 'is';
    }

    return token;
  });
}

function countSignUnits(words) {
  const phrases = [
    ['what', 'are', 'you', 'doing'],
    ['what', 'is', 'your', 'name'],
    ['what', 'your', 'name'],
    ['my', 'name', 'is'],
    ['my', 'name'],
    ['how', 'are', 'you']
  ];

  let count = 0;
  let index = 0;

  while (index < words.length) {
    const match = phrases.find((phrase) => phrase.every((part, offset) => words[index + offset] === part));

    if (match) {
      count += 1;
      index += match.length;
      continue;
    }

    count += 1;
    index += 1;
  }

  return count;
}

// ============================================
// Video Display - Using Sign Language Visualizer
// ============================================
function displayWord(index) {
  if (index < 0 || index >= state.words.length) return;
  
  state.currentWordIndex = index;
  const word = state.words[index];
  
  if (signAvatar) {
    signAvatar.showWord(word);
  } else if (signVisualizer) {
    signVisualizer.displayWord(word, state.selectedLanguage);
  }
  
  // Update controls
  elements.currentWordDisplay.textContent = word.toUpperCase();
  updateProgress();
  updateCurrentTime();
  updateWordChips();
}

// ============================================
// Playback Controls
// ============================================
function togglePlayPause() {
  if (state.isPlaying) {
    pause();
  } else {
    play();
  }
}

function play() {
  if (state.words.length === 0) return;
  
  state.isPlaying = true;
  elements.playPauseBtn.classList.add('playing');
  
  // Continuous flow - no extra delays
  const intervalTime = CONFIG.defaultSpeed / state.speed;
  
  state.playbackInterval = setInterval(() => {
    if (state.currentWordIndex < state.words.length - 1) {
      nextWord();
    } else {
      if (state.loop) {
        restart();
      } else {
        pause();
        showNotification('Sign language demonstration complete', 'success');
      }
    }
  }, intervalTime);
}

function pause() {
  state.isPlaying = false;
  elements.playPauseBtn.classList.remove('playing');
  stopPlayback();
}

function stopPlayback() {
  if (state.playbackInterval) {
    clearInterval(state.playbackInterval);
    state.playbackInterval = null;
  }
}

function restart() {
  stopPlayback();
  displayWord(0);
  if (state.isPlaying) {
    play();
  }
}

function previousWord() {
  if (state.currentWordIndex > 0) {
    displayWord(state.currentWordIndex - 1);
  }
}

function nextWord() {
  if (state.currentWordIndex < state.words.length - 1) {
    displayWord(state.currentWordIndex + 1);
  }
}

function toggleLoop() {
  state.loop = !state.loop;
  elements.loopBtn.style.opacity = state.loop ? '1' : '0.5';
  elements.loopBtn.style.background = state.loop ? 'var(--primary)' : 'var(--bg)';
  showNotification(state.loop ? 'Loop enabled' : 'Loop disabled', 'info');
}

function changeSpeed(speed) {
  state.speed = speed;
  elements.speedBtns.forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
  });
  updateTotalTime();
  updateCurrentTime();
  if (state.isPlaying) {
    pause();
    play();
  }
  showNotification(`Speed: ${speed}x`, 'info');
}

function updateWordChips() {
  elements.wordChips.innerHTML = '';
  state.words.forEach((word, index) => {
    const chip = document.createElement('div');
    chip.className = 'word-chip';
    chip.textContent = word;
    if (index === state.currentWordIndex) chip.classList.add('active');
    else if (index < state.currentWordIndex) chip.classList.add('completed');
    chip.addEventListener('click', () => {
      stopPlayback();
      displayWord(index);
    });
    elements.wordChips.appendChild(chip);
  });
}

function updateWordCount() {
  elements.wordCountDisplay.textContent = state.words.length;
}

function updateProgress() {
  const progress = state.words.length > 0 ? ((state.currentWordIndex + 1) / state.words.length) * 100 : 0;
  elements.progressBar.style.width = progress + '%';
}

function updateCurrentTime() {
  const currentSeconds = state.currentWordIndex * (CONFIG.defaultSpeed / 1000 / state.speed);
  elements.currentTime.textContent = formatTime(currentSeconds);
}

function updateTotalTime() {
  const totalSeconds = state.words.length * (CONFIG.defaultSpeed / 1000 / state.speed);
  elements.totalTime.textContent = formatTime(totalSeconds);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function downloadSigns() {
  const content = `Sign Language Reference\nLanguage: ${CONFIG.signLanguages[state.selectedLanguage].name}\n\nWords:\n${state.words.map((word, i) => `${i + 1}. ${word.toUpperCase()}`).join('\n')}\n\nOriginal Text:\n${state.currentText}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sign-language-reference-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification('Reference downloaded', 'success');
}

function handleKeyboardShortcuts(e) {
  if (state.words.length === 0) return;
  switch(e.key) {
    case ' ':
      if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlayPause();
      }
      break;
    case 'ArrowLeft': e.preventDefault(); previousWord(); break;
    case 'ArrowRight': e.preventDefault(); nextWord(); break;
    case 'Home': e.preventDefault(); restart(); break;
  }
}

function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 30px; right: 30px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#4f46e5'};
    color: white; padding: 16px 24px; border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.3); z-index: 10000; font-weight: 500;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
