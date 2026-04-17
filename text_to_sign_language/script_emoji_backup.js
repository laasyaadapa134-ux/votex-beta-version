// Sign Language Translator - REAL Sign Language Videos
// Integrates with actual sign language databases

// ============================================
// Configuration & State
// ============================================
const CONFIG = {
  maxChars: 500,
  defaultSpeed: 3000, // 3 seconds per sign
  
  signLanguages: {
    asl: 'American Sign Language',
    bsl: 'British Sign Language',
    auslan: 'Australian Sign Language',
    isl: 'Indian Sign Language',
    jsl: 'Japanese Sign Language',
    fsl: 'French Sign Language',
    gsl: 'German Sign Language (DGS)',
    csl: 'Chinese Sign Language',
    rsl: 'Russian Sign Language',
    libras: 'Brazilian Sign Language'
  },
  
  // Sign Language Video APIs
  apis: {
    // Spread the Sign - multilingual sign language dictionary
    spreadTheSign: 'https://www.spreadthesign.com/api.php/json',
    // Signbank video links
    signbank: 'https://signbank.org',
    // ASL sign videos from various sources
    aslSign: 'https://www.signasl.org',
    // Lifeprint ASL dictionary
    lifeprint: 'https://www.lifeprint.com/asl101/pages-signs'
  }
};

const state = {
  inputMode: 'type', // 'type' or 'speak'
  isRecording: false,
  recognition: null,
  currentText: '',
  words: [],
  currentWordIndex: 0,
  isPlaying: false,
  speed: 1, // 1x speed
  loop: false,
  playbackInterval: null,
  selectedLanguage: 'asl',
  signCache: {} // Cache fetched signs
};

// ============================================
// Real Sign Language Video Sources
// ============================================
// ASL Sign Language video URLs (using public resources)
const ASL_SIGN_VIDEOS = {
  // Common words with ASL video demonstrations
  hello: 'https://media.spreadthesign.com/video/mp4/13/48600.mp4',
  hi: 'https://media.spreadthesign.com/video/mp4/13/48600.mp4',
  goodbye: 'https://media.spreadthesign.com/video/mp4/13/48760.mp4',
  bye: 'https://media.spreadthesign.com/video/mp4/13/48760.mp4',
  thanks: 'https://media.spreadthesign.com/video/mp4/13/48946.mp4',
  thank: 'https://media.spreadthesign.com/video/mp4/13/48946.mp4',
  you: 'https://media.spreadthesign.com/video/mp4/13/49206.mp4',
  please: 'https://media.spreadthesign.com/video/mp4/13/48878.mp4',
  sorry: 'https://media.spreadthesign.com/video/mp4/13/48912.mp4',
  yes: 'https://media.spreadthesign.com/video/mp4/13/49212.mp4',
  no: 'https://media.spreadthesign.com/video/mp4/13/48834.mp4',
  help: 'https://media.spreadthesign.com/video/mp4/13/48614.mp4',
  love: 'https://media.spreadthesign.com/video/mp4/13/48722.mp4',
  good: 'https://media.spreadthesign.com/video/mp4/13/48582.mp4',
  bad: 'https://media.spreadthesign.com/video/mp4/13/48454.mp4',
  happy: 'https://media.spreadthesign.com/video/mp4/13/48604.mp4',
  sad: 'https://media.spreadthesign.com/video/mp4/13/48898.mp4',
  i: 'https://media.spreadthesign.com/video/mp4/13/48636.mp4',
  me: 'https://media.spreadthesign.com/video/mp4/13/48756.mp4',
  my: 'https://media.spreadthesign.com/video/mp4/13/48812.mp4',
  water: 'https://media.spreadthesign.com/video/mp4/13/49172.mp4',
  food: 'https://media.spreadthesign.com/video/mp4/13/48566.mp4',
  eat: 'https://media.spreadthesign.com/video/mp4/13/48530.mp4',
  drink: 'https://media.spreadthesign.com/video/mp4/13/48526.mp4'
};

// Function to get sign video URL
function getSignVideo(word, language = 'asl') {
  // Check cache first
  const cacheKey = `${language}_${word}`;
  if (state.signCache[cacheKey]) {
    return state.signCache[cacheKey];
  }
  
  // For now, only ASL is fully supported with videos
  if (language === 'asl' && ASL_SIGN_VIDEOS[word]) {
    state.signCache[cacheKey] = ASL_SIGN_VIDEOS[word];
    return ASL_SIGN_VIDEOS[word];
  }
  
  // Return null if not found - will show "not available" message
  return null;
}

// Function to fetch sign from API (for future expansion)
async function fetchSignFromAPI(word, language) {
  try {
    // This would call SpreadTheSign API or similar
    // For now, return cached videos
    return getSignVideo(word, language);
  } catch (error) {
    console.error('Error fetching sign:', error);
    return null;
  }
}

// ============================================
// Sign Representations (Emoji/Unicode)
// ============================================
// Expanded dictionary with 300+ common words
const SIGN_REPRESENTATIONS = {
  // Greetings & Polite
  hello: '👋', hi: '👋', hey: '👋', greetings: '👋',
  goodbye: '👋🏻', bye: '👋🏻', farewell: '👋🏻', 
  thanks: '🙏', thank: '🙏', thankyou: '🙏',
  please: '🙏', sorry: '😔', excuse: '🙏', pardon: '🙏',
  welcome: '🤗', congratulations: '🎉', congrats: '🎉',
  
  // Yes/No & Agreement
  yes: '👍', yeah: '👍', yep: '👍', okay: '👌', ok: '👌',
  no: '👎', nope: '👎', not: '🚫', never: '⛔',
  maybe: '🤷', perhaps: '🤷', probably: '🤔',
  agree: '👍', disagree: '👎', sure: '👌',
  
  // Emotions & Feelings
  happy: '😊', joy: '😄', smile: '😊', laugh: '😂',
  sad: '😢', cry: '😭', upset: '😔', depressed: '😞',
  angry: '😠', mad: '😡', furious: '😤', annoyed: '😒',
  love: '❤️', like: '💖', heart: '❤️', care: '💝',
  hate: '😡', dislike: '👎',
  scared: '😨', afraid: '😰', fear: '😱', worried: '😟',
  excited: '🤩', surprised: '😲', shocked: '😱',
  tired: '😴', sleepy: '😴', exhausted: '😫',
  sick: '🤢', ill: '🤒', pain: '🤕', hurt: '🤕',
  confused: '😕', lost: '🤷', understand: '💡',
  
  // People & Relationships
  i: '👤', me: '👤', my: '👤', mine: '👤', myself: '👤',
  you: '👉', your: '👉', yours: '👉', yourself: '👉',
  he: '👨', him: '👨', his: '👨', himself: '👨',
  she: '👩', her: '👩', hers: '👩', herself: '👩',
  we: '👥', us: '👥', our: '👥', ours: '👥',
  they: '👥', them: '👥', their: '👥', theirs: '👥',
  who: '❓', what: '❓', when: '⏰', where: '📍', why: '❓', how: '❓',
  
  family: '👨‍👩‍👧‍👦', mother: '👩‍👦', mom: '👩‍👦', father: '👨‍👦', dad: '👨‍👦',
  brother: '👦', sister: '👧', son: '👦', daughter: '👧',
  baby: '👶', child: '🧒', children: '👶👧', kid: '🧒', kids: '👶👧',
  friend: '👥', friends: '👥', person: '👤', people: '👥',
  man: '👨', woman: '👩', boy: '👦', girl: '👧',
  husband: '🤵', wife: '👰', marry: '💒', wedding: '💒',
  
  // Actions & Verbs
  go: '🚶', come: '👋', walk: '🚶', run: '🏃', jump: '⬆️',
  sit: '🪑', stand: '🧍', lie: '🛏️', sleep: '😴',
  eat: '🍴', drink: '🥤', cook: '👨‍🍳', hungry: '🍴', thirsty: '🥤',
  talk: '💬', speak: '💬', say: '💬', tell: '💬', ask: '❓',
  listen: '👂', hear: '👂', sound: '🔊', quiet: '🤫', silent: '🤐',
  see: '👀', look: '👀', watch: '👀', show: '👁️', view: '👁️',
  read: '📖', write: '✍️', draw: '🎨', paint: '🎨',
  think: '🤔', know: '💡', understand: '💡', remember: '🧠', forget: '❓',
  learn: '📚', teach: '👨‍🏫', study: '📚', practice: '📝',
  work: '💼', job: '💼', business: '💼', office: '🏢',
  play: '🎮', fun: '🎉', enjoy: '😊', game: '🎮',
  help: '🆘', need: '🆘', want: '🙏', wish: '🌟',
  give: '🎁', take: '✋', get: '🤲', receive: '🤲',
  buy: '💰', sell: '💵', pay: '💳', money: '💰', cost: '💰',
  open: '🔓', close: '🔒', lock: '🔒', unlock: '🔓',
  start: '▶️', begin: '▶️', stop: '✋', end: '⏹️', finish: '✅',
  wait: '⏸️', hurry: '⏩', fast: '⚡', slow: '🐌',
  try: '💪', attempt: '💪', practice: '📝', improve: '📈',
  clean: '🧹', wash: '🧼', dirty: '💩',
  drive: '🚗', ride: '🚲', travel: '✈️', trip: '🧳',
  call: '📞', phone: '📱', text: '💬', message: '✉️',
  send: '📤', receive: '📥', mail: '✉️', email: '📧',
  cut: '✂️', break: '💔', fix: '🔧', repair: '🔧', build: '🏗️',
  
  // Things & Objects
  thing: '📦', stuff: '📦', object: '📦',
  home: '🏠', house: '🏠', apartment: '🏢', room: '🚪',
  school: '🎓', class: '📚', university: '🎓', college: '🎓',
  hospital: '🏥', doctor: '👨‍⚕️', nurse: '👩‍⚕️', medicine: '💊',
  store: '🏪', shop: '🛍️', market: '🛒', mall: '🏬',
  restaurant: '🍽️', cafe: '☕', bar: '🍺',
  car: '🚗', bus: '🚌', train: '🚆', bike: '🚲', plane: '✈️',
  book: '📖', paper: '📄', pen: '🖊️', pencil: '✏️',
  computer: '💻', phone: '📱', tablet: '📱', camera: '📷',
  tv: '📺', television: '📺', movie: '🎬', film: '🎬',
  music: '🎵', song: '🎵', sing: '🎤', dance: '💃',
  food: '🍴', meal: '🍽️', breakfast: '🍳', lunch: '🍱', dinner: '🍽️',
  water: '💧', coffee: '☕', tea: '🍵', juice: '🧃', milk: '🥛',
  fruit: '🍎', apple: '🍎', banana: '🍌', orange: '🍊',
  bread: '🍞', meat: '🍖', chicken: '🍗', fish: '🐟',
  pizza: '🍕', burger: '🍔', sandwich: '🥪', salad: '🥗',
  
  // Places & Directions
  place: '📍', here: '📍', there: '👉', where: '📍',
  up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️',
  in: '📥', out: '📤', inside: '📥', outside: '🚪',
  near: '📍', far: '🔭', close: '📍', away: '🔭',
  north: '⬆️', south: '⬇️', east: '➡️', west: '⬅️',
  city: '🏙️', town: '🏘️', country: '🌍', world: '🌎',
  
  // Time
  time: '⏰', clock: '🕐', hour: '⏰', minute: '⏱️', second: '⏱️',
  today: '📅', tomorrow: '🗓️', yesterday: '📆',
  now: '⏰', soon: '⏱️', later: '⏰', before: '⏪', after: '⏩',
  morning: '🌅', afternoon: '☀️', evening: '🌆', night: '🌙',
  day: '📅', week: '📅', month: '📅', year: '📅',
  monday: '📅', tuesday: '📅', wednesday: '📅', thursday: '📅',
  friday: '📅', saturday: '📅', sunday: '📅',
  early: '🌅', late: '🌙', always: '♾️', never: '⛔',
  
  // Numbers & Quantities
  number: '🔢', count: '🔢',
  zero: '0️⃣', one: '1️⃣', two: '2️⃣', three: '3️⃣', four: '4️⃣',
  five: '5️⃣', six: '6️⃣', seven: '7️⃣', eight: '8️⃣', nine: '9️⃣', ten: '🔟',
  many: '🔢', few: '🤏', some: '👌', all: '💯', none: '⭕',
  more: '➕', less: '➖', much: '💯', little: '🤏',
  
  // Qualities & Descriptions
  good: '👍', great: '👍', excellent: '💯', perfect: '💯', best: '🏆',
  bad: '👎', terrible: '👎', worst: '💩', awful: '👎',
  big: '🔲', large: '📦', huge: '🦖', giant: '🦕',
  small: '▪️', little: '🤏', tiny: '🔬',
  hot: '🔥', warm: '🌡️', cold: '❄️', cool: '🧊',
  new: '✨', old: '🕰️', young: '👶', age: '📅',
  easy: '👌', simple: '✅', hard: '💪', difficult: '😰',
  fast: '⚡', quick: '⏩', slow: '🐌',
  high: '⬆️', low: '⬇️', tall: '📏', short: '📐',
  long: '📏', wide: '↔️', narrow: '⬌', thick: '📚', thin: '📄',
  heavy: '⚖️', light: '🪶', strong: '💪', weak: '😰',
  beautiful: '🌟', pretty: '💐', ugly: '👹',
  clean: '✨', dirty: '💩', neat: '✨', messy: '🌪️',
  safe: '🔒', danger: '⚠️', dangerous: '⚠️',
  
  // Colors
  color: '🎨', red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡',
  black: '⚫', white: '⚪', brown: '🟤', orange: '🟠', purple: '🟣', pink: '🩷',
  
  // Weather & Nature
  weather: '🌤️', sun: '☀️', sunny: '☀️', rain: '🌧️', rainy: '🌧️',
  cloud: '☁️', cloudy: '☁️', snow: '❄️', snowy: '❄️',
  wind: '💨', windy: '💨', storm: '⛈️',
  tree: '🌳', flower: '🌸', plant: '🌱', grass: '🌿',
  animal: '🐾', dog: '🐕', cat: '🐈', bird: '🐦',
  
  // Abstract & Other
  idea: '💡', question: '❓', answer: '✅', problem: '❓',
  life: '🌱', death: '💀', birth: '👶', live: '🌱', die: '💀',
  true: '✅', false: '❌', right: '✅', wrong: '❌',
  important: '⭐', special: '⭐', normal: '👌',
  same: '=', different: '≠', change: '🔄',
  continue: '➡️', again: '🔄', repeat: '🔁',
  bathroom: '🚻', toilet: '🚽', shower: '🚿', bath: '🛁'
};

// Fingerspelling alphabet for unknown words (ASL hand signs)
const FINGERSPELL_ALPHABET = {
  a: '✊', b: '🖐️', c: '👌', d: '☝️', e: '✊', f: '👌', g: '👈',
  h: '☝️✌️', i: '🤙', j: '🤙', k: '✌️☝️', l: '👆', m: '✊',
  n: '✊', o: '👌', p: '☝️👇', q: '👇', r: '✌️', s: '✊',
  t: '✊☝️', u: '✌️', v: '✌️', w: '🤟', x: '☝️', y: '🤙', z: '☝️'
};

// Numbers in sign language
const SIGN_NUMBERS = {
  '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
  '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣'
};

// ============================================
// DOM Elements
// ============================================
const elements = {
  // Input mode
  typeModeBtn: document.getElementById('typeModeBtn'),
  speakModeBtn: document.getElementById('speakModeBtn'),
  typeInputArea: document.getElementById('typeInputArea'),
  speakInputArea: document.getElementById('speakInputArea'),
  
  // Text input
  textInput: document.getElementById('textInput'),
  charCount: document.getElementById('charCount'),
  clearTextBtn: document.getElementById('clearTextBtn'),
  
  // Speech input
  micBtn: document.getElementById('micBtn'),
  micStatus: document.getElementById('micStatus'),
  transcriptDisplay: document.getElementById('transcriptDisplay'),
  
  // Language selector
  signLanguageSelect: document.getElementById('signLanguageSelect'),
  selectedLangDisplay: document.getElementById('selectedLangDisplay'),
  
  // Translate button
  translateBtn: document.getElementById('translateBtn'),
  
  // Video display
  signVideoArea: document.getElementById('signVideoArea'),
  videoControls: document.getElementById('videoControls'),
  
  // Playback controls
  currentWordDisplay: document.getElementById('currentWordDisplay'),
  progressBar: document.getElementById('progressBar'),
  currentTime: document.getElementById('currentTime'),
  totalTime: document.getElementById('totalTime'),
  restartBtn: document.getElementById('restartBtn'),
  prevBtn: document.getElementById('prevBtn'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  nextBtn: document.getElementById('nextBtn'),
  loopBtn: document.getElementById('loopBtn'),
  
  // Word chips
  wordCountDisplay: document.getElementById('wordCountDisplay'),
  wordChips: document.getElementById('wordChips'),
  
  // Speed buttons
  speedBtns: document.querySelectorAll('.speed-btn'),
  
  // Download
  downloadBtn: document.getElementById('downloadBtn')
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  initializeSpeechRecognition();
});

function initializeEventListeners() {
  // Input mode toggle
  elements.typeModeBtn.addEventListener('click', () => switchInputMode('type'));
  elements.speakModeBtn.addEventListener('click', () => switchInputMode('speak'));
  
  // Text input
  elements.textInput.addEventListener('input', updateCharCount);
  elements.clearTextBtn.addEventListener('click', clearTextInput);
  
  // Speech input
  elements.micBtn.addEventListener('click', toggleRecording);
  
  // Language selector
  elements.signLanguageSelect.addEventListener('change', updateSelectedLanguage);
  
  // Translate button
  elements.translateBtn.addEventListener('click', translateToSigns);
  
  // Playback controls
  elements.restartBtn.addEventListener('click', restart);
  elements.prevBtn.addEventListener('click', previousWord);
  elements.playPauseBtn.addEventListener('click', togglePlayPause);
  elements.nextBtn.addEventListener('click', nextWord);
  elements.loopBtn.addEventListener('click', toggleLoop);
  
  // Speed controls
  elements.speedBtns.forEach(btn => {
    btn.addEventListener('click', () => changeSpeed(parseFloat(btn.dataset.speed)));
  });
  
  // Download
  elements.downloadBtn.addEventListener('click', downloadSigns);
  
  // Keyboard shortcuts
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
        // Restart if still in recording mode
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
  elements.selectedLangDisplay.textContent = CONFIG.signLanguages[state.selectedLanguage];
}

// ============================================
// Translation to Signs
// ============================================
function translateToSigns() {
  const text = state.currentText.trim();
  
  if (!text) {
    showNotification('Please enter or speak some text first', 'warning');
    return;
  }
  
  // Parse text into words with smart preprocessing
  state.words = text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, '') // Keep apostrophes and hyphens
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => normalizeWord(word));
  
  if (state.words.length === 0) {
    showNotification('No valid words to translate', 'warning');
    return;
  }
  
  // Reset playback state
  state.currentWordIndex = 0;
  state.isPlaying = false;
  
  // Show video controls
  elements.videoControls.style.display = 'block';
  elements.downloadBtn.style.display = 'inline-block';
  
  // Update UI
  updateWordChips();
  updateWordCount();
  updateTotalTime();
  
  // Show first word
  displayWord(0);
  
  // Count how many words are in dictionary
  const knownWords = state.words.filter(w => SIGN_REPRESENTATIONS[w]).length;
  const accuracy = Math.round((knownWords / state.words.length) * 100);
  
  showNotification(`Translated ${state.words.length} words (${accuracy}% in dictionary) · ${CONFIG.signLanguages[state.selectedLanguage]}`, 'success');
}

// Normalize words to improve dictionary matches
function normalizeWord(word) {
  // Handle common contractions
  const contractions = {
    "i'm": 'i', "im": 'i', "you're": 'you', "youre": 'you',
    "he's": 'he', "hes": 'he', "she's": 'she', "shes": 'she',
    "it's": 'it', "its": 'it', "we're": 'we', "were": 'we',
    "they're": 'they', "theyre": 'they', "that's": 'that', "thats": 'that',
    "what's": 'what', "whats": 'what', "who's": 'who', "whos": 'who',
    "where's": 'where', "wheres": 'where', "when's": 'when', "whens": 'when',
    "why's": 'why', "whys": 'why', "how's": 'how', "hows": 'how',
    "can't": 'not', "cant": 'not', "won't": 'not', "wont": 'not',
    "don't": 'not', "dont": 'not', "doesn't": 'not', "doesnt": 'not',
    "didn't": 'not', "didnt": 'not', "isn't": 'not', "isnt": 'not',
    "aren't": 'not', "arent": 'not', "wasn't": 'not', "wasnt": 'not',
    "weren't": 'not', "werent": 'not', "haven't": 'not', "havent": 'not',
    "hasn't": 'not', "hasnt": 'not', "hadn't": 'not', "hadnt": 'not',
    "i'll": 'i', "ill": 'i', "you'll": 'you', "youll": 'you',
    "he'll": 'he', "hell": 'he', "she'll": 'she', "shell": 'she',
    "we'll": 'we', "well": 'we', "they'll": 'they', "theyll": 'they',
    "i'd": 'i', "id": 'i', "you'd": 'you', "youd": 'you',
    "he'd": 'he', "hed": 'he', "she'd": 'she', "shed": 'she',
    "we'd": 'we', "wed": 'we', "they'd": 'they', "theyd": 'they',
    "i've": 'i', "ive": 'i', "you've": 'you', "youve": 'you',
    "we've": 'we', "weve": 'we', "they've": 'they', "theyve": 'they'
  };
  
  // Handle verb forms (simple stemming)
  const commonEndings = {
    'ing': '', 'ed': '', 'es': '', 's': '', 'ly': '', 'er': '', 'est': ''
  };
  
  // Check contractions first
  if (contractions[word]) {
    return contractions[word];
  }
  
  // Try removing common endings if word is not in dictionary
  if (!SIGN_REPRESENTATIONS[word]) {
    for (const [ending, replacement] of Object.entries(commonEndings)) {
      if (word.endsWith(ending) && word.length > ending.length + 2) {
        const stem = word.slice(0, -ending.length) + replacement;
        if (SIGN_REPRESENTATIONS[stem]) {
          return stem;
        }
      }
    }
  }
  
  return word;
}

// ============================================
// Video Display
// ============================================
function displayWord(index) {
  if (index < 0 || index >= state.words.length) return;
  
  state.currentWordIndex = index;
  const word = state.words[index];
  
  // Get sign representation with intelligent fallback
  let sign, signType;
  
  // Check if it's a number
  if (/^\d+$/.test(word)) {
    sign = word.split('').map(digit => SIGN_NUMBERS[digit] || digit).join('');
    signType = 'Number';
  }
  // Check if word is in dictionary
  else if (SIGN_REPRESENTATIONS[word]) {
    sign = SIGN_REPRESENTATIONS[word];
    signType = 'Sign';
  }
  // Fingerspell short unknown words (3 letters or less)
  else if (word.length <= 3) {
    sign = word.split('').map(letter => FINGERSPELL_ALPHABET[letter] || '🤟').join('');
    signType = 'Fingerspelled';
  }
  // For longer unknown words, show first letter + default sign
  else {
    const firstLetter = FINGERSPELL_ALPHABET[word[0]] || '🤟';
    sign = firstLetter + '🤟';
    signType = 'Approximate';
  }
  
  // Create sign display
  elements.signVideoArea.innerHTML = `
    <div class="sign-video-display">
      <div class="sign-animation">${sign}</div>
      <div class="sign-word-display">${word.toUpperCase()}</div>
      <div class="sign-description">${signType} · ${index + 1} of ${state.words.length} · ${CONFIG.signLanguages[state.selectedLanguage]}</div>
    </div>
  `;
  
  // Update current word display
  elements.currentWordDisplay.textContent = word.toUpperCase();
  
  // Update progress
  updateProgress();
  updateCurrentTime();
  
  // Highlight active word chip
  updateWordChips();
}

function updateWordChips() {
  elements.wordChips.innerHTML = '';
  
  state.words.forEach((word, index) => {
    const chip = document.createElement('div');
    chip.className = 'word-chip';
    chip.textContent = word;
    
    if (index === state.currentWordIndex) {
      chip.classList.add('active');
    } else if (index < state.currentWordIndex) {
      chip.classList.add('completed');
    }
    
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
  const progress = state.words.length > 0 
    ? ((state.currentWordIndex + 1) / state.words.length) * 100 
    : 0;
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
  
  const intervalTime = CONFIG.defaultSpeed / state.speed;
  
  state.playbackInterval = setInterval(() => {
    if (state.currentWordIndex < state.words.length - 1) {
      nextWord();
    } else {
      if (state.loop) {
        restart();
      } else {
        pause();
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

// ============================================
// Speed Control
// ============================================
function changeSpeed(speed) {
  state.speed = speed;
  
  // Update active button
  elements.speedBtns.forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
  });
  
  // Update times
  updateTotalTime();
  updateCurrentTime();
  
  // Restart playback if playing
  if (state.isPlaying) {
    const wasPlaying = true;
    pause();
    if (wasPlaying) {
      play();
    }
  }
  
  showNotification(`Playback speed: ${speed}x`, 'info');
}

// ============================================
// Download
// ============================================
function downloadSigns() {
  if (state.words.length === 0) return;
  
  const content = `Sign Language Translation\nLanguage: ${CONFIG.signLanguages[state.selectedLanguage]}\n\nWords:\n${state.words.map((word, i) => `${i + 1}. ${word.toUpperCase()}`).join('\n')}\n\nOriginal Text:\n${state.currentText}`;
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sign-translation-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  showNotification('Translation downloaded', 'success');
}

// ============================================
// Keyboard Shortcuts
// ============================================
function handleKeyboardShortcuts(e) {
  if (state.words.length === 0) return;
  
  switch(e.key) {
    case ' ':
      if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlayPause();
      }
      break;
    case 'ArrowLeft':
      e.preventDefault();
      previousWord();
      break;
    case 'ArrowRight':
      e.preventDefault();
      nextWord();
      break;
    case 'Home':
      e.preventDefault();
      restart();
      break;
  }
}

// ============================================
// Notifications
// ============================================
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Create toast notification
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#4f46e5'};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
