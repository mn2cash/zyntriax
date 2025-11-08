// assets/js/particles-config.js - Animated particle background
// This file builds a responsive config and safely (re)initializes Particles.js.
(function () {
  'use strict';

  // Local storage key for user preference
  var LS_KEY = 'particlesEnabled';

  // Helper: build a config based on viewport size and mode to improve performance on small screens
  function buildConfig(mode) {
    var w = window.innerWidth || document.documentElement.clientWidth;
    var isMobile = w <= 768;
    var isTablet = w > 768 && w <= 1200;

    var baseCount = isMobile ? 25 : (isTablet ? 45 : 80);
    var particleCount = baseCount;
    var enableLineLinked = !isMobile; // lines are heavier on mobile
    var linkDistance = isMobile ? 100 : 150;

    if (mode === 'reduced') {
      particleCount = Math.max(8, Math.floor(baseCount * 0.2));
      enableLineLinked = false;
    } else if (mode === 'minimal') {
      particleCount = 6;
      enableLineLinked = false;
    }

    return {
      particles: {
        number: { value: particleCount, density: { enable: true, value_area: 800 } },
        color: { value: '#6ddcff' },
        shape: { type: 'circle', stroke: { width: 0, color: '#000000' }, polygon: { nb_sides: 5 } },
        opacity: { value: 0.55, random: false, anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false } },
        size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
        line_linked: { enable: enableLineLinked, distance: linkDistance, color: '#7f60ff', opacity: enableLineLinked ? 0.38 : 0, width: enableLineLinked ? 1 : 0 },
        move: { enable: true, speed: 2.2, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false, attract: { enable: false, rotateX: 600, rotateY: 1200 } }
      },
      interactivity: {
        detect_on: 'window',
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
        modes: { grab: { distance: 400, line_linked: { opacity: 1 } }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 300, duration: 0.6 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } }
      },
      retina_detect: true
    };
  }

  // Safely destroy any existing Particle instances created by particles.js
  function destroyExisting() {
    if (window.pJSDom && window.pJSDom.length) {
      try {
        window.pJSDom.forEach(function (p) {
          if (p && p.pJS && p.pJS.fn && p.pJS.fn.vendors && typeof p.pJS.fn.vendors.destroypJS === 'function') {
            p.pJS.fn.vendors.destroypJS();
          }
        });
      } catch (e) {
        console.warn('Could not destroy existing particles instance', e);
      }
      window.pJSDom = [];
    }
  }

  // Read saved user preference (returns null if not set)
  function getUserPref() {
    try {
      var v = localStorage.getItem(LS_KEY);
      if (v === null) return null;
      return v === 'true';
    } catch (e) {
      return null;
    }
  }

  function setUserPref(val) {
    try { localStorage.setItem(LS_KEY, val ? 'true' : 'false'); } catch (e) { }
  }

  // Mobile / user power/data preferences detection
  function getPowerSaveSignals() {
    var signals = {
      prefersReducedMotion: false,
      saveData: false,
      lowBattery: false
    };

    try {
      signals.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { }

    try {
      signals.saveData = !!(navigator.connection && navigator.connection.saveData);
    } catch (e) { }

    return new Promise(function (resolve) {
      // battery API is async and not supported everywhere
      if (navigator.getBattery && typeof navigator.getBattery === 'function') {
        navigator.getBattery().then(function (battery) {
          try {
            // treat low battery (<=20%) and not charging as a signal
            signals.lowBattery = (typeof battery.level === 'number' && battery.level <= 0.2 && !battery.charging);
          } catch (e) { }
          resolve(signals);
        }).catch(function () { resolve(signals); });
      } else {
        resolve(signals);
      }
    });
  }

  // Initialize particles with a computed mode. mode: 'normal'|'reduced'|'minimal'|'off'
  function initParticlesWithMode(mode) {
    if (mode === 'off') {
      destroyExisting();
      return;
    }
    if (typeof window.particlesJS !== 'function') return; // library not loaded yet
    destroyExisting();
    var cfg = buildConfig(mode === 'reduced' ? 'reduced' : (mode === 'minimal' ? 'minimal' : 'normal'));
    try {
      window.particlesJS('particles-js', cfg);
    } catch (err) {
      console.error('Failed to initialize particles.js', err);
    }
  }

  // Create a small toggle button in the header to allow users to enable/disable background animation
  function injectToggle(initialEnabled) {
    try {
      var headerInner = document.querySelector('.header-inner');
      if (!headerInner) return null;

      // Avoid duplicate toggle
      if (document.getElementById('particles-toggle')) return document.getElementById('particles-toggle');

      var btn = document.createElement('button');
      btn.id = 'particles-toggle';
      btn.type = 'button';
      btn.className = 'particles-toggle btn-ghost';
      btn.setAttribute('aria-pressed', initialEnabled ? 'true' : 'false');
      btn.title = initialEnabled ? 'Disable background animation' : 'Enable background animation';
      btn.innerHTML = initialEnabled ? '<span aria-hidden="true">✨</span>' : '<span aria-hidden="true">⚪</span>';

      // Place to the right of headerInner contents
      headerInner.appendChild(btn);

      btn.addEventListener('click', function () {
        var current = btn.getAttribute('aria-pressed') === 'true';
        var next = !current;
        btn.setAttribute('aria-pressed', next ? 'true' : 'false');
        btn.title = next ? 'Disable background animation' : 'Enable background animation';
        btn.innerHTML = next ? '<span aria-hidden="true">✨</span>' : '<span aria-hidden="true">⚪</span>';
        setUserPref(next);
        if (next) {
          // re-evaluate environment and init appropriately
          getPowerSaveSignals().then(function (signals) {
            var mode = (signals.prefersReducedMotion || signals.saveData || signals.lowBattery) ? 'reduced' : 'normal';
            initParticlesWithMode(mode);
          });
        } else {
          initParticlesWithMode('off');
        }
      });

      return btn;
    } catch (e) {
      console.warn('Could not inject particles toggle', e);
      return null;
    }
  }

  // Top-level initialization: decide whether to init particles in normal/reduced/minimal/off
  function initHighLevel() {
    var userPref = getUserPref();

    injectToggle(userPref === null ? true : !!userPref);

    // If user explicitly disabled -> turn off
    if (userPref === false) {
      initParticlesWithMode('off');
      return;
    }

    // otherwise detect device signals and decide
    getPowerSaveSignals().then(function (signals) {
      var mode = 'normal';
      if (signals.prefersReducedMotion || signals.saveData || signals.lowBattery) {
        mode = 'reduced';
      }

      // If user explicitly enabled, still respect reduced mode but allow a slightly higher minimum
      if (userPref === true && mode === 'reduced') {
        mode = 'reduced';
      }

      initParticlesWithMode(mode);
    }).catch(function () {
      initParticlesWithMode('normal');
    });
  }

  // Debounced resize handler to reinitialize with appropriate settings
  var resizeTimer = null;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // Respect user preference on resize
      var userPref = getUserPref();
      if (userPref === false) {
        initParticlesWithMode('off');
        return;
      }
      // Re-run detection and init
      initHighLevel();
    }, 250);
  }

  // Initialize once the DOM is ready. If particles.js isn't loaded yet, wait for load.
  function ready(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(fn, 1);
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    if (typeof window.particlesJS !== 'function') {
      window.addEventListener('load', function () {
        initHighLevel();
      });
    } else {
      initHighLevel();
    }
    window.addEventListener('resize', handleResize);
  });

})();
