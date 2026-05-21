(function(){
  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => Array.from(root.querySelectorAll(s));

  const progress = qs('.scroll-progress');
  const navbar = qs('.navbar');
  const floating = qs('.floating-cta');

  function updateScrollUI(){
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if(progress) progress.style.width = pct + '%';
    if(navbar) navbar.classList.toggle('is-scrolled', window.scrollY > 24);
    if(floating) floating.classList.toggle('is-visible', pct > 45);
  }
  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, {passive:true});

  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = qs(link.getAttribute('href'));
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  const cursor = qs('.cursor');
  const follower = qs('.cursor-follower');
  if(cursor && follower && window.matchMedia('(pointer:fine)').matches){
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let fx = x, fy = y;
    window.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cursor.style.left = x + 'px'; cursor.style.top = y + 'px'; });
    function tick(){
      fx += (x - fx) * .16; fy += (y - fy) * .16;
      follower.style.left = fx + 'px'; follower.style.top = fy + 'px';
      requestAnimationFrame(tick);
    }
    tick();
    qsa('a,button,input,select,textarea,.bento-card,.use-card,.faq-button').forEach(el => {
      el.addEventListener('mouseenter', () => follower.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => follower.classList.remove('is-hover'));
    });
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        if(entry.target.classList.contains('counter')) animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.17, rootMargin:'0px 0px -40px 0px'});
  qsa('.animate,.reveal,.counter').forEach(el => io.observe(el));

  function animateCounter(el){
    if(el.dataset.done) return;
    el.dataset.done = 'true';
    const target = parseFloat(el.dataset.target || '0');
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1300;
    const start = performance.now();
    const decimals = (el.dataset.target || '').includes('.') ? 1 : 0;
    function frame(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = target * eased;
      el.textContent = prefix + value.toFixed(decimals).replace(/\.0$/, '') + suffix;
      if(p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  qsa('.faq-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const panel = qs('.faq-panel', item);
      const isOpen = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      panel.style.maxHeight = isOpen ? panel.scrollHeight + 'px' : 0;
    });
  });

  qsa('.lead-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const useCase = data.get('caso') || document.body.dataset.case || 'Debytex';
      localStorage.setItem('debytexLastUseCase', useCase);
      const btn = qs('button[type="submit"]', form);
      if(btn){ btn.disabled = true; btn.textContent = 'Enviando solicitud…'; }
      const overlay = qs('.thankyou-overlay');
      if(overlay){ overlay.classList.add('is-visible'); }
      setTimeout(() => {
        window.location.href = 'thankyou.html?case=' + encodeURIComponent(useCase);
      }, 900);
    });
  });

  const tyLabel = qs('#ty-case-label');
  if(tyLabel){
    const params = new URLSearchParams(window.location.search);
    const label = params.get('case') || localStorage.getItem('debytexLastUseCase') || 'tu solicitud';
    tyLabel.textContent = label;
  }
})();

(function(){
  const parallaxItems = Array.from(document.querySelectorAll('[data-parallax]'));
  if(!parallaxItems.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function parallax(){
    parallaxItems.forEach(el => {
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const progress = (rect.top - viewport * .5) / viewport;
      el.style.transform = `translate3d(0, ${progress * -18}px, 0)`;
    });
  }
  parallax();
  window.addEventListener('scroll', parallax, {passive:true});
})();


(function(){
  const items = Array.from(document.querySelectorAll('.typewriter'));
  if(!items.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  items.forEach((el) => {
    let phrases = [];
    try { phrases = JSON.parse(el.getAttribute('data-type') || '[]'); }
    catch(e) { phrases = (el.getAttribute('data-type') || '').split('|').filter(Boolean); }
    if(!phrases.length) return;
    if(reduce){ el.textContent = phrases[0]; return; }
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const typeSpeed = 42;
    const deleteSpeed = 24;
    const hold = 1450;
    function run(){
      const phrase = phrases[phraseIndex];
      el.textContent = phrase.slice(0, charIndex);
      if(!deleting && charIndex < phrase.length){
        charIndex++;
        setTimeout(run, typeSpeed);
        return;
      }
      if(!deleting && charIndex === phrase.length){
        deleting = true;
        setTimeout(run, hold);
        return;
      }
      if(deleting && charIndex > 0){
        charIndex--;
        setTimeout(run, deleteSpeed);
        return;
      }
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(run, 280);
    }
    run();
  });
})();
