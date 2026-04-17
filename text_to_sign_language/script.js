// REAL Sign Language Translator
// Uses the backend ASL API plus Three.js avatar rendering.

const CONFIG = {
  maxChars: 500,
  defaultSpeed: 2500,

  signLanguages: {
    asl: { name: 'American Sign Language', code: 'us' },
    bsl: { name: 'British Sign Language', code: 'gb' },
    auslan: { name: 'Australian Sign Language', code: 'au' }
  },

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
  lastProfessionalError: '',
  lastProfessionalNotice: ''
};

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

let signVisualizer = null;
let signAvatar = null;
let ikAvatar = null;
let avatarSystemActive = true; // Force the 3D avatar system to be active
const loadedScriptUrls = new Set();

console.log('===== SCRIPT.JS LOADED =====');
console.log('Initial avatarSystemActive:', avatarSystemActive);

// Handshake sync function
function syncAvatar() {
  console.log('[syncAvatar] Checking window.VotexAvatarIsActuallyReady:', window.VotexAvatarIsActuallyReady);
  if (window.VotexAvatarIsActuallyReady === true) {
    avatarSystemActive = true;
    console.log('Main Script: Avatar Synced via Flag Check');
  } else {
    console.log('[syncAvatar] Flag not set yet');
  }
}

// Listen for avatar ready event
console.log('Adding VotexAvatarReady event listener...');
window.addEventListener('VotexAvatarReady', () => {
  avatarSystemActive = true;
  console.log('Main Script: 3D Handshake Complete');
  //alert('3D Handshake Complete!');
});

// Immediate sync check on load
console.log('Calling syncAvatar() immediately...');
syncAvatar();

document.addEventListener('DOMContentLoaded', async () => {
  console.log('===== DOMContentLoaded FIRED =====');
  console.log('avatarSystemActive at DOMContentLoaded:', avatarSystemActive);
  
  signVisualizer = new SignLanguageVisualizer('signVideoArea');
  signAvatar = new SignAvatar('signVideoArea');
  
  console.log('[Init] Starting professional renderer initialization...');
  
  // Sync avatar immediately
  console.log('[Init] Calling syncAvatar()...');
  syncAvatar();
  console.log('[Init] After syncAvatar, avatarSystemActive:', avatarSystemActive);
  
  await ensureProfessionalRendererReady();
  
  if (window.VOTEXMediaPipeAvatar) {
    ikAvatar = window.VOTEXMediaPipeAvatar;
    console.log('[Init] SUCCESS - 3D Avatar is ready!');
  } else {
    console.error('[Init] FAILED - 3D Avatar not available');
  }

  initializeProfessionalControls();
  initializeEventListeners();
  initializeSpeechRecognition();
  
  console.log('[Init] Complete! Final avatarSystemActive:', avatarSystemActive);
});

function loadScript(src) {
  if (!src) {
    return Promise.reject(new Error('Missing script source'));
  }

  if (loadedScriptUrls.has(src)) {
    return Promise.resolve();
  }

  const existing = Array.from(document.scripts).find((script) => script.src === src);
  if (existing) {
    loadedScriptUrls.add(src);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => {
      loadedScriptUrls.add(src);
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureProfessionalRendererReady() {
  console.log('[Renderer] Checking for 3D avatar...');
  
  // Scripts are already in the HTML - just wait for them to initialize
  if (window.VOTEXMediaPipeAvatar) {
    console.log('[Renderer] SUCCESS - VOTEXMediaPipeAvatar ready!');
    return true;
  }

  // Wait up to 3 seconds for the avatar to initialize
  for (let i = 0; i < 60; i++) {
    await new Promise(resolve => setTimeout(resolve, 50));
    if (window.VOTEXMediaPipeAvatar) {
      console.log(`[Renderer] SUCCESS - VOTEXMediaPipeAvatar ready after ${i * 50}ms wait`);
      return true;
    }
  }

  // Last resort - check if THREE is available
  if (!window.THREE) {
    state.lastProfessionalError = 'Three.js failed to load - check browser console';
    console.error('[Renderer] FAILED - THREE.js not available');
    return false;
  }

  if (!window.ThreeIKAvatar) {
    state.lastProfessionalError = 'ThreeIKAvatar class not found - check browser console';
    console.error('[Renderer] FAILED - ThreeIKAvatar not available');
    return false;
  }

  state.lastProfessionalError = '3D avatar failed to initialize - check browser console for errors';
  console.error('[Renderer] FAILED - VOTEXMediaPipeAvatar not available after 3 seconds');
  console.error('[Renderer] THREE exists:', !!window.THREE);
  console.error('[Renderer] ThreeIKAvatar exists:', !!window.ThreeIKAvatar);
  return false;
}

function initializeProfessionalControls() {
  // Force Professional Mode to ON
  state.professionalMode = true;
  state.poseDictionaryPath = '';

  if (elements.professionalModeToggle) {
    elements.professionalModeToggle.checked = true;
  }

  if (elements.poseDictionaryPath) {
    elements.poseDictionaryPath.value = state.poseDictionaryPath;
  }

  window.localStorage.removeItem('votex.poseDictionaryPath');
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
  elements.speedBtns.forEach((btn) => {
    btn.addEventListener('click', () => changeSpeed(parseFloat(btn.dataset.speed)));
  });
  elements.downloadBtn.addEventListener('click', downloadSigns);
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

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
      elements.micStatus.textContent = 'Recording... Click to stop';
      elements.micStatus.classList.add('recording');
    };

    state.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;
        if (event.results[index].isFinal) {
          finalTranscript += `${transcript} `;
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
      showNotification(`Microphone error: ${event.error}`, 'error');
    };

    state.recognition.onend = () => {
      if (state.isRecording) {
        state.recognition.start();
      }
    };
  } else {
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
}

async function translateToSigns() {
  // CLEAR EXISTING AVATAR/ANIMATION FIRST
  console.log('[Translate] Clearing existing avatar before starting new translation...');
  
  // Stop any existing playback
  if (window.VOTEXMediaPipeAvatar && window.VOTEXMediaPipeAvatar.instance) {
    console.log('[Translate] Stopping existing playback...');
    if (window.VOTEXMediaPipeAvatar.instance.stream) {
      window.VOTEXMediaPipeAvatar.instance.stream = [];
      window.VOTEXMediaPipeAvatar.instance.streamIndex = 0;
      window.VOTEXMediaPipeAvatar.instance.isPlayingStream = false;
    }
  }
  
  // Clear the sign video area
  const signVideoArea = document.getElementById('signVideoArea');
  if (signVideoArea) {
    console.log('[Translate] Clearing signVideoArea...');
    signVideoArea.innerHTML = '';
  }
  
  const text = getCurrentSourceText();
  if (!text) {
    resetSignOutput();
    showNotification('Please enter or speak some text first', 'warning');
    return;
  }
  
  // Wait for avatar system if not ready
  if (!avatarSystemActive && state.professionalMode && state.selectedLanguage === 'asl') {
    showNotification('Loading Avatar System - Please wait...', 'info');
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!avatarSystemActive) {
      showNotification('Avatar still loading - using fallback display', 'warning');
    }
  }

  state.currentText = text;
  state.words = await getSignTokens(text);
  if (state.words.length === 0) {
    showNotification('No valid words to translate', 'warning');
    return;
  }

  state.currentWordIndex = 0;
  state.isPlaying = false;
  elements.videoControls.style.display = 'none';
  elements.downloadBtn.style.display = 'none';

  const wordChipsContainer = document.querySelector('.word-chips-container');
  const currentWordBox = document.querySelector('.current-word-box');
  if (wordChipsContainer) wordChipsContainer.style.display = 'none';
  if (currentWordBox) currentWordBox.style.display = 'none';

  const usedProfessionalStream = await tryProfessionalPoseStream(text, state.words);
  if (!usedProfessionalStream) {
    signVisualizer.displayWordSequence(state.words, state.selectedLanguage);
  }

  const signUnitCount = countSignUnits(state.words);
  if (usedProfessionalStream) {
    showNotification(
      `Playing professional pose stream for ${signUnitCount} ${signUnitCount === 1 ? 'sign' : 'signs'}`,
      'success'
    );
    return;
  }

  if (state.lastProfessionalNotice) {
    showNotification(state.lastProfessionalNotice, 'info');
    return;
  }

  if (state.lastProfessionalError && state.professionalMode && state.selectedLanguage === 'asl') {
    showNotification(state.lastProfessionalError, 'warning');
    return;
  }

  showNotification(
    `Showing ${signUnitCount} ${signUnitCount === 1 ? 'sign' : 'signs'} in the standard sign display`,
    'success'
  );
}

async function tryProfessionalPoseStream(text, glossTokens) {
  console.log('====== tryProfessionalPoseStream CALLED ======');
  console.log('avatarSystemActive:', avatarSystemActive);
  console.log('VotexAvatarIsActuallyReady:', window.VotexAvatarIsActuallyReady);
  console.log('professionalMode:', state.professionalMode);
  console.log('selectedLanguage:', state.selectedLanguage);
  console.log('glossTokens:', glossTokens);
  
  state.lastProfessionalError = '';
  state.lastProfessionalNotice = '';
  
  // Check avatar system is active - with retry
  if (!avatarSystemActive) {
    console.log('[tryProfessionalPoseStream] Avatar not active, waiting 500ms...');
    await new Promise(r => setTimeout(r, 500));
    syncAvatar(); // Try to sync again
    
    if (!avatarSystemActive) {
      state.lastProfessionalError = 'Avatar system not initialized';
      console.error('Avatar system not initialized');
      return false;
    }
    console.log('Avatar NOW active after wait');
  }
  
  if (!state.professionalMode || state.selectedLanguage !== 'asl' || !Array.isArray(glossTokens) || glossTokens.length === 0) {
    console.log('[tryProfessionalPoseStream] Mode or language check failed - using emoji fallback');
    return false;
  }

  const rendererReady = await ensureProfessionalRendererReady();
  console.log('rendererReady:', rendererReady, 'ikAvatar:', ikAvatar);
  if (!rendererReady || !ikAvatar) {
    state.lastProfessionalError = '3D Avatar renderer not initialized';
    console.error('3D Avatar renderer not initialized');
    return false;
  }
  
  console.log('All checks PASSED - sending API request...');

  // Direct fetch to backend
  try {
    console.log('[API] Sending request to pose-stream with words:', state.words);
    
    // Leave dictionary_path empty to use server default (which is now 'poses' folder)
    const dictionaryPath = state.poseDictionaryPath.trim() || '';  // Empty means use server default
    
    // Use relative URL if accessed through server, absolute if file://
    const apiUrl = window.location.protocol === 'file:' 
      ? 'http://localhost:5000/api/asl/pose-stream'
      : '/api/asl/pose-stream';
    
    const requestBody = { 
      glosses: state.words,
      text: text,
      fps: 10,
      transition_frames: 4,
      smoothing_engine: 'mediapipe-json'  // Use native MediaPipe format (no conversion!)
    };
    
    // Only add dictionary_path if user specified one
    if (dictionaryPath) {
      requestBody.dictionary_path = dictionaryPath;
    }
    
    console.log('[API] Request body:', requestBody);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    console.log('[API] Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] Error response:', errorData);
      state.lastProfessionalError = errorData.error || `Server error: ${response.status}`;
      return false;
    }
    
    const payload = await response.json();
    console.log('[API] Success! Payload:', payload);
    return await mountAndPlayPoseStream(payload);
    
  } catch (error) {
    console.error('[API] Fetch failed:', error);
    state.lastProfessionalError = `API Error: ${error.message}`;
    return false;
  }
}

async function mountAndPlayPoseStream(payload) {
  console.log('[Mount] Starting mountAndPlayPoseStream...');
  console.log('[Mount] Payload:', payload);

  // Check for avatar
  if (!window.VOTEXMediaPipeAvatar) {
    console.error('CRITICAL: Avatar object is MISSING from window!');
    state.lastProfessionalError = 'Avatar not initialized';
    return false;
  }

  // Get the pose stream data - backend returns it in gloss_data format now
  const glossKeys = Object.keys(payload.gloss_data || {});
  if (glossKeys.length === 0) {
    console.error('[Mount] No gloss data in payload');
    return false;
  }
  
  const frames = payload.gloss_data[glossKeys[0]];
  
  if (!Array.isArray(frames) || frames.length === 0) {
    console.error('[Mount] No frames found in gloss data');
    return false;
  }

  console.log(`[Mount] Playing ${frames.length} frames at ${payload.fps || 60} fps`);

  // CRITICAL: Clear the sign video area and mount the 3D avatar if not already mounted
  const signVideoArea = document.getElementById('signVideoArea');
  if (!signVideoArea) {
    console.error('[Mount] signVideoArea container not found!');
    return false;
  }

  console.log('[Mount] signVideoArea found:', signVideoArea);
  console.log('[Mount] signVideoArea current content:', signVideoArea.innerHTML.substring(0, 100));
  console.log('[Mount] signVideoArea computed style display:', window.getComputedStyle(signVideoArea).display);
  console.log('[Mount] signVideoArea computed style visibility:', window.getComputedStyle(signVideoArea).visibility);
  console.log('[Mount] signVideoArea offsetWidth x offsetHeight:', signVideoArea.offsetWidth, 'x', signVideoArea.offsetHeight);

  // ALWAYS stop any existing playback before starting new sign
  if (window.VOTEXMediaPipeAvatar && window.VOTEXMediaPipeAvatar.instance) {
    console.log('[Mount] Stopping any existing playback...');
    if (window.VOTEXMediaPipeAvatar.instance.stream) {
      window.VOTEXMediaPipeAvatar.instance.stream = [];
      window.VOTEXMediaPipeAvatar.instance.streamIndex = 0;
      window.VOTEXMediaPipeAvatar.instance.isPlayingStream = false;
    }
  }

  // Mount the avatar if not already mounted, or if the container was cleared
  if (!window.VOTEXMediaPipeAvatar.instance || !signVideoArea.querySelector('.three-ik-avatar-shell')) {
    console.log('[Mount] Mounting 3D avatar to signVideoArea...');
    signVideoArea.innerHTML = ''; // Clear any existing content
    console.log('[Mount] Cleared signVideoArea, now mounting avatar...');
    
    const avatar = window.VOTEXMediaPipeAvatar.mount('signVideoArea', {
      targetFps: 10,
      avatarScale: 2.9,
      positionLerp: 0.45,
      fingerLerp: 0.72
    });
    
    console.log('[Mount] Avatar mounted, instance:', avatar);
    console.log('[Mount] signVideoArea after mount:', signVideoArea.innerHTML.substring(0, 200));
    
    // Give it a moment to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
  } else {
    console.log('[Mount] Avatar already mounted, reusing existing instance');
  }

  // Use setStream for smooth playback
  if (window.VOTEXMediaPipeAvatar && window.VOTEXMediaPipeAvatar.setStream) {
    console.log('[Mount] Using setStream for playback');
    console.log('[Mount] Calling setStream with', frames.length, 'frames at', payload.fps || 10, 'fps');
    console.log('[Mount] First frame sample:', frames[0]);
    window.VOTEXMediaPipeAvatar.setStream(frames, payload.fps || 10);
    console.log('[Mount] setStream called successfully');
  } else if (window.VOTEXMediaPipeAvatar && window.VOTEXMediaPipeAvatar.setFrame) {
    // Fallback to individual frames
    console.log('[Mount] Using setFrame for playback');
    const frameDelay = 1000 / (payload.fps || 10);
    frames.forEach((frame, i) => {
      setTimeout(() => {
        if (frame.poseLandmarks) {
          window.VOTEXMediaPipeAvatar.setFrame(frame);
        }
      }, i * frameDelay);
    });
  } else {
    console.error('[Mount] No valid playback method found on VOTEXMediaPipeAvatar');
    return false;
  }

  console.log(`[Mount] Successfully started playback of ${frames.length} frames`);
  return true;
}

async function getSignTokens(text) {
  if (state.selectedLanguage !== 'asl') {
    return normalizeTextForSigns(text);
  }

  try {
    const response = await fetch('/api/asl/gloss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  return normalizedText.split(' ').filter(Boolean);
}

function countSignUnits(words) {
  return words.length;
}

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
  const intervalTime = CONFIG.defaultSpeed / state.speed;
  state.playbackInterval = setInterval(() => {
    if (state.currentWordIndex < state.words.length - 1) {
      nextWord();
    } else if (state.loop) {
      restart();
    } else {
      pause();
      showNotification('Sign language demonstration complete', 'success');
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
  if (state.isPlaying) play();
}

function previousWord() {
  if (state.currentWordIndex > 0) displayWord(state.currentWordIndex - 1);
}

function nextWord() {
  if (state.currentWordIndex < state.words.length - 1) displayWord(state.currentWordIndex + 1);
}

function toggleLoop() {
  state.loop = !state.loop;
  elements.loopBtn.style.opacity = state.loop ? '1' : '0.5';
  elements.loopBtn.style.background = state.loop ? 'var(--primary)' : 'var(--bg)';
  showNotification(state.loop ? 'Loop enabled' : 'Loop disabled', 'info');
}

function changeSpeed(speed) {
  state.speed = speed;
  elements.speedBtns.forEach((btn) => {
    btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
  });
  if (state.isPlaying) {
    pause();
    play();
  }
  showNotification(`Speed: ${speed}x`, 'info');
}

function displayWord(index) {
  if (index < 0 || index >= state.words.length) return;
  state.currentWordIndex = index;
}

function downloadSigns() {
  const content = `Sign Language Reference\nLanguage: ${CONFIG.signLanguages[state.selectedLanguage].name}\n\nWords:\n${state.words.map((word, index) => `${index + 1}. ${word.toUpperCase()}`).join('\n')}\n\nOriginal Text:\n${state.currentText}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sign-language-reference-${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  showNotification('Reference downloaded', 'success');
}

function handleKeyboardShortcuts(event) {
  if (state.words.length === 0) return;
  switch (event.key) {
    case ' ':
      if (event.target.tagName !== 'TEXTAREA' && event.target.tagName !== 'INPUT') {
        event.preventDefault();
        togglePlayPause();
      }
      break;
    case 'ArrowLeft':
      event.preventDefault();
      previousWord();
      break;
    case 'ArrowRight':
      event.preventDefault();
      nextWord();
      break;
    case 'Home':
      event.preventDefault();
      restart();
      break;
    default:
      break;
  }
}

function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#4f46e5'};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    z-index: 10000;
    font-weight: 500;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
