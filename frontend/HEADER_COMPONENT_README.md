# VOTEX Common Header Component

## Overview
This directory contains shared header components that can be used across all VOTEX pages for consistent navigation and branding.

**Important**: This frontend is designed to run as a static file server on port 8000, completely separate from the Flask backend API on port 5000. All paths are relative to work with the static server.

## Files
- `common-header.js` - JavaScript that dynamically creates the header
- `common-header.css` - Shared header styles

## Server Architecture
- **Frontend**: Port 8000 - Static files served from `frontend/` directory
  - Command: `python -m http.server 8000` (run from frontend/ directory)
  - Serves: HTML, CSS, JS, images - no backend logic
- **Backend**: Port 5000 - Flask API server  
  - Command: `python server.py` (run from home_page/ directory)
  - Serves: API endpoints only - no frontend files

## Usage

### Option 1: Using JavaScript (Dynamic header generation)

1. Include the common header CSS and JS in your page (use relative paths):
```html
<!-- For homepage (frontend/index.html) -->
<link rel="stylesheet" href="common-header.css">
<script src="common-header.js"></script>

<!-- For feature pages (frontend/text_to_speech/index.html) -->
<link rel="stylesheet" href="../common-header.css">
<script src="../common-header.js"></script>
```

2. Call the function at the end of your body or in DOMContentLoaded:
```html
<script>
  // Specify which page is active: 'home', 'text_to_speech', 'speech_to_text', 'translate_and_speak', 'text_to_sign_language'
  insertVotexHeader('text_to_speech');
</script>
```

### Option 2: Manual HTML (Current implementation - RECOMMENDED)

Keep the existing header HTML structure in each page. This is what's currently used across all pages for maximum compatibility and performance.

## Current Header Structure

All pages should use this exact structure:

```html
<header class="site-header">
  <div class="container header-inner">
    <a href="/" class="logo-link">
      <img src="../logo.png" alt="VOTEX logo" class="nav-logo">
      <!-- OR for homepage: -->
      <img src="logo.png" alt="VOTEX logo" class="nav-logo">
    </a>
    <nav class="top-nav">
      <ul>
        <li><a href="/">🏠 Home</a></li>
        <li><a href="/text_to_speech/">Text to speech</a></li>
        <li><a href="/speech_to_text/">Speech to text</a></li>
        <li><a href="/translate_and_speak/">Translate & Speak</a></li>
        <li><a href="/text_to_sign_language/">Text to Sign Language</a></li>
      </ul>
    </nav>
  </div>
</header>
```

## Logo Paths
- **Homepage** (`/frontend/index.html`): `logo.png`
- **Feature pages** (in subdirectories): `../logo.png`

## Active Page Highlighting
Add `class="active"` to the appropriate nav link for the current page.

## Styles Required
Each page must include either:
- The inline styles from homepage, OR
- A local `styles.css` with header styles, OR
- Import `common-header.css`

All pages should have these base styles:
- Body background: `linear-gradient(180deg, #064635 0%, #0b7a72 55%, #e6dcc8 100%)`
- Font family: `'Montserrat'`
- Container max-width: `1200px`
