// Common Header Component for VOTEX
// This creates and inserts the header navigation into the page

function createVotexHeader(activePage) {
  const header = document.createElement('header');
  header.className = 'site-header';
  
  const container = document.createElement('div');
  container.className = 'container header-inner';
  
  // Logo
  const logoLink = document.createElement('a');
  logoLink.href = '/';
  logoLink.className = 'logo-link';
  
  const logo = document.createElement('img');
  // Use relative path: 'logo.png' for homepage, '../logo.png' for feature pages
  logo.src = activePage === 'home' ? 'logo.png' : '../logo.png';
  logo.alt = 'VOTEX logo';
  logo.className = 'nav-logo';
  logoLink.appendChild(logo);
  
  // Navigation
  const nav = document.createElement('nav');
  nav.className = 'top-nav';
  
  const ul = document.createElement('ul');
  
  const navItems = [
    { href: '/', text: '🏠 Home', page: 'home' },
    { href: '/text_to_speech/', text: 'Text to speech', page: 'text_to_speech' },
    { href: '/speech_to_text/', text: 'Speech to text', page: 'speech_to_text' },
    { href: '/translate_and_speak/', text: 'Translate & Speak', page: 'translate_and_speak' },
    { href: '/text_to_sign_language/', text: 'Text to Sign Language', page: 'text_to_sign_language' }
  ];
  
  navItems.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.text;
    if (item.page === activePage) {
      a.className = 'active';
    }
    li.appendChild(a);
    ul.appendChild(li);
  });
  
  nav.appendChild(ul);
  container.appendChild(logoLink);
  container.appendChild(nav);
  header.appendChild(container);
  
  return header;
}

// Insert header at the beginning of body
function insertVotexHeader(activePage) {
  const header = createVotexHeader(activePage);
  document.body.insertBefore(header, document.body.firstChild);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createVotexHeader, insertVotexHeader };
}
