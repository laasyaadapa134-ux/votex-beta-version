# VOTEX Project Structure

## 📂 Directory Layout

```
VoiceotTextConverter/
│
├── home_page/                    # Main application server
│   ├── server.py                 # Flask server (main entry point)
│   ├── app.py                    # Translation API handler
│   ├── requirements.txt          # Python dependencies
│   ├── home.html                 # Home page (primary)
│   ├── home_page_new.html        # Home page (alternative)
│   ├── votex.css                 # Home page styles
│   ├── votex.js                  # Home page scripts
│   ├── votex-modern.css          # Modern theme styles
│   ├── votex-modern.js           # Modern theme scripts
│   └── backups/                  # Backup files
│
├── text_to_speech/               # Text-to-Speech Component
│   └── index.html                # TTS interface
│
├── speech_to_text/               # Speech-to-Text Component (NEW!)
│   ├── index.html                # Main HTML structure
│   ├── styles.css                # Component styles
│   ├── script.js                 # Speech recognition logic
│   └── README.md                 # Component documentation
│
└── images/                       # Image assets
```

## 🚀 Running the Application

### Start the Server

```powershell
cd home_page
python server.py
```

Server runs on: **http://127.0.0.1:5000**

### Available Routes

- `/` - Home page
- `/text-to-speech` - Text-to-Speech converter
- `/speech-to-text` - Speech-to-Text converter (NEW!)
- `/translate` - Translation API endpoint

## 🎯 Modular Component Design

### Speech to Text Component

**Location**: `speech_to_text/`

**Benefits of Modularity**:
1. ✅ **Self-contained**: All files in one directory
2. ✅ **Easy to maintain**: Clear separation of concerns
3. ✅ **Portable**: Can be moved or reused
4. ✅ **Debuggable**: Isolated functionality
5. ✅ **Testable**: Can be tested independently

**Files**:
- `index.html` - Structure only, no inline styles/scripts
- `styles.css` - All styling, uses CSS variables
- `script.js` - All logic, uses modular functions
- `README.md` - Complete documentation

### How to Add New Components

1. Create component folder at root level:
   ```
   new_component/
   ├── index.html
   ├── styles.css
   ├── script.js
   └── README.md
   ```

2. Add route to `server.py`:
   ```python
   @app.route('/new-component')
   def new_component():
       return send_from_directory('../new_component', 'index.html')
   ```

3. Update navigation in home pages:
   ```html
   <li><a href="/new-component">New Component</a></li>
   ```

4. Restart server (or auto-reload in debug mode)

## 🔧 Configuration

### Server Settings

Edit `server.py`:
```python
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',  # Listen on all interfaces
        port=5000,        # Port number
        debug=True        # Enable auto-reload
    )
```

### Component Settings

Each component has its own config in its JS file:
```javascript
const CONFIG = {
  // Component-specific settings
};
```

## 📦 Dependencies

Install all required packages:
```powershell
pip install -r requirements.txt
```

**Required packages**:
- Flask >= 2.0
- requests >= 2.25
- python-dotenv >= 0.19
- flask-cors >= 3.0

## 🌐 Browser Compatibility

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Text to Speech | ✅ | ✅ | ✅ | ✅ |
| Speech to Text | ✅ | ✅ | ✅ | ⚠️ |
| Translation | ✅ | ✅ | ✅ | ✅ |

## 🐛 Debugging

### Common Issues

**404 Errors on Links**:
- Check route is added to `server.py`
- Verify file paths are correct (use `../component_name`)
- Ensure server restarted after route changes

**Component Not Loading**:
- Check browser console for errors
- Verify CSS/JS files are in correct location
- Check file paths in HTML (should be relative)

**Server Won't Start**:
- Check Python is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check port 5000 is not in use

### Debug Mode

Server runs in debug mode by default:
- Auto-reloads on file changes
- Shows detailed error messages
- Accessible on local network

## 🎨 Theming

All components use consistent color scheme defined in CSS variables:

```css
:root {
  --primary: #10b981;       /* Green */
  --primary-dark: #059669;  /* Dark green */
  --dark: #065f46;          /* Very dark green */
  --bg: #f8fafc;            /* Light gray */
  --surface: #ffffff;       /* White */
}
```

Change these in each component's CSS file for consistent theming.

## 📝 Best Practices

### When Adding Components

1. **Follow the structure**: Use same file layout
2. **Document thoroughly**: Include README.md
3. **Keep it modular**: Separate HTML/CSS/JS
4. **Use CSS variables**: For easy theming
5. **Handle errors**: Add try-catch and user feedback
6. **Test responsively**: Works on mobile
7. **Add comments**: Explain complex logic
8. **Update this doc**: Keep structure overview current

### When Modifying Components

1. **Test after changes**: Verify functionality
2. **Check other browsers**: Cross-browser testing
3. **Update README**: Document changes
4. **Keep backups**: Before major changes
5. **Use git**: Version control (recommended)

## 🔒 Security Notes

- Server runs in debug mode (development only)
- Use HTTPS in production
- Never commit API keys
- Validate all user inputs
- Use environment variables for secrets

## 📧 Support & Maintenance

For issues:
1. Check browser console
2. Review server logs
3. Check component README
4. Verify file paths and routes
5. Test in different browser

---

**Last Updated**: March 15, 2026  
**Version**: 1.2.0  
**Components**: Home Page, Text-to-Speech, Speech-to-Text
