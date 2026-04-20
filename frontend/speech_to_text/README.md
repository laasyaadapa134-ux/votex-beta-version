# Speech to Text Component

A modular, standalone speech recognition component for the VOTEX platform.

## 📁 Component Structure

```
speech_to_text/
├── index.html      # Main HTML structure
├── styles.css      # Modular CSS styles
├── script.js       # Speech recognition logic
└── README.md       # Component documentation
```

## 🎯 Features

- **Real-time Speech Recognition**: Convert speech to text instantly
- **Multiple Language Support**: 12+ languages including English, Spanish, French, German, etc.
- **Continuous Recording Mode**: Keep recording without manual restarts
- **Interim Results**: See transcription as you speak
- **Editable Output**: Edit transcribed text directly in the browser
- **Export Options**: Download as TXT or DOC format
- **Visual Feedback**: Audio visualizer and status indicators
- **Copy to Clipboard**: Quick copy functionality
- **Statistics**: Word and character count
- **Keyboard Shortcuts**: Ctrl+S to save, Ctrl+C to copy

## 🏗️ Modular Architecture

### Separation of Concerns

1. **HTML (index.html)**: Structure and markup only
   - Semantic HTML5 elements
   - Accessibility features included
   - No inline styles or scripts

2. **CSS (styles.css)**: All styling in one file
   - CSS variables for easy theming
   - Responsive design with media queries
   - Component-based styling
   - Easy to customize colors and spacing

3. **JavaScript (script.js)**: All functionality modular
   - State management class
   - Event-driven architecture
   - Error handling and validation
   - Configurable settings

### Key Modules in script.js

```javascript
// Configuration
CONFIG = { defaultLanguage, maxTranscriptLength, autoSaveInterval }

// State Management
SpeechToTextState class - Manages application state

// Core Functions
- initSpeechRecognition()    // Setup speech API
- startRecording()            // Start listening
- stopRecording()             // Stop listening
- updateTranscript()          // Update UI

// Text Operations
- copyToClipboard()          // Copy text
- downloadAsText()           // Export as TXT
- downloadAsDoc()            // Export as DOC

// UI Updates
- updateUIForRecording()     // Visual feedback
- showNotification()         // Toast messages
- updateStats()              // Word/char count
```

## 🔧 Configuration

Easily customize the component by modifying `CONFIG` in script.js:

```javascript
const CONFIG = {
  defaultLanguage: 'en-US',      // Change default language
  maxTranscriptLength: 50000,    // Max characters allowed
  autoSaveInterval: 30000        // Auto-save frequency (ms)
};
```

## 🎨 Theming

Customize colors by changing CSS variables in `styles.css`:

```css
:root {
  --primary: #10b981;        /* Primary color */
  --primary-dark: #059669;   /* Hover states */
  --dark: #065f46;           /* Header background */
  --bg: #f8fafc;             /* Background color */
  /* ... more variables */
}
```

## 🌐 Browser Support

- ✅ **Chrome/Edge**: Full support (recommended)
- ✅ **Safari**: Full support
- ⚠️ **Firefox**: Limited support (Web Speech API not fully supported)
- ❌ **IE**: Not supported

## 🔌 Integration

### Adding to Flask Server

```python
@app.route('/speech-to-text')
def speech_to_text():
    return send_from_directory('../speech_to_text', 'index.html')
```

### Static File Serving

The component uses relative paths for CSS/JS, so ensure your server can:
1. Serve the `index.html` from the route
2. Serve `styles.css` and `script.js` from the same directory

## 🐛 Troubleshooting

### Microphone Not Working
- Check browser permissions (should prompt on first use)
- Ensure HTTPS or localhost (required by Web Speech API)
- Verify microphone is connected and working

### Recognition Not Starting
- Check browser console for errors
- Ensure browser supports Web Speech API
- Try refreshing the page

### No Results Appearing
- Speak clearly and at moderate pace
- Check selected language matches spoken language
- Ensure microphone input level is adequate

## 🔒 Privacy & Security

- All speech processing happens in the browser
- Uses browser's built-in Web Speech API
- No data sent to external servers (except browser's speech service)
- Audio is not recorded or stored

## 📝 Future Enhancements

- [ ] Audio recording and playback
- [ ] Speaker diarization (multiple speakers)
- [ ] Timestamp markers
- [ ] Auto-punctuation improvements
- [ ] Custom vocabulary/commands
- [ ] Integration with translation API
- [ ] Save/load sessions
- [ ] PDF export option

## 🤝 Contributing

When modifying this component:

1. **Keep it modular**: Don't mix HTML/CSS/JS
2. **Document changes**: Update this README
3. **Test across browsers**: Especially Chrome and Safari
4. **Maintain accessibility**: Keep ARIA labels and semantic HTML
5. **Follow naming conventions**: Use clear, descriptive names

## 📄 License

Part of the VOTEX project. See main project license.

## 📧 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure browser compatibility
4. Check microphone permissions

---

**Version**: 1.0.0  
**Last Updated**: March 15, 2026  
**Maintainer**: VOTEX Development Team
