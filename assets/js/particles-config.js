// assets/js/particles-config.js - Animated particle background
// This file builds a responsive config and safely (re)initializes Particles.js.
(function () {
  'use strict';

  // Helper: build a config based on viewport size to improve performance on small screens
  function buildConfig() {
    var w = window.innerWidth || document.documentElement.clientWidth;
    var isMobile = w <= 768;
    var isTablet = w > 768 && w <= 1200;

    var particleCount = isMobile ? 25 : (isTablet ? 45 : 80);
    var enableLineLinked = !isMobile; // lines are heavier on mobile
    var linkDistance = isMobile ? 100 : 150;

    return {
      particles: {
        number: {
          value: particleCount,
          density: { enable: true, value_area: 800 }
        },
        color: { value: '#6ddcff' },
        shape: { type: 'circle', stroke: { width: 0, color: '#000000' }, polygon: { nb_sides: 5 } },
        opacity: { value: 0.5, random: false, anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false } },
        size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
        line_linked: {
          enable: enableLineLinked,
          distance: linkDistance,
          color: '#7f60ff',
          opacity: enableLineLinked ? 0.4 : 0,
          width: enableLineLinked ? 1 : 0
        },
        move: { enable: true, speed: 3, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false, attract: { enable: false, rotateX: 600, rotateY: 1200 } }
      },
      interactivity: {
        // use 'window' so hover/click events register even if other elements overlay the canvas
        detect_on: 'window',
        events: {
          onhover: { enable: true, mode: 'repulse' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        },
        modes: {
          grab: { distance: 400, line_linked: { opacity: 1 } },
          bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
          repulse: { distance: 300, duration: 0.6 },
          push: { particles_nb: 4 },
          remove: { particles_nb: 2 }
        }
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
        // avoid breaking if destroy API changes
        console.warn('Could not destroy existing particles instance', e);
      }
      window.pJSDom = [];
    }
  }

  // Initialize particles with the responsive config
  function initParticles() {
    if (typeof window.particlesJS !== 'function') return; // library not loaded yet
    destroyExisting();
    var cfg = buildConfig();
    try {
      window.particlesJS('particles-js', cfg);
    } catch (err) {
      console.error('Failed to initialize particles.js', err);
    }
  }

  // Debounced resize handler to reinitialize with appropriate settings
  var resizeTimer = null;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      initParticles();
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
    // If particles.js is loaded after DOMContentLoaded via network, wait until window.load
    if (typeof window.particlesJS !== 'function') {
      window.addEventListener('load', function () {
        initParticles();
      });
    } else {
      initParticles();
    }
    window.addEventListener('resize', handleResize);
  });

})();
