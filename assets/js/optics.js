import { devLog, devWarn, devError } from './develop.js';
import { ensureHomecardsExist } from './base.js';
import { loadHomeCards, waitForHomecardImages } from './images.js';
import {
  handleNavVisibility,
  handleFooterVisibility,
  resetBackground,
  apply404Background,
} from './transitions.js';

export const routes = {
  '/': 'assets/pages/home.html',
  '/abstract': 'assets/pages/abstract.html',
  '/architecture': 'assets/pages/architecture.html',
  '/landscape': 'assets/pages/landscape.html',
  '/street': 'assets/pages/street.html',
  '/about': 'assets/pages/about.html',
  '/404': 'assets/pages/404.html',
};

export async function loadPage(path) {
  const contentPlaceholder = document.querySelector('#content-placeholder');

  if (!contentPlaceholder) {
    devError('❌ #content-placeholder not found in the DOM.');
    return;
  }

  const is404Page = !routes[path];
  const filePath = routes[path] || '/assets/pages/404.html';
  if (!filePath.endsWith('.html')) filePath += '.html';

  devLog(`📄 Loading content for: ${path} → ${filePath}`);

  try {
    const response = await fetch(filePath, { cache: 'no-store' });
    const content = await response.text();
    contentPlaceholder.innerHTML = content;
    devLog(`✅ Content loaded for ${path}`);

    window.appState.currentPage = is404Page ? '404' : path === '/' ? 'home' : path.replace('/', '');
    console.log(`✅ Preparing functions for ${window.appState.currentPage}`);

    if (is404Page) {
      console.warn(`❌ Invalid path detected: ${path}, redirecting to /404.`);
      history.replaceState({}, '', '/404');
      console.log('🚨 404 Page Detected, Applying 404 Styles');
      setTimeout(() => {
        apply404Background();
      }, 50);
    } else {
      resetBackground();
    }

    const isPortfolioPage =
      routes[path] && ['/abstract', '/architecture', '/landscape', '/street'].includes(path);

    handleNavVisibility(isPortfolioPage);
    handleFooterVisibility(!isPortfolioPage);

    if (isPortfolioPage) {
      import('./images.js')
        .then((module) => {
          module.setupPortfolio();
          console.log(`🎨 Portfolio loaded for ${path}`);
        })
        .catch((error) => console.error(`❌ Failed to load portfolio.js:`, error));
    }

    if (path === '/') {
      console.log('🏠 Setting up homecards...');
      ensureHomecardsExist();
      document.dispatchEvent(new Event('homeLoaded'));
      window.appState.homeLoaded = true;
    }

    if (!response.ok) {
      devWarn(`⚠️ Fetch failed for ${filePath}, trying to load fallback.`);
      contentPlaceholder.innerHTML = '<h1>404 - Page Not Found</h1>';
      history.replaceState({}, '', '/404');
      apply404Background();
      return;
    }
  } catch (error) {
    devError(`❌ Failed to load ${path}:`, error);
    contentPlaceholder.innerHTML = '<h1>404 - Page Not Found</h1>';
  }
}

export async function setupRouter() {
  if (window.appState.routerInitialized) {
    devLog('⚠️ Router already initialized, skipping duplicate setup.');
    return;
  }

  window.appState.routerInitialized = true;

  let initialPath = window.location.pathname.toLowerCase();
  if (initialPath.endsWith('/index.html')) {
    initialPath = '/';
  }

  devLog(`🌍 Initial path detected: ${initialPath}`);

  await loadPage(initialPath);
}
