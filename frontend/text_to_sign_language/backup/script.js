/**
 * Text/Speech to Sign Language Module
 * Modular system for converting text and speech to sign language representations
 */

// ===== Configuration =====
const CONFIG = {
  maxTextLength: 200,
  defaultSpeed: 1500, // milliseconds per sign
  defaultSignLanguage: 'asl'
};

// ===== Sign Language Data =====
// Hand sign emojis for fingerspelling (visual representation)
const SIGN_ALPHABET = {
  'a': '👊', 'b': '✋', 'c': '👌', 'd': '☝️', 'e': '✊',
  'f': '🤌', 'g': '👈', 'h': '✌️', 'i': '🤙', 'j': '🤙',
  'k': '✌️', 'l': '👆', 'm': '✊', 'n': '✊', 'o': '👌',
  'p': '☝️', 'q': '👇', 'r': '✌️', 's': '✊', 't': '👊',
  'u': '✌️', 'v': '✌️', 'w': '🤟', 'x': '☝️', 'y': '🤙',
  'z': '☝️', ' ': '✋', '!': '👏', '?': '🤔', '.': '👌',
  ',': '🤏', '-': '👉', '0': '👌', '1': '☝️', '2': '✌️',
  '3': '🤟', '4': '🖖', '5': '✋', '6': '🤙', '7': '🤘',
  '8': '👐', '9': '👊'
};

// Sign language names
const SIGN_LANGUAGES = {
  'asl': 'American Sign Language (ASL)',
  'bsl': 'British Sign Language (BSL)',
  'auslan': 'Australian Sign Language (Auslan)',
  'isl': 'Indian Sign Language (ISL)',
  'jsl': 'Japanese Sign Language (JSL)',
  'fsl': 'French Sign Language (LSF)',
  'gsl': 'German Sign Language (DGS)',
  'csl': 'Chinese Sign Language (CSL)',
  'rsl': 'Russian Sign Language (RSL)',
  'libras': 'Brazilian Sign Language (Libras)'
};

// ===== DOM Elements =====
const elements = {
  // Selectors
  signLanguageSelect: document.getElementById('signLanguageSelect'),
  
  // Mode buttons
  textModeBtn: document.getElementById('textModeBtn'),
  speechModeBtn: document.getElementById('speechModeBtn'),
  
  // Text input
  textInput: document.getElementById('textInput'),
  charCount: document.getElementById('charCount'),
  clearTextBtn: document.getElementById('clearTextBtn'),
  textInputSection: document.getElementById('textInputSection'),
  
  // Speech input
  speechInputSection: document.getElementById('speechInputSection'),
  startRecordBtn: document.getElementById('startRecordBtn'),
  stopRecordBtn: document.getElementById('stopRecordBtn'),
  recordingStatus: document.getElementById('recordingStatus'),
  micIcon: document.getElementById('micIcon'),
  recordingBanner: document.getElementById('recordingBanner'),
  transcribedText: document.getElementById('transcribedText'),
  
  // Convert and controls
  convertBtn: document.getElementById('convertBtn'),
  playAnimationBtn: document.getElementById('playAnimationBtn'),
  downloadSignsBtn: document.getElementById('downloadSignsBtn'),
  
  // Sign display
  signDisplaySection: document.getElementById('signDisplaySection'),
  signDisplay: document.getElementById('signDisplay'),
  currentSignLanguage: document.getElementById('currentSignLanguage'),
  prevSignBtn: document.getElementById('prevSignBtn'),
  nextSignBtn: document.getElementById('nextSignBtn'),
  currentSignIndex: document.getElementById('currentSignIndex'),
  totalSigns: document.getElementById('totalSigns'),
  speedSlider: document.getElementById('speedSlider'),
  speedValue: document.getElementById('speedValue'),
  
  // Status
  statusText: document.getElementById('statusText'),
  statusBar: document.getElementById('statusBar')
};

// ===== State Management =====
const state = {
  mode: 'text', // 'text' or 'speech'
  selectedSignLanguage: CONFIG.defaultSignLanguage,
  currentText: '',
  signs: [],
  currentSignIndex: 0,
  isAnimationPlaying: false,
  animationSpeed: CONFIG.defaultSpeed,
  animationInterval: null,
  recognition: null,
  isRecording: false,
  transcribedSpeech: ''
};

// ===== Module: Input Mode Management =====
const InputModeModule = {
  /**
   * Switch to text mode
   */
  switchToTextMode() {
    state.mode = 'text';
    elements.textModeBtn.classList.add('active');
    elements.speechModeBtn.classList.remove('active');
    elements.textInputSection.style.display = 'block';
    elements.speechInputSection.style.display = 'none';
    updateStatus('Text mode - Type your message');
    console.log('Switched to text mode');
  },

  /**
   * Switch to speech mode
   */
  switchToSpeechMode() {
    state.mode = 'speech';
    elements.speechModeBtn.classList.add('active');
    elements.textModeBtn.classList.remove('active');
    elements.speechInputSection.style.display = 'block';
    elements.textInputSection.style.display = 'none';
    updateStatus('Speech mode - Record your voice');
    console.log('Switched to speech mode');
  }
};

// ===== Module: Speech Recognition =====
const SpeechRecognitionModule = {
  /**
   * Initialize speech recognition
   */
  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported');
      elements.startRecordBtn.disabled = true;
      elements.recordingStatus.textContent = 'Speech recognition not supported in this browser';
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = state.transcribedSpeech;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      state.transcribedSpeech = finalTranscript;
      const displayText = finalTranscript + interimTranscript;
      elements.transcribedText.textContent = displayText || 'Your speech will be transcribed here...';
      
      const wordCount = finalTranscript.trim().split(/\\s+/).filter(w => w).length;
      elements.recordingStatus.textContent = `Recording... ${wordCount} words captured`;
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.stop();
      
      let errorMsg = 'Recording error: ';
      switch (event.error) {
        case 'no-speech':
          errorMsg += 'No speech detected';
          break;
        case 'audio-capture':
          errorMsg += 'No microphone found';
          break;
        case 'not-allowed':
          errorMsg += 'Microphone access denied';
          break;
        default:
          errorMsg += event.error;
      }
      updateStatus(errorMsg);
    };

    recognition.onend = () => {
      if (state.isRecording) {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Recognition restart failed:', e);
        }
      }
    };

    state.recognition = recognition;
    return recognition;
  },

  /**
   * Start recording
   */
  async start() {
    if (!state.recognition) {
      updateStatus('Speech recognition not available');
      return;
    }

    if (state.isRecording) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      state.transcribedSpeech = '';
      elements.transcribedText.textContent = 'Listening...';
      
      state.recognition.start();
      state.isRecording = true;

      elements.startRecordBtn.disabled = true;
      elements.stopRecordBtn.disabled = false;
      elements.recordingStatus.textContent = 'Recording... Speak now!';
      elements.micIcon.classList.add('recording');
      elements.recordingBanner.style.display = 'flex';
      
      updateStatus('🎤 Recording - speak clearly!');

    } catch (error) {
      console.error('Microphone error:', error);
      let errorMsg = 'Failed to access microphone. ';
      if (error.name === 'NotAllowedError') {
        errorMsg += 'Please allow microphone access.';
      } else if (error.name === 'NotFoundError') {
        errorMsg += 'No microphone found.';
      }
      updateStatus(errorMsg);
    }
  },

  /**
   * Stop recording
   */
  stop() {
    if (!state.isRecording) return;

    try {
      state.recognition.stop();
    } catch (e) {
      console.warn('Recognition stop failed:', e);
    }

    state.isRecording = false;
    elements.startRecordBtn.disabled = false;
    elements.stopRecordBtn.disabled = true;
    elements.micIcon.classList.remove('recording');
    elements.recordingBanner.style.display = 'none';

    const wordCount = state.transcribedSpeech.trim().split(/\\s+/).filter(w => w).length;
    elements.recordingStatus.textContent = `Recording complete - ${wordCount} words captured`;
    updateStatus(`✅ Speech recorded. Click Convert to see sign language.`);
  }
};

// ===== Module: Sign Language Converter =====
const SignLanguageModule = {
  /**
   * Convert text to sign language representations
   */
  convertToSigns(text) {
    if (!text || !text.trim()) {
      throw new Error('No text to convert');
    }

    const normalizedText = text.toLowerCase().trim();
    const signs = [];

    for (let i = 0; i < normalizedText.length; i++) {
      const char = normalizedText[i];
      const sign = SIGN_ALPHABET[char] || '🤷';
      
      signs.push({
        character: char,
        sign: sign,
        label: char === ' ' ? 'SPACE' : char.toUpperCase(),
        description: this.getSignDescription(char)
      });
    }

    return signs;
  },

  /**
   * Get description for a character's sign
   */
  getSignDescription(char) {
    if (char === ' ') return 'Space between words';
    if (char === '!') return 'Exclamation';
    if (char === '?') return 'Question';
    if (char === '.') return 'Period';
    if (char === ',') return 'Comma';
    if (/[a-z]/.test(char)) return `Letter ${char.toUpperCase()}`;
    if (/[0-9]/.test(char)) return `Number ${char}`;
    return 'Special character';
  },

  /**
   * Display a specific sign
   */
  displaySign(index) {
    if (index < 0 || index >= state.signs.length) return;

    const sign = state.signs[index];
    
    elements.signDisplay.innerHTML = `
      <div class="sign-item">${sign.sign}</div>
      <div class="sign-label">${sign.label}</div>
      <div class="sign-description">${sign.description}</div>
    `;

    state.currentSignIndex = index;
    elements.currentSignIndex.textContent = index + 1;
    
    // Update navigation buttons
    elements.prevSignBtn.disabled = index === 0;
    elements.nextSignBtn.disabled = index === state.signs.length - 1;
  }
};

// ===== Module: Animation Controller =====
const AnimationModule = {
  /**
   * Play sign animation sequence
   */
  play() {
    if (state.signs.length === 0) return;
    if (state.isAnimationPlaying) return;

    state.isAnimationPlaying = true;
    state.currentSignIndex = 0;
    elements.playAnimationBtn.textContent = '⏸️ Pause Animation';
    updateStatus('Playing sign language animation...');

    this.playNextSign();
  },

  /**
   * Play next sign in sequence
   */
  playNextSign() {
    if (!state.isAnimationPlaying || state.currentSignIndex >= state.signs.length) {
      this.stop();
      return;
    }

    SignLanguageModule.displaySign(state.currentSignIndex);
    
    state.animationInterval = setTimeout(() => {
      state.currentSignIndex++;
      this.playNextSign();
    }, state.animationSpeed);
  },

  /**
   * Stop animation
   */
  stop() {
    state.isAnimationPlaying = false;
    if (state.animationInterval) {
      clearTimeout(state.animationInterval);
      state.animationInterval = null;
    }
    elements.playAnimationBtn.textContent = '▶️ Play Animation';
    updateStatus('Animation stopped');
  },

  /**
   * Toggle play/pause
   */
  toggle() {
    if (state.isAnimationPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }
};

// ===== Core Functions =====

/**
 * Handle convert button click
 */
function handleConvert() {
  let textToConvert = '';

  // Get text based on current mode
  if (state.mode === 'text') {
    textToConvert = elements.textInput.value.trim();
    if (!textToConvert) {
      updateStatus('Please enter some text first');
      return;
    }
  } else {
    textToConvert = state.transcribedSpeech.trim();
    if (!textToConvert) {
      updateStatus('Please record your voice first');
      return;
    }
  }

  // Check length
  if (textToConvert.length > CONFIG.maxTextLength) {
    updateStatus(`Text too long. Maximum ${CONFIG.maxTextLength} characters.`);
    return;
  }

  try {
    // Convert to signs
    state.signs = SignLanguageModule.convertToSigns(textToConvert);
    state.currentText = textToConvert;
    
    // Display first sign
    SignLanguageModule.displaySign(0);
    
    // Update UI
    elements.signDisplaySection.style.display = 'block';
    elements.totalSigns.textContent = state.signs.length;
    elements.currentSignLanguage.textContent = SIGN_LANGUAGES[state.selectedSignLanguage];
    elements.playAnimationBtn.disabled = false;
    elements.downloadSignsBtn.disabled = false;
    
    updateStatus(`✅ Converted ${state.signs.length} characters to ${SIGN_LANGUAGES[state.selectedSignLanguage]}`);
    
    // Scroll to display
    elements.signDisplaySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch (error) {
    console.error('Conversion error:', error);
    updateStatus(`Conversion failed: ${error.message}`);
  }
}

/**
 * Handle navigation - previous sign
 */
function showPreviousSign() {
  if (state.currentSignIndex > 0) {
    SignLanguageModule.displaySign(state.currentSignIndex - 1);
  }
}

/**
 * Handle navigation - next sign
 */
function showNextSign() {
  if (state.currentSignIndex < state.signs.length - 1) {
    SignLanguageModule.displaySign(state.currentSignIndex + 1);
  }
}

/**
 * Update animation speed
 */
function updateAnimationSpeed() {
  const speed = parseInt(elements.speedSlider.value);
  state.animationSpeed = speed;
  elements.speedValue.textContent = (speed / 1000).toFixed(1) + 's';
}

/**
 * Download signs as text file
 */
function downloadSigns() {
  if (state.signs.length === 0) return;

  const language = SIGN_LANGUAGES[state.selectedSignLanguage];
  const content = `${language} Representation\\n\\n` +
                  `Original Text: ${state.currentText}\\n\\n` +
                  `Signs:\\n` +
                  state.signs.map((s, i) => `${i + 1}. ${s.label} - ${s.sign}`).join('\\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sign_language_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  updateStatus('✅ Signs saved to file!');
}

/**
 * Clear text input
 */
function clearText() {
  elements.textInput.value = '';
  updateCharCount();
  updateStatus('Text cleared');
}

/**
 * Update character count
 */
function updateCharCount() {
  const count = elements.textInput.value.length;
  elements.charCount.textContent = count;
  
  if (count > CONFIG.maxTextLength * 0.9) {
    elements.charCount.style.color = '#ef4444';
  } else if (count > CONFIG.maxTextLength * 0.7) {
    elements.charCount.style.color = '#f59e0b';
  } else {
    elements.charCount.style.color = '#94a3b8';
  }
}

/**
 * Update status message
 */
function updateStatus(message) {
  elements.statusText.textContent = message;
}

/**
 * Update selected sign language
 */
function updateSignLanguage() {
  state.selectedSignLanguage = elements.signLanguageSelect.value;
  console.log('Sign language changed to:', state.selectedSignLanguage);
}

// ===== Event Listeners =====
function attachEventListeners() {
  // Mode switching
  elements.textModeBtn.addEventListener('click', () => InputModeModule.switchToTextMode());
  elements.speechModeBtn.addEventListener('click', () => InputModeModule.switchToSpeechMode());
  
  // Text input
  elements.textInput.addEventListener('input', updateCharCount);
  elements.clearTextBtn.addEventListener('click', clearText);
  
  // Speech recording
  elements.startRecordBtn.addEventListener('click', () => SpeechRecognitionModule.start());
  elements.stopRecordBtn.addEventListener('click', () => SpeechRecognitionModule.stop());
  
  // Conversion and controls
  elements.convertBtn.addEventListener('click', handleConvert);
  elements.playAnimationBtn.addEventListener('click', () => AnimationModule.toggle());
  elements.downloadSignsBtn.addEventListener('click', downloadSigns);
  
  // Sign navigation
  elements.prevSignBtn.addEventListener('click', showPreviousSign);
  elements.nextSignBtn.addEventListener('click', showNextSign);
  
  // Speed control
  elements.speedSlider.addEventListener('input', updateAnimationSpeed);
  
  // Sign language selection
  elements.signLanguageSelect.addEventListener('change', updateSignLanguage);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (elements.signDisplaySection.style.display === 'block') {
      if (e.key === 'ArrowLeft') {
        showPreviousSign();
      } else if (e.key === 'ArrowRight') {
        showNextSign();
      } else if (e.key === ' ') {
        e.preventDefault();
        AnimationModule.toggle();
      }
    }
  });
}

// ===== Initialization =====
function init() {
  console.log('Text/Speech to Sign Language module initializing...');
  
  // Check if all elements exist
  const missingElements = Object.entries(elements)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
    
  if (missingElements.length > 0) {
    console.error('Missing elements:', missingElements);
    return;
  }
  
  // Initialize speech recognition
  SpeechRecognitionModule.init();
  
  // Set default mode
  InputModeModule.switchToTextMode();
  
  // Initialize character count
  updateCharCount();
  
  // Initialize speed display
  updateAnimationSpeed();
  
  // Attach event listeners
  attachEventListeners();
  
  // Set initial status
  updateStatus('Select input mode and enter text or record speech');
  
  console.log('Text/Speech to Sign Language module initialized successfully');
  console.log('Supported sign languages:', Object.keys(SIGN_LANGUAGES).length);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SignLanguageModule,
    SpeechRecognitionModule,
    AnimationModule,
    InputModeModule
  };
}
