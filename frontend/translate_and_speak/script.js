/**
 * Translate & Speak Module
 * Handles text translation and text-to-speech conversion
 */

// ===== Configuration =====
const CONFIG = {
  maxCharacters: 5000,
  ttsMaxCharacters: 1000
};

// ===== Language Code Mapping =====
// Maps short codes to full locale codes for TTS
const LANGUAGE_LOCALE_MAP = {
  'en': 'en-US',
  'es': 'es-ES',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'it': 'it-IT',
  'pt': 'pt-PT',
  'ru': 'ru-RU',
  'zh': 'zh-CN',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
  'ar': 'ar-SA',
  'hi': 'hi-IN',
  'bn': 'bn-IN',
  'ur': 'ur-PK',
  'pa': 'pa-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'mr': 'mr-IN',
  'tr': 'tr-TR',
  'vi': 'vi-VN',
  'th': 'th-TH',
  'id': 'id-ID',
  'nl': 'nl-NL',
  'pl': 'pl-PL',
  'uk': 'uk-UA'
};

// ===== DOM Elements =====
const elements = {
  sourceLanguage: document.getElementById('sourceLanguage'),
  targetLanguage: document.getElementById('targetLanguage'),
  swapLanguages: document.getElementById('swapLanguages'),
  sourceText: document.getElementById('sourceText'),
  targetText: document.getElementById('targetText'),
  sourceCharCount: document.getElementById('sourceCharCount'),
  targetCharCount: document.getElementById('targetCharCount'),
  uploadBtn: document.getElementById('uploadBtn'),
  clearSourceBtn: document.getElementById('clearSourceBtn'),
  copyBtn: document.getElementById('copyBtn'),
  downloadTxtBtn: document.getElementById('downloadTxtBtn'),
  translateBtn: document.getElementById('translateBtn'),
  speakBtn: document.getElementById('speakBtn'),
  downloadAudioBtn: document.getElementById('downloadAudioBtn'),
  statusText: document.getElementById('statusText'),
  statusBar: document.getElementById('statusBar'),
  fileInput: document.getElementById('fileInput'),
  // Voice recording elements
  startRecordBtn: document.getElementById('startRecordBtn'),
  stopRecordBtn: document.getElementById('stopRecordBtn'),
  recordQuickBtn: document.getElementById('recordQuickBtn'),
  recordingStatus: document.getElementById('recordingStatus'),
  recordingIcon: document.getElementById('recordingIcon'),
  recordingBanner: document.getElementById('recordingBanner')
};

// ===== State Management =====
const state = {
  isTranslating: false,
  isSpeaking: false,
  isRecording: false,
  currentTranslation: '',
  utterance: null,
  recognition: null,
  recordedText: ''
};

// ===== Translation Functions =====

/**
 * Translate text using multiple free translation APIs
 */
async function translateText(text, sourceLang, targetLang) {
  if (!text || !text.trim()) {
    throw new Error('No text to translate');
  }

  if (text.length > CONFIG.maxCharacters) {
    throw new Error(`Text too long. Maximum ${CONFIG.maxCharacters} characters allowed.`);
  }

  if (sourceLang === targetLang) {
    return text; // No translation needed
  }

  updateStatus('Translating...', true);

  // Method 1: Try MyMemory Translation API (free, reliable)
  try {
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    const response = await fetch(myMemoryUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.responseData && data.responseData.translatedText) {
        console.log('Translation successful via MyMemory API');
        return data.responseData.translatedText;
      }
    }
  } catch (error) {
    console.warn('MyMemory API failed:', error);
  }

  // Method 2: Try LibreTranslate.de (free, open source)
  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.translatedText) {
        console.log('Translation successful via LibreTranslate.de');
        return data.translatedText;
      }
    }
  } catch (error) {
    console.warn('LibreTranslate.de API failed:', error);
  }

  // Method 3: Try Google Translate unofficial API via proxy
  try {
    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(googleUrl, {
      method: 'GET'
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        let translatedText = '';
        for (let i = 0; i < data[0].length; i++) {
          if (data[0][i][0]) {
            translatedText += data[0][i][0];
          }
        }
        if (translatedText) {
          console.log('Translation successful via Google Translate API');
          return translatedText;
        }
      }
    }
  } catch (error) {
    console.warn('Google Translate API failed:', error);
  }

  // If all methods fail, throw error
  throw new Error('All translation services are unavailable. Please try again later.');
}

/**
 * Handle translation button click
 */
async function handleTranslate() {
  const sourceText = elements.sourceText.value.trim();
  const sourceLang = elements.sourceLanguage.value;
  const targetLang = elements.targetLanguage.value;

  if (!sourceText) {
    updateStatus('Please enter some text to translate', false);
    return;
  }

  if (state.isTranslating) {
    return; // Prevent multiple simultaneous translations
  }

  try {
    state.isTranslating = true;
    elements.translateBtn.disabled = true;
    elements.targetText.value = '';
    
    const translatedText = await translateText(sourceText, sourceLang, targetLang);
    
    elements.targetText.value = translatedText;
    state.currentTranslation = translatedText;
    
    // Enable speak and download buttons
    elements.speakBtn.disabled = false;
    elements.downloadAudioBtn.disabled = false;
    
    updateCharCount(elements.targetCharCount, translatedText);
    updateStatus('Translation complete!', false);
    
    // Auto-speak if text is short
    if (translatedText.length <= 200) {
      setTimeout(() => updateStatus('Ready to speak', false), 2000);
    }
    
  } catch (error) {
    console.error('Translation error:', error);
    updateStatus(`Translation failed: ${error.message}`, false);
    elements.targetText.value = '';
    elements.speakBtn.disabled = true;
    elements.downloadAudioBtn.disabled = true;
  } finally {
    state.isTranslating = false;
    elements.translateBtn.disabled = false;
  }
}

// ===== Speech Recognition (Voice Recording) Functions =====

/**
 * Initialize speech recognition
 */
function initSpeechRecognition() {
  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech Recognition not supported in this browser');
    elements.startRecordBtn.disabled = true;
    elements.recordQuickBtn.disabled = true;
    elements.recordingStatus.textContent = 'Speech recognition not supported';
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  // Set language based on source language selection
  const setRecognitionLanguage = () => {
    const lang = elements.sourceLanguage.value;
    recognition.lang = LANGUAGE_LOCALE_MAP[lang] || lang;
  };
  
  setRecognitionLanguage();

  // Update language when source language changes
  elements.sourceLanguage.addEventListener('change', setRecognitionLanguage);

  // Handle recognition results
  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = state.recordedText;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    // Update text area with transcription
    state.recordedText = finalTranscript;
    elements.sourceText.value = finalTranscript + interimTranscript;
    updateCharCount(elements.sourceCharCount, elements.sourceText.value);
    
    // Update status with word count
    const wordCount = finalTranscript.trim().split(/\\s+/).filter(w => w).length;
    elements.recordingStatus.textContent = `Recording... ${wordCount} words captured`;
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    
    let errorMessage = 'Recording error: ';
    switch (event.error) {
      case 'no-speech':
        errorMessage += 'No speech detected';
        break;
      case 'audio-capture':
        errorMessage += 'No microphone found';
        break;
      case 'not-allowed':
        errorMessage += 'Microphone access denied';
        break;
      case 'network':
        errorMessage += 'Network error';
        break;
      default:
        errorMessage += event.error;
    }
    
    updateStatus(errorMessage, false);
    stopRecording();
  };

  recognition.onend = () => {
    if (state.isRecording) {
      // Restart if still supposed to be recording
      try {
        recognition.start();
      } catch (e) {
        console.warn('Recognition restart failed:', e);
      }
    }
  };

  return recognition;
}

/**
 * Start voice recording
 */
async function startRecording() {
  if (!state.recognition) {
    updateStatus('Speech recognition not available', false);
    return;
  }

  if (state.isRecording) {
    return;
  }

  try {
    // Request microphone permission
    await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Clear previous recording
    state.recordedText = '';
    
    // Start recognition
    state.recognition.start();
    state.isRecording = true;

    // Update UI
    elements.startRecordBtn.disabled = true;
    elements.stopRecordBtn.disabled = false;
    elements.recordQuickBtn.disabled = true;
    elements.recordingStatus.textContent = 'Recording... Speak now!';
    elements.recordingIcon.classList.add('active');
    elements.recordingBanner.style.display = 'flex';
    
    updateStatus('🎤 Recording started - speak clearly!', false);

  } catch (error) {
    console.error('Failed to start recording:', error);
    
    let errorMsg = 'Failed to access microphone. ';
    if (error.name === 'NotAllowedError') {
      errorMsg += 'Please allow microphone access in your browser settings.';
    } else if (error.name === 'NotFoundError') {
      errorMsg += 'No microphone found. Please connect a microphone.';
    } else {
      errorMsg += error.message;
    }
    
    updateStatus(errorMsg, false);
  }
}

/**
 * Stop voice recording
 */
function stopRecording() {
  if (!state.isRecording) {
    return;
  }

  try {
    state.recognition.stop();
  } catch (e) {
    console.warn('Recognition stop failed:', e);
  }

  state.isRecording = false;

  // Update UI
  elements.startRecordBtn.disabled = false;
  elements.stopRecordBtn.disabled = true;
  elements.recordQuickBtn.disabled = false;
  elements.recordingIcon.classList.remove('active');
  elements.recordingBanner.style.display = 'none';

  // Update status
  const wordCount = state.recordedText.trim().split(/\\s+/).filter(w => w).length;
  elements.recordingStatus.textContent = `Recording complete - ${wordCount} words captured`;
  
  updateStatus(`✅ Recording stopped. ${wordCount} words captured. Click Translate to continue.`, false);
}

// ===== Text-to-Speech Functions =====

/**
 * Load and ensure voices are available
 */
function loadVoices() {
  return new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
      resolve(voices);
    };
    
    // Fallback timeout
    setTimeout(() => {
      voices = speechSynthesis.getVoices();
      resolve(voices);
    }, 1000);
  });
}

/**
 * Speak the translated text
 */
async function handleSpeak() {
  const text = elements.targetText.value.trim();
  const targetLang = elements.targetLanguage.value;

  if (!text) {
    updateStatus('No translation to speak', false);
    return;
  }

  if (!('speechSynthesis' in window)) {
    updateStatus('Text-to-speech not supported in this browser', false);
    return;
  }

  try {
    // Stop any ongoing speech
    speechSynthesis.cancel();

    // Check text length for TTS
    let speakText = text;
    if (text.length > CONFIG.ttsMaxCharacters) {
      updateStatus(`Text too long. Speaking first ${CONFIG.ttsMaxCharacters} characters...`, false);
      speakText = text.substring(0, CONFIG.ttsMaxCharacters);
    }

    // Load voices
    const voices = await loadVoices();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(speakText);
    const locale = LANGUAGE_LOCALE_MAP[targetLang] || targetLang;
    utterance.lang = locale;

    // Find best matching voice
    const matchingVoice = voices.find(v => v.lang.startsWith(targetLang)) ||
                         voices.find(v => v.lang.split('-')[0] === targetLang) ||
                         voices[0];

    if (matchingVoice) {
      utterance.voice = matchingVoice;
      console.log('Using voice:', matchingVoice.name, matchingVoice.lang);
    }

    // Set speech parameters
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Event handlers
    utterance.onstart = () => {
      state.isSpeaking = true;
      elements.speakBtn.textContent = '⏸️ Speaking...';
      elements.speakBtn.disabled = true;
      updateStatus('Speaking...', false);
    };

    utterance.onend = () => {
      state.isSpeaking = false;
      elements.speakBtn.textContent = '🔊 Speak Translation';
      elements.speakBtn.disabled = false;
      updateStatus('Speech complete', false);
      setTimeout(() => updateStatus('Ready', false), 2000);
    };

    utterance.onerror = (event) => {
      state.isSpeaking = false;
      elements.speakBtn.textContent = '🔊 Speak Translation';
      elements.speakBtn.disabled = false;
      console.error('Speech error:', event.error);
      updateStatus(`Speech error: ${event.error}`, false);
    };

    state.utterance = utterance;
    speechSynthesis.speak(utterance);

  } catch (error) {
    console.error('Speech error:', error);
    updateStatus(`Speech failed: ${error.message}`, false);
  }
}

/**
 * Download translated text as audio (using Google TTS API)
 */
async function handleDownloadAudio() {
  const text = elements.targetText.value.trim();
  const targetLang = elements.targetLanguage.value;

  if (!text) {
    updateStatus('No translation to download', false);
    return;
  }

  // Check text length
  if (text.length > 200) {
    updateStatus('Text too long for audio download. Maximum 200 characters. Use "Speak" button instead.', false);
    return;
  }

  updateStatus('Generating audio...', true);

  try {
    const corsProxies = [
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest='
    ];
    
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${targetLang}&q=${encodeURIComponent(text)}`;
    
    let response = null;
    
    for (const proxy of corsProxies) {
      try {
        const proxiedUrl = proxy + encodeURIComponent(ttsUrl);
        response = await fetch(proxiedUrl);
        
        if (response.ok) break;
      } catch (err) {
        console.warn(`Proxy ${proxy} failed:`, err);
        continue;
      }
    }
    
    if (!response || !response.ok) {
      throw new Error('Failed to generate audio');
    }
    
    const audioBlob = await response.blob();
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation_${targetLang}_${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    updateStatus('Audio downloaded successfully!', false);
    setTimeout(() => updateStatus('Ready', false), 2000);
    
  } catch (error) {
    console.error('Audio download error:', error);
    updateStatus('⚠️ Download unavailable. Please use "Speak" button to listen instead.', false);
  }
}

// ===== Document Upload Functions =====

/**
 * Handle document upload
 */
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  updateStatus('Loading document...', false);
  
  try {
    let text = '';
    
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      text = await file.text();
    } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      updateStatus('Word documents not supported. Please save as .txt or copy/paste the text.', false);
      return;
    } else if (file.name.endsWith('.pdf')) {
      updateStatus('PDF files not supported. Please save as .txt or copy/paste the text.', false);
      return;
    } else {
      try {
        text = await file.text();
      } catch (err) {
        updateStatus('Could not read file. Please use .txt format.', false);
        return;
      }
    }
    
    if (text && text.trim()) {
      if (text.length > CONFIG.maxCharacters) {
        text = text.substring(0, CONFIG.maxCharacters);
        updateStatus(`Document loaded (trimmed to ${CONFIG.maxCharacters} characters)`, false);
      } else {
        updateStatus(`Document loaded: ${file.name}`, false);
      }
      elements.sourceText.value = text.trim();
      updateCharCount(elements.sourceCharCount, text.trim());
    } else {
      updateStatus('Document is empty or unreadable.', false);
    }
  } catch (error) {
    console.error('File upload error:', error);
    updateStatus('Error loading document.', false);
  }
  
  // Clear file input
  elements.fileInput.value = '';
}

// ===== Utility Functions =====

/**
 * Update status message
 */
function updateStatus(message, loading = false) {
  elements.statusText.textContent = message;
  if (loading) {
    elements.statusBar.classList.add('loading');
  } else {
    elements.statusBar.classList.remove('loading');
  }
}

/**
 * Update character count
 */
function updateCharCount(element, text) {
  const count = text ? text.length : 0;
  element.textContent = count;
  
  // Highlight if approaching limit
  if (count > CONFIG.maxCharacters * 0.9) {
    element.style.color = '#ef4444';
  } else if (count > CONFIG.maxCharacters * 0.7) {
    element.style.color = '#f59e0b';
  } else {
    element.style.color = '#94a3b8';
  }
}

/**
 * Swap source and target languages
 */
function swapLanguages() {
  const sourceLang = elements.sourceLanguage.value;
  const targetLang = elements.targetLanguage.value;
  
  elements.sourceLanguage.value = targetLang;
  elements.targetLanguage.value = sourceLang;
  
  // Swap text if both exist
  const sourceText = elements.sourceText.value;
  const targetText = elements.targetText.value;
  
  if (sourceText && targetText) {
    elements.sourceText.value = targetText;
    elements.targetText.value = sourceText;
    updateCharCount(elements.sourceCharCount, targetText);
    updateCharCount(elements.targetCharCount, sourceText);
  }
  
  updateStatus('Languages swapped', false);
  setTimeout(() => updateStatus('Ready to translate', false), 1500);
}

/**
 * Copy translated text to clipboard
 */
async function copyToClipboard() {
  const text = elements.targetText.value.trim();
  
  if (!text) {
    updateStatus('No text to copy', false);
    return;
  }
  
  try {
    await navigator.clipboard.writeText(text);
    updateStatus('✅ Copied to clipboard!', false);
    setTimeout(() => updateStatus('Ready', false), 2000);
  } catch (error) {
    console.error('Copy error:', error);
    updateStatus('Failed to copy', false);
  }
}

/**
 * Download translated text as .txt file
 */
function downloadAsText() {
  const text = elements.targetText.value.trim();
  
  if (!text) {
    updateStatus('No text to download', false);
    return;
  }
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `translation_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  updateStatus('✅ Text file downloaded!', false);
  setTimeout(() => updateStatus('Ready', false), 2000);
}

/**
 * Clear source text
 */
function clearSource() {
  // Stop recording if active
  if (state.isRecording) {
    stopRecording();
  }
  
  // Clear text and reset state
  elements.sourceText.value = '';
  elements.targetText.value = '';
  state.recordedText = '';
  updateCharCount(elements.sourceCharCount, '');
  updateCharCount(elements.targetCharCount, '');
  elements.speakBtn.disabled = true;
  elements.downloadAudioBtn.disabled = true;
  elements.recordingStatus.textContent = 'Click record to start speaking';
  updateStatus('Ready to record, translate, or type text', false);
}

// ===== Event Listeners =====

function attachEventListeners() {
  // Translation
  elements.translateBtn.addEventListener('click', handleTranslate);
  
  // Text-to-Speech
  elements.speakBtn.addEventListener('click', handleSpeak);
  elements.downloadAudioBtn.addEventListener('click', handleDownloadAudio);
  
  // Voice Recording
  elements.startRecordBtn.addEventListener('click', startRecording);
  elements.stopRecordBtn.addEventListener('click', stopRecording);
  elements.recordQuickBtn.addEventListener('click', startRecording);
  
  // Language swap
  elements.swapLanguages.addEventListener('click', swapLanguages);
  
  // File upload
  elements.uploadBtn.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', handleFileUpload);
  
  // Text operations
  elements.clearSourceBtn.addEventListener('click', clearSource);
  elements.copyBtn.addEventListener('click', copyToClipboard);
  elements.downloadTxtBtn.addEventListener('click', downloadAsText);
  
  // Character counting
  elements.sourceText.addEventListener('input', (e) => {
    updateCharCount(elements.sourceCharCount, e.target.value);
  });
  
  // Enter key to translate (Ctrl+Enter)
  elements.sourceText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleTranslate();
    }
  });
  
  // Prevent textarea from being edited while translating
  elements.sourceText.addEventListener('keydown', (e) => {
    if (state.isTranslating && e.key !== 'Tab') {
      // Allow tab for accessibility
    }
  });
}

// ===== Initialization =====

function init() {
  console.log('Translate & Speak module initializing...');
  
  // Check if all elements exist
  const missingElements = Object.entries(elements)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
    
  if (missingElements.length > 0) {
    console.error('Missing elements:', missingElements);
    return;
  }
  
  // Initialize speech recognition
  state.recognition = initSpeechRecognition();
  if (state.recognition) {
    console.log('Speech recognition initialized successfully');
  }
  
  // Attach event listeners
  attachEventListeners();
  
  // Initialize character counts
  updateCharCount(elements.sourceCharCount, '');
  updateCharCount(elements.targetCharCount, '');
  
  // Load voices for TTS
  loadVoices().then(voices => {
    console.log(`Loaded ${voices.length} voices for text-to-speech`);
  });
  
  // Set initial status
  updateStatus('Ready to record, translate, or type text', false);
  
  console.log('Translate & Speak module initialized successfully');
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
    translateText,
    handleTranslate,
    handleSpeak
  };
}
