import { setupRouter } from './optics.js';
import { setupDebugging } from './develop.js';
import { setupImages } from './images.js';
import { setupNavigation } from './nav.js';
import './portfolio.js';

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
  navigator.serviceWorker
    .register('/ExposureControl.js')
    .then((registration) => {
      console.log('✅ ExposureControl Registered:', registration);
      registration.update();
    })
    .catch((error) => console.error('❌ Service Worker Registration Failed:', error));
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
