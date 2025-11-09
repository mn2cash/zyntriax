// Minimal site JS: hamburger toggle, cookie consent, and a simple cart counter
(function(){
  // Hamburger toggle for small screens
  function initHamburger(){
    var btn = document.querySelector('.hamburger');
    var nav = document.querySelector('.nav');
    var header = document.querySelector('.site-header');
    if(!btn || !nav) return;

    btn.addEventListener('click', function(){
      // toggle a class; CSS controls visual presentation
      var isOpen = nav.classList.contains('mobile-open');
      if (isOpen) {
        nav.classList.remove('mobile-open');
        header && header.classList.remove('mobile-open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        nav.classList.add('mobile-open');
        header && header.classList.add('mobile-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // ensure correct initial state based on viewport: remove mobile-open on desktop
    function onResize(){
      if(window.innerWidth > 900){
        nav.classList.remove('mobile-open');
        header && header.classList.remove('mobile-open');
        // remove inline styles if any
        nav.style.display = '';
      }
    }
    window.addEventListener('resize', onResize);
    onResize();
  }

  // Cookie banner: simple consent stored in localStorage
  function initCookieBanner(){
    var banner = document.querySelector('.cookie-banner');
    if(!banner) return;
    var accepted = localStorage.getItem('zyn_cookie_accepted');
    if(!accepted){ banner.style.display = 'block'; }
    var accept = document.getElementById('cookie-accept');
    var decline = document.getElementById('cookie-decline');
    if(accept) accept.addEventListener('click', function(){ localStorage.setItem('zyn_cookie_accepted', '1'); banner.style.display = 'none'; });
    if(decline) decline.addEventListener('click', function(){ localStorage.setItem('zyn_cookie_accepted', '0'); banner.style.display = 'none'; });
  }

  // Theme toggle: light / dark with persistence
  function initTheme() {
    var KEY = 'zyn_theme'; // 'light' | 'dark' | null (follow system)

    function applyTheme(t) {
      var body = document.body;
      if (!body) return;
      if (t === 'light') {
        body.classList.add('theme-light');
      } else if (t === 'dark') {
        body.classList.remove('theme-light');
      } else {
        // system preference
        var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        if (prefersLight) body.classList.add('theme-light'); else body.classList.remove('theme-light');
      }
      // Notify other parts (particles) of theme change
      try { window.dispatchEvent(new CustomEvent('theme:changed')); } catch (e) { window.dispatchEvent(new Event('theme:changed')); }
    }

    function readStored() {
      try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function store(val) {
      try { if (val === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, val); } catch (e) { }
    }

    // inject toggle into header
    function injectToggle() {
      try {
        var headerInner = document.querySelector('.header-inner');
        if (!headerInner) return null;
        if (document.getElementById('theme-toggle')) return document.getElementById('theme-toggle');

        var btn = document.createElement('button');
        btn.id = 'theme-toggle';
        btn.type = 'button';
        btn.className = 'particles-toggle btn-ghost';

        function updateUI(t) {
          if (t === 'light') { btn.setAttribute('aria-pressed', 'true'); btn.title = 'Switch to dark theme'; btn.innerHTML = '<span aria-hidden="true">🌞</span>'; }
          else { btn.setAttribute('aria-pressed', 'false'); btn.title = 'Switch to light theme'; btn.innerHTML = '<span aria-hidden="true">🌙</span>'; }
        }

        var current = readStored();
        if (!current) {
          current = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
        }
        updateUI(current);

        btn.addEventListener('click', function () {
          var cur = readStored() || (document.body.classList.contains('theme-light') ? 'light' : 'dark');
          var next = cur === 'light' ? 'dark' : 'light';
          store(next);
          applyTheme(next);
          updateUI(next);
        });

        // ensure a utilities container exists on the right side of the header
        var utils = headerInner.querySelector('.header-utils');
        if (!utils) {
          utils = document.createElement('div');
          utils.className = 'header-utils';
          headerInner.appendChild(utils);
        }
        utils.appendChild(btn);
        return btn;
      } catch (e) { console.warn('Could not inject theme toggle', e); return null; }
    }

    // Apply on load
    var stored = readStored();
    applyTheme(stored === null ? null : stored);
    // Inject UI after DOM ready
    injectToggle();

    // Keep in sync with system preference changes if user hasn't explicitly chosen
    if (!readStored() && window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: light)');
      try { mq.addEventListener ? mq.addEventListener('change', function(){ applyTheme(null); }) : mq.addListener(function(){ applyTheme(null); }); } catch(e){}
    }
  }

  // Scroll reveal: use IntersectionObserver to add .is-visible to elements with .reveal or data-reveal
  function initScrollReveal() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var els = [].slice.call(document.querySelectorAll('[data-reveal], .reveal'));
    if (!els.length) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // if we only want one-time reveal, unobserve
          try { io.unobserve(entry.target); } catch(e){}
        }
      });
    }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    els.forEach(function(el){
      // if element already visible on load, mark it
      if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-visible'); }
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // Small load animations: add .animate-pop to hero headings / important CTAs
  function initLoadAnimations() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var heroTitle = document.querySelector('.hero h1, .page-hero h1');
    var lead = document.querySelector('.lead');
    if (heroTitle) { heroTitle.classList.add('animate-pop'); }
    if (lead) { setTimeout(function(){ lead.classList.add('is-visible'); }, 220); }
    // small stagger on cards
    var cards = [].slice.call(document.querySelectorAll('.card'));
    cards.forEach(function(c, i){ setTimeout(function(){ c.classList.add('animate-pop'); }, 220 + i*80); });
  }

  // Button hover micro-interactions (keyboard accessible focus styles already exist)
  function initMicroInteractions() {
    // Add subtle pointerenter transform for buttons
    document.addEventListener('pointerenter', function(e){
      var btn = e.target.closest('.btn');
      if (!btn) return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      btn.style.transform = 'translateY(-3px)';
    }, true);
    document.addEventListener('pointerleave', function(e){
      var btn = e.target.closest('.btn');
      if (!btn) return;
      btn.style.transform = '';
    }, true);
  }

  // Minimal cart: store count in localStorage and update Cart link text
  function initCart(){
    var KEY = 'zyn_cart_count';
    function getCount(){
      var raw = localStorage.getItem(KEY);
      var parsed = parseInt(raw || '0', 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    function setCount(n){
      var next = parseInt(n, 10);
      if (isNaN(next) || next < 0) next = 0;
      localStorage.setItem(KEY, String(next));
      updateCartUI(next);
    }
    function updateCartUI(count){
      var value = typeof count === 'number' ? count : getCount();
      if (isNaN(value) || value < 0) value = 0;
      document.querySelectorAll('.cart').forEach(function(el){
        var label = el.querySelector('.cart-label');
        if (!label) return;
        label.textContent = value > 0 ? 'Cart (' + value + ')' : 'Cart';
      });
    }
    // Add-to-cart buttons inside price cards
    document.addEventListener('click', function(e){
      var btn = e.target.closest('button');
      if (!btn) return;
      var text = (btn.textContent || '').trim().toLowerCase();
      if (text.indexOf('add to cart') !== -1){
        var packageId = btn.getAttribute('data-package');
        if (!packageId) return;
        
        // Add to cart items
        var CART_ITEMS_KEY = 'zyn_cart_items';
        try {
          var items = JSON.parse(localStorage.getItem(CART_ITEMS_KEY) || '[]');
          items.push({ id: packageId, addedAt: new Date().toISOString() });
          localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));
        } catch(e){
          console.error('Failed to add item to cart:', e);
        }
        
        // Update counter
        var c = getCount();
        setCount(c + 1);
        
        // Visual feedback
        var original = btn.textContent;
        btn.textContent = 'Added!';
        setTimeout(function(){ btn.textContent = original; }, 1200);
      }
    });

    updateCartUI(getCount());
  }

  document.addEventListener('DOMContentLoaded', function(){
    initHamburger();
    initCookieBanner();
    initCart();
    initTheme();
    initScrollReveal();
    initLoadAnimations();
    initMicroInteractions();
    // initialize live chat (if available)
    try { if (typeof initLiveChat === 'function') initLiveChat(); } catch(e) { /* ignore */ }
  });
})();
