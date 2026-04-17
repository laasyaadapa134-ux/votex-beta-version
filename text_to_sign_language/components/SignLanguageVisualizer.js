/**
 * Sign Language Visualizer Component
 * Displays sign language animations using SVG hand positions and GIFs
 */

class SignLanguageVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentLanguage = 'asl';
    this.displayMode = 'animation'; // 'animation', 'static', 'video'
    this.cache = new Map();
  }

  /**
   * Display a word in sign language
   * @param {string} word - The word to display
   * @param {string} language - Sign language type (asl, bsl, etc.)
   */
  async displayWord(word, language = 'asl') {
    this.currentLanguage = language;
    const normalizedWord = word.toLowerCase().trim();
    
    // Check if we have a direct sign for this word
    const signData = await this.getSignData(normalizedWord, language);
    
    if (signData) {
      this.renderSign(signData, word);
    } else {
      // Fingerspell the word
      this.fingerspellWord(word, language);
    }
  }

  /**
   * Display multiple words as a sequence of signs
   * @param {Array<string>} words - Array of words to display
   * @param {string} language - Sign language type
   */
  async displayWordSequence(words, language = 'asl') {
    this.currentLanguage = language;
    this.container.innerHTML = '<div class="simple-sign-display"></div>';
    const displayContainer = this.container.querySelector('.simple-sign-display');
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const normalizedWord = word.toLowerCase().trim();
      const signData = await this.getSignData(normalizedWord, language);
      
      const signElement = this.createSimpleSign(signData, word, i);
      displayContainer.innerHTML += signElement;
    }
    
    // Attach video listeners
    this.attachSimpleListeners();
  }

  /**
   * Create a simple clean sign display
   */
  createSimpleSign(signData, word, index) {
    const videoContent = signData && signData.videoUrl 
      ? this.createSimpleVideo(signData, word)
      : this.createSimpleEmoji(signData || {}, word);
    
    return `
      <div class="simple-sign-item" data-index="${index}">
        ${videoContent}
        <div class="simple-word-label">${word}</div>
      </div>
    `;
  }

  /**
   * Create simple video player (no style switcher)
   */
  createSimpleVideo(signData, word) {
    const videoUrl = signData.videoUrl;
    
    return `
      <div class="simple-video-wrapper">
        <video 
          class="simple-sign-video"
          src="${videoUrl}"
          autoplay
          loop
          muted
          playsinline
          preload="auto"
          crossorigin="anonymous"
        >
          Your browser does not support video.
        </video>
        <div class="simple-loading">
          <div class="simple-spinner"></div>
        </div>
        <div class="simple-fallback" style="display:none;">
          ${this.createSimpleEmoji(signData, word)}
        </div>
      </div>
    `;
  }

  /**
   * Create simple emoji fallback
   */
  createSimpleEmoji(signData, word) {
    const emoji = this.getWordEmoji(word);
    
    return `
      <div class="simple-emoji-display">
        <div class="simple-emoji">${emoji}</div>
        <div class="simple-hands">
          <span class="hand-left">👈</span>
          <span class="hand-right">👉</span>
        </div>
      </div>
    `;
  }

  /**
   * Attach listeners for simple display
   */
  attachSimpleListeners() {
    const signItems = this.container.querySelectorAll('.simple-sign-item');
    
    signItems.forEach(item => {
      const video = item.querySelector('.simple-sign-video');
      const wrapper = item.querySelector('.simple-video-wrapper');
      const fallback = item.querySelector('.simple-fallback');
      const loading = item.querySelector('.simple-loading');
      
      if (!video) return;
      
      let videoErrored = false;
      
      video.addEventListener('loadstart', () => {
        if (loading) loading.style.display = 'flex';
      });
      
      video.addEventListener('canplay', () => {
        if (!videoErrored && loading) {
          loading.style.display = 'none';
          video.play().catch(err => console.log('Autoplay prevented:', err));
        }
      });
      
      video.addEventListener('error', () => {
        videoErrored = true;
        if (loading) loading.style.display = 'none';
        if (video) video.style.display = 'none';
        if (fallback) {
          fallback.style.display = 'flex';
        }
      });
    });
  }

  /**
   * Get sign data for a word
   */
  async getSignData(word, language) {
    const cacheKey = `${language}_${word}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Check our comprehensive sign database
    const signData = ASL_SIGN_DATABASE[word];
    
    if (signData) {
      this.cache.set(cacheKey, signData);
      return signData;
    }
    
    return null;
  }

  /**
   * Render a sign with animation
   */
  renderSign(signData, word) {
    // Create illustrated video performing the sign
    const videoContent = this.createIllustratedVideo(signData, word);
    
    const signHTML = `
      <div class="sign-display-container">
        <div class="sign-visual">
          ${videoContent}
        </div>
        <div class="sign-info">
          <div class="sign-word">${word.toUpperCase()}</div>
          <div class="sign-description">${signData.description || 'Common sign'}</div>
          <div class="sign-language-badge">${this.getLanguageName(this.currentLanguage)}</div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = signHTML;
    this.animateSign();
    this.attachStyleListeners();
  }

  /**
   * Attach event listeners for style buttons
   */
  attachStyleListeners() {
    const styleButtons = this.container.querySelectorAll('.style-btn');
    const video = this.container.querySelector('.sign-video');
    const wrapper = this.container.querySelector('.video-filters-wrapper');
    const fallback = this.container.querySelector('.video-fallback');
    
    if (!video) return;
    
    let videoErrored = false;
    
    // Handle video loading
    video.addEventListener('loadstart', () => {
      wrapper.classList.add('loading');
    });
    
    video.addEventListener('canplay', () => {
      if (!videoErrored) {
        wrapper.classList.remove('loading');
        video.play().catch(err => {
          console.log('Autoplay prevented:', err);
          // Try to play on first interaction
          document.addEventListener('click', () => video.play(), { once: true });
        });
      }
    });
    
    video.addEventListener('error', () => {
      videoErrored = true;
      wrapper.classList.remove('loading');
      
      // Hide video and show animated emoji fallback
      video.style.display = 'none';
      if (fallback) {
        fallback.style.display = 'flex';
        fallback.style.width = '100%';
        fallback.style.height = '100%';
      }
      
      // Hide style selector since we're showing emoji
      const styleSelector = this.container.querySelector('.style-selector');
      if (styleSelector) {
        styleSelector.style.display = 'none';
      }
    });
    
    // Handle style switching
    styleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (videoErrored) return; // Don't switch styles if showing fallback
        
        const style = btn.dataset.style;
        
        // Remove all style classes
        video.classList.remove('cartoon-style', 'sketch-style', 'neon-style', 'original-style');
        
        // Add selected style
        video.classList.add(`${style}-style`);
        
        // Update active button
        styleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  /**
   * Create placeholder for missing signs
   */
  createPlaceholder(word) {
    return `
      <div class="sign-placeholder">
        <div class="placeholder-icon">🤟</div>
        <p>Sign for "${word}" not available</p>
        <small>Fingerspelling will be used</small>
      </div>
    `;
  }

  /**
   * Create illustrated video player with artistic filters
   */
  createIllustratedVideo(signData, word) {
    const videoUrl = signData.videoUrl;
    
    if (!videoUrl) {
      return this.createAnimatedEmoji(signData, word);
    }
    
    return `
      <div class="illustrated-video-container">
        <div class="video-filters-wrapper loading">
          <video 
            class="sign-video cartoon-style"
            src="${videoUrl}"
            autoplay
            loop
            muted
            playsinline
            preload="auto"
            crossorigin="anonymous"
          >
            Your browser does not support video.
          </video>
          <div class="loading-overlay">
            <div class="loader-spinner"></div>
            <p>Loading sign...</p>
          </div>
          <div class="video-fallback" style="display:none;">
            ${this.createAnimatedEmoji(signData, word)}
          </div>
        </div>
        <div class="style-selector">
          <button class="style-btn active" data-style="cartoon" title="Cartoon Style">🎨</button>
          <button class="style-btn" data-style="sketch" title="Sketch Style">✏️</button>
          <button class="style-btn" data-style="neon" title="Neon Style">✨</button>
          <button class="style-btn" data-style="original" title="Original">📹</button>
        </div>
      </div>
    `;
  }

  /**
   * Create animated emoji-based illustration as fallback
   */
  createAnimatedEmoji(signData, word) {
    const description = signData?.description || `Sign for ${word}`;
    const position = signData?.position || 'neutral';
    
    // Get appropriate emoji for the word
    const emoji = this.getWordEmoji(word);
    
    return `
      <div class="emoji-illustration">
        <div class="emoji-sign-display ${position}-position">
          <div class="emoji-icon animate-sign">${emoji}</div>
          <div class="emoji-hands">
            <div class="hand-emoji left">👈</div>
            <div class="hand-emoji right">👉</div>
          </div>
        </div>
        <div class="emoji-label">${word.toUpperCase()}</div>
        <div class="emoji-description">${description}</div>
      </div>
    `;
  }

  /**
   * Get relevant emoji for a word
   */
  getWordEmoji(word) {
    const emojiMap = {
      'hello': '👋', 'hi': '👋', 'goodbye': '👋', 'bye': '👋',
      'please': '🙏', 'thank': '🙏', 'thanks': '🙏', 'sorry': '😔',
      'yes': '✅', 'no': '❌', 'maybe': '🤔',
      'i': '👤', 'me': '👤', 'you': '👥', 'we': '👥', 'they': '👥',
      'what': '❓', 'who': '❓', 'where': '📍', 'when': '⏰', 'why': '❓', 'how': '❓',
      'eat': '🍴', 'drink': '🥤', 'sleep': '😴', 'go': '🚶', 'come': '🚶',
      'want': '✋', 'need': '✋', 'help': '🤝', 'know': '🧠', 'think': '💭',
      'understand': '💡', 'learn': '📚', 'work': '💼', 'play': '🎮',
      'like': '❤️', 'love': '💕', 'see': '👁️', 'look': '👀', 'hear': '👂',
      'talk': '💬', 'say': '💬', 'good': '👍', 'bad': '👎',
      'happy': '😊', 'sad': '😢', 'tired': '😴', 'hot': '🔥', 'cold': '❄️',
      'big': '🔲', 'small': '▪️', 'water': '💧', 'food': '🍴',
      'home': '🏠', 'house': '🏠', 'school': '🎓', 'family': '👨‍👩‍👧‍👦',
      'friend': '👥', 'mother': '👩', 'father': '👨', 'time': '⏰',
      'day': '☀️', 'night': '🌙', 'today': '📅', 'tomorrow': '📆', 'yesterday': '📆',
      'fine': '👌', 'ok': '👌', 'great': '⭐', 'wonderful': '🌟',
      'are': '✋', 'is': '✋', 'am': '✋', 'have': '🤲', 'has': '🤲',
      'can': '💪', 'will': '👉', 'do': '✊', 'make': '🔨', 'get': '🤏', 'give': '🎁'
    };
    
    return emojiMap[word.toLowerCase()] || '🤟';
  }

  /**
   * Get hand icon based on handshape
   */
  getHandIcon(handshape) {
    const icons = {
      'open': '✋',
      'fist': '✊',
      'point': '☝️',
      'peace': '✌️',
      'ok': '👌',
      'thumbs-up': '👍',
      'wave': '👋',
      'pray': '🙏',
      'love': '🤟',
      'call': '🤙',
      'pinch': '🤏',
      'claw': '🖐️',
      'r': '✌️'
    };
    return icons[handshape] || '✋';
  }

  /**
   * Fingerspell a word letter by letter
   */
  fingerspellWord(word, language) {
    const letters = word.toLowerCase().split('').filter(c => /[a-z]/.test(c));
    
    const fingerspellHTML = `
      <div class="fingerspell-container">
        <div class="fingerspell-letters">
          ${letters.map((letter, index) => `
            <div class="fingerspell-letter" data-letter="${letter}" style="animation-delay: ${index * 0.02}s">
              ${this.getFingerSpellHandSVG(letter)}
              <div class="letter-label">${letter.toUpperCase()}</div>
            </div>
          `).join('')}
        </div>
        <div class="sign-info">
          <div class="sign-word">${word.toUpperCase()}</div>
          <div class="sign-description">Fingerspelled</div>
          <div class="sign-language-badge">${this.getLanguageName(language)}</div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = fingerspellHTML;
  }

  /**
   * Get SVG for a hand shape
   */
  getHandSVG(handshape, position) {
    // This would contain actual SVG hand drawings
    // For now, return a styled representation
    const handShapes = {
      'fist': '✊',
      'open': '✋',
      'point': '☝️',
      'peace': '✌️',
      'ok': '👌',
      'thumbs-up': '👍',
      'thumbs-down': '👎',
      'pinch': '🤏',
      'call': '🤙',
      'rock': '🤘',
      'love': '🤟',
      'wave': '👋',
      'pray': '🙏',
      'clap': '👏'
    };
    
    return `
      <div class="hand-svg" data-shape="${handshape}">
        <span class="hand-emoji">${handShapes[handshape] || '🤟'}</span>
      </div>
    `;
  }

  /**
   * Get sign illustration (better than emoji)
   */
  getSignIllustration(signData) {
    // Create a visual representation using shapes and text
    return `
      <div class="sign-visual-container">
        <div class="hand-shape ${signData.handshape || 'open'}" data-position="${signData.position || 'neutral'}">
          <div class="hand-icon">👐</div>
          <div class="position-label">${this.formatPosition(signData.position)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Format position label
   */
  formatPosition(position) {
    const positions = {
      'forehead': 'At Forehead',
      'chin': 'At Chin',
      'chest': 'At Chest',
      'neutral': 'Neutral',
      'side': 'To Side',
      'forward': 'Forward'
    };
    return positions[position] || position;
  }

  /**
   * Get fingerspelling hand SVG for a letter
   */
  getFingerSpellHandSVG(letter) {
    // Use letter blocks instead of hand symbols for clarity
    return `
      <div class="fingerspell-hand">
        <div class="letter-block">${letter.toUpperCase()}</div>
      </div>
    `;
  }

  /**
   * Get movement arrow indicator
   */
  getMovementArrow(movement) {
    const arrows = {
      'up': '⬆️',
      'down': '⬇️',
      'left': '⬅️',
      'right': '➡️',
      'forward': '⏩',
      'backward': '⏪',
      'circular': '🔄',
      'shake': '〰️',
      'tap': '👉',
      'wave': '👋'
    };
    
    return `<span class="movement-arrow">${arrows[movement] || '↔️'}</span>`;
  }

  /**
   * Animate the sign display
   */
  animateSign() {
    const signVisual = this.container.querySelector('.sign-visual');
    if (signVisual) {
      signVisual.classList.add('sign-appear');
    }
  }

  /**
   * Get full language name
   */
  getLanguageName(code) {
    const languages = {
      'asl': 'American Sign Language (ASL)',
      'bsl': 'British Sign Language (BSL)',
      'auslan': 'Australian Sign Language',
      'isl': 'Indian Sign Language (ISL)',
      'jsl': 'Japanese Sign Language (JSL)',
      'fsl': 'French Sign Language (LSF)',
      'gsl': 'German Sign Language (DGS)',
      'csl': 'Chinese Sign Language',
      'rsl': 'Russian Sign Language',
      'libras': 'Brazilian Sign Language (Libras)'
    };
    
    return languages[code] || code.toUpperCase();
  }

  /**
   * Clear the display
   */
  clear() {
    this.container.innerHTML = `
      <div class="video-placeholder">
        <div class="placeholder-content">
          <div class="placeholder-icon">🤟</div>
          <h3>Start Translating</h3>
          <p>Type or speak text to see sign language demonstrations</p>
        </div>
      </div>
    `;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SignLanguageVisualizer;
}
