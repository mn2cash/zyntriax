// Minimal site JS: hamburger toggle, cookie consent, and a simple cart counter
(function(){
  // Hamburger toggle for small screens
  function initHamburger(){
    var btn = document.querySelector('.hamburger');
    var nav = document.querySelector('.nav');
    if(!btn || !nav) return;
    btn.addEventListener('click', function(){
      var isHidden = nav.style.display === 'none' || getComputedStyle(nav).display === 'none';
      nav.style.display = isHidden ? 'flex' : 'none';
    });
    // ensure correct initial state based on viewport
    function onResize(){
      if(window.innerWidth > 900){ nav.style.display = 'flex'; }
      else if(!nav.style.display){ nav.style.display = 'none'; }
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

  // Minimal cart: store count in localStorage and update Cart link text
  function initCart(){
    var KEY = 'zyn_cart_count';
    function getCount(){ return parseInt(localStorage.getItem(KEY) || '0', 10); }
    function setCount(n){ localStorage.setItem(KEY, String(n)); updateCartUI(); }
    function updateCartUI(){
      var cartLinks = document.querySelectorAll('.cart');
      cartLinks.forEach(function(el){
        if(getCount() > 0) el.textContent = 'Cart (' + getCount() + ')';
        else el.textContent = 'Cart';
      });
    }
    // Add-to-cart buttons inside price cards
    document.addEventListener('click', function(e){
      var btn = e.target.closest('button');
      if(!btn) return;
      var text = (btn.textContent || '').trim().toLowerCase();
      if(text.indexOf('add to cart') !== -1){
        var c = getCount();
        setCount(c + 1);
        // small feedback
        btn.textContent = 'Added';
        setTimeout(function(){ btn.textContent = btn.classList.contains('btn-primary') ? 'Add to cart' : 'Add to cart'; }, 900);
      }
    });

    updateCartUI();
  }

  document.addEventListener('DOMContentLoaded', function(){
    initHamburger();
    initCookieBanner();
    initCart();
  });
})();
