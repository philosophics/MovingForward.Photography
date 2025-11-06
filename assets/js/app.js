import { setupRouter } from './optics.js';
import { setupDebugging } from './develop.js';
import { setupImages } from './images.js';
import { setupNavigation } from './osd.js';
import './portfolio.js';

if (location.hostname !== 'movingforward.photography' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(rs => rs.forEach(r => r.unregister()))
    .catch(() => {});

  try {
    const sw = navigator.serviceWorker;
    if (typeof sw.register === 'function') {
      sw.register = () => Promise.resolve({ update() {} });
    }
  } catch {}
}

document.addEventListener('contextmenu', (event) => event.preventDefault());

setupDebugging();

if (!window.appState) {
  window.appState = {
    images: [],
    imagesLoaded: false,
    currentPath: window.location.pathname.toLowerCase(),
    currentPage: null,
    loadedPages: new Set(),
    routerInitialized: false,
  };
}

if ('navigator' in window && 'registerProtocolHandler' in navigator) {
  try {
    navigator.registerProtocolHandler(
      'web+photos',
      `${window.location.origin}/gallery?image=%s`,
      'Moving Forward Photography',
    );
  } catch (_) {
    // no-op
  }
}

async function initializeApp() {
  if (!window.appState.routerInitialized) {
    await setupRouter();
  }
  setupImages();
  setupNavigation();
}

if (!window.appInitialized) {
  window.appInitialized = true;
  initializeApp();
}

if ('serviceWorker' in navigator && location.hostname === 'movingforward.photography') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        console.log('✅ ExposureControl Registered');
        reg.update?.();
      })
      .catch(() => {
        // quietly ignore transient errors (e.g., during deploy)
      });
  });
}

function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('404')) {
    console.log('🚨 Direct 404 Page Load Detected!');
    apply404Background?.();
  }

  const imageParam = getUrlParam('image');
  if (imageParam) {
    console.log(`Opening gallery for image: ${imageParam}`);
  }

  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('.mobile-nav a');
  const hamburger = document.querySelector('.hamburger');

  menuToggle.addEventListener('change', function () {
    if (this.checked) {
      mobileNav.style.display = 'block';
      setTimeout(() => {
        mobileNav.classList.add('open');
        header.classList.add('menu-open');
      }, 10);
    } else {
      mobileNav.classList.remove('open');
      setTimeout(() => {
        mobileNav.style.display = 'none';
      }, 400);
      header.classList.remove('menu-open');
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.checked = false;
      mobileNav.classList.remove('open');
      setTimeout(() => {
        mobileNav.style.display = 'none';
      }, 400);
      header.classList.remove('menu-open');
    });
  });

  document.addEventListener('click', (event) => {
    if (
      !mobileNav.contains(event.target) &&
      !menuToggle.contains(event.target) &&
      !event.target.closest('.hamburger')
    ) {
      menuToggle.checked = false;
      mobileNav.classList.remove('open');
      setTimeout(() => {
        mobileNav.style.display = 'none';
      }, 400);
      header.classList.remove('menu-open');
    }
  });

  function checkPageForHamburger() {
    const isMobilePage = window.innerWidth <= 768;
    hamburger.style.display = isMobilePage ? 'block' : 'none';
  }

  checkPageForHamburger();
  window.addEventListener('resize', checkPageForHamburger);
});
