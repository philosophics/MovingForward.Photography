import { setupRouter } from './optics.js';
import { setupDebugging } from './develop.js';
import { setupImages } from './images.js';
import { setupNavigation } from './nav.js';
import './portfolio.js';

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
  navigator.registerProtocolHandler(
    'web+photos',
    window.location.origin + '/gallery?image=%s',
    'Moving Forward Photography',
  );
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

if ('serviceWorker' in navigator) {
  if (
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('✅ Service Worker Registered'))
      .catch((error) => console.error('❌ Service Worker Registration Failed:', error));
  } else {
    console.log('⚠️ Service Worker Disabled in Development Mode');
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  }
}

function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', () => {
  const imageParam = getUrlParam('image');
  if (imageParam) {
    console.log(`Opening gallery for image: ${imageParam}`);
  }
});
