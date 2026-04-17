document.addEventListener('DOMContentLoaded', ()=>{
  // Reveal hero lines with stagger
  const subs = document.querySelectorAll('.hero-sub');
  subs.forEach((el,i)=>{
    setTimeout(()=> el.classList.add('revealed'), 220 + i*160);
  });

  // Small parallax for illustration and hex background on mouse move
  const hero = document.querySelector('.container-hero');
  const ill = document.querySelector('.illustration');
  const hex = document.querySelector('.hex-bg');
  if (hero && (ill || hex)){
    hero.addEventListener('mousemove', e=>{
      const r = hero.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      if (ill) ill.style.transform = `translate(${cx*-12}px, ${cy*-8}px)`;
      if (hex) hex.style.transform = `translate(${cx*10}px, ${cy*6}px) rotate(${cx*2}deg)`;
    });
    hero.addEventListener('mouseleave', ()=>{
      if (ill) ill.style.transform = '';
      if (hex) hex.style.transform = '';
    });
  }

  // Soft loop for some SVG parts (toggle .floating class to animate via CSS)
  const floats = document.querySelectorAll('.hex-svg polygon, .hex-svg polygon.floating');
  floats.forEach((p,i)=>{
    // stagger addition for subtle offset
    setTimeout(()=> p.classList && p.classList.add('floating'), i*120);
  });

  // Optional: intersection observer to animate footer or other sections
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting) entry.target.classList.add('inview');
    });
  },{threshold:0.2});
  document.querySelectorAll('.spacer, .site-footer').forEach(el=>io.observe(el));
});
