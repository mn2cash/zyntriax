// Auth UI and page protection. Requires window.supabase (initialized via supabase-client.js)
(function(){
  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  async function getUser(){
    try {
      var res = await window.supabase.auth.getUser();
      return res && res.data ? res.data.user : null;
    } catch(e){
      console.error('getUser error', e);
      return null;
    }
  }

  function setRedirectAfterLogin(){
    try { localStorage.setItem('redirectAfterLogin', window.location.pathname); } catch(_){}
  }
  function consumeRedirectAfterLogin(){
    try {
      var p = localStorage.getItem('redirectAfterLogin');
      if (p) { localStorage.removeItem('redirectAfterLogin'); return p; }
    } catch(_){}
    return null;
  }

  async function renderAuthUI(){
    var container = qs('.lang-cart');
    if (!container) return;
    var user = await getUser();
    if (user) {
      var email = user.email || 'Account';
      container.innerHTML = '<span style="color:var(--muted)">'+ email +'</span> <a href="#" id="signout-btn" class="btn btn-ghost">Sign out</a>';
      var btn = qs('#signout-btn');
      if (btn) btn.addEventListener('click', async function(e){
        e.preventDefault();
        try { await window.supabase.auth.signOut(); } catch(e){ console.error(e); }
        window.location.reload();
      });
    } else {
      container.innerHTML = '<a href="login.html" class="btn btn-ghost">Sign in</a>';
    }
  }

  async function protectIfNeeded(){
    if (!document.body.classList.contains('protected')) return;
    var user = await getUser();
    if (!user) {
      setRedirectAfterLogin();
      window.location.href = 'login.html';
    }
  }

  function init(){
    if (!window.supabase) return;
    // keep UI in sync with auth events
    window.supabase.auth.onAuthStateChange(function(){ renderAuthUI(); });
    renderAuthUI();
    protectIfNeeded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
