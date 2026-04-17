document.addEventListener('DOMContentLoaded', ()=>{
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', ()=> mainNav.classList.toggle('show-nav'));
  }

  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.name?.value?.trim();
      if (feedback) feedback.textContent = `Thanks ${name || 'there'} — we received your message.`;
      form.reset();
    });
  }
});