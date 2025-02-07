import { loadPage, routes } from './optics.js';
import { devLog, devWarn, devError } from './develop.js';
import { handleNavVisibility, openExpandedCard, closeExpandedCard } from './transitions.js';
import { ensureHomecardsExist } from './base.js';
import { loadHomeCards } from './images.js';
import { showDescription, positionDescription, hideDescription } from './portfolio.js';

let navigationInitialized = false;

export function setupNavigation() {
  if (navigationInitialized) {
    return;
  }
  navigationInitialized = true;

  devLog('🚀 Initializing navigation...');

  function initializeNavigation(headerElement) {
    if (!headerElement) {
      console.error('🚨 Missing headerElement in initializeNavigation()!');
      return;
    }

    const isPortfolioPage = ['abstract', 'architecture', 'landscape', 'street'].includes(
      window.appState.currentPage,
    );

    console.log(
      `🔍 initializeNavigation: isPortfolioPage = ${isPortfolioPage}, currentPage = ${window.appState.currentPage}`,
    );

    let nav = headerElement.querySelector('nav');

    if (!nav && isPortfolioPage) {
      console.log('✅ Injecting nav into header...');
      const navHTML = `
            <nav>
                <ul class="desktop-nav">
                    <li><a href="/" data-link>Home</a></li>
                    <li><a href="/abstract" data-link>Abstract</a></li>
                    <li><a href="/architecture" data-link>Architecture</a></li>
                    <li><a href="/landscape" data-link>Landscape</a></li>
                    <li><a href="/street" data-link>Street</a></li>
                </ul>
                <label class="hamburger" for="menu-toggle">
                    <input type="checkbox" id="menu-toggle" />
                    <span class="bar top"></span>
                    <span class="bar middle"></span>
                    <span class="bar bottom"></span>
                </label>
                <ul class="mobile-nav">
                    <li><a href="/" data-link>Home</a></li>
                    <li><a href="/abstract" data-link>Abstract</a></li>
                    <li><a href="/architecture" data-link>Architecture</a></li>
                    <li><a href="/landscape" data-link>Landscape</a></li>
                    <li><a href="/street" data-link>Street</a></li>
                </ul>
            </nav>`;
      headerElement.insertAdjacentHTML('beforeend', navHTML);
      nav = headerElement.querySelector('nav');
    }

    if (isPortfolioPage) {
      console.log('✅ Making nav visible...');
      nav.classList.add('nav-visible');
    } else if (nav) {
      console.log('🗑️ Removing nav visibility, sliding down.');
      nav.classList.remove('nav-visible');
    }

    setTimeout(() => {
      handleNavVisibility(isPortfolioPage);
    }, 10);
  }

  document.addEventListener('click', (event) => {
    const target = event.target;

    const card = target.closest('.home-card');
    if (card) {
      event.preventDefault();
      const targetPath = card.getAttribute('data-text');
      if (targetPath) {
        console.log(`➡️ Navigating to ${targetPath}`);
        history.pushState({}, '', `/${targetPath}`);
        loadPage(`/${targetPath}`);
      }
      return;
    }

    const link = target.closest('a[data-link]');
    if (link) {
      event.preventDefault();
      const path = new URL(link.href, location.origin).pathname;
      console.log(`➡️ Navigating via link to ${path}`);
      history.pushState({}, '', path);
      loadPage(path).then(() => {
        if (path === '/') {
          devLog('✅ Content loaded via link navigation, ensuring homecards exist.');
          ensureHomecardsExist();
          loadHomeCards(window.appState.images);
        }
      });
    }
  });

  function redirectToHome() {
    console.log('🔄 Redirecting to home...');
    history.pushState({}, '', '/');
    loadPage('/');
  }

  window.addEventListener('popstate', () => {
    const path = window.location.pathname;

    devLog(`🔄 Popstate triggered: ${path}`);

    const expandedCard = document.querySelector('.expanded-card');
    if (expandedCard) {
      devLog('❌ Closing expanded image due to popstate.');
      closeExpandedCard(expandedCard);

      const overlay = document.querySelector('.overlay');
      if (overlay) {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
      }

      return;
    }

    if (path === '/') {
      devLog('🏠 Redirecting home (same as clicking Home link).');
      loadPage('/').then(() => {
        devLog('✅ Content loaded for home, ensuring homecards exist.');
        ensureHomecardsExist();
        loadHomeCards(window.appState.images);
      });
      return;
    }

    if (['/abstract', '/architecture', '/landscape', '/street'].includes(path)) {
      devLog(`🖼️ Returning to portfolio page: ${path}`);
      loadPage(path).then(() => {
        devLog('✅ Portfolio page restored.');
      });
      return;
    }

    if (routes[path]) {
      devLog(`🛠 Navigating to: ${path}`);
      loadPage(path);
    } else {
      devLog(`❌ Invalid path detected: ${path}, redirecting home.`);
      loadPage('/');
    }
  });

  function reattachHomecardListeners() {
    console.log('🔄 Reattaching homecard click event listeners...');

    document.querySelectorAll('.home-card').forEach((card) => {
      card.addEventListener('click', (event) => {
        event.preventDefault();
        const targetPath = card.getAttribute('data-text');
        if (targetPath) {
          console.log(`➡️ Navigating to ${targetPath}`);
          history.pushState({}, '', `/${targetPath}`);
          loadPage(`/${targetPath}`);
        }
      });
    });

    console.log('✅ Homecard click event listeners reattached.');
  }

  document.addEventListener('pageLoaded', () => {
    if (window.appState.currentPage === 'home') {
      devLog('🏠 Returning home, ensuring homecard visibility...');
      ensureHomecardsExist();

      if (window.appState.imagesLoaded && window.appState.previousPage !== 'home') {
        devLog('🔄 Reloading homecard images after navigation.');
        loadHomeCards(window.appState.images);
      }

      window.appState.previousPage = 'home';
    }
    setTimeout(() => {
      if (!window.appState.currentPage) {
        console.warn('⚠️ Navigation retry: currentPage still undefined.');
        return;
      }

      const headerElement = document.querySelector('header');
      if (!headerElement) {
        console.error('🚨 No header found!');
        return;
      }

      console.log(`🔍 Checking nav visibility for ${window.appState.currentPage}`);

      initializeNavigation(headerElement);
    }, 50);
  });

  attachPortfolioNavigation();
}

function updateNavigationForPage() {
  const isPortfolioPage = ['/abstract', '/architecture', '/landscape', '/street'].includes(
    window.location.pathname,
  );
  const desktopNav = document.querySelector('ul.desktop-nav');
  const hamburger = document.querySelector('label.hamburger');

  if (isPortfolioPage) {
    desktopNav.style.display = 'none';
    hamburger.style.display = 'block';
  } else {
    desktopNav.style.display = '';
    hamburger.style.display = '';
  }
}

document.addEventListener('DOMContentLoaded', updateNavigationForPage);
window.addEventListener('popstate', updateNavigationForPage);

export function attachPortfolioNavigation() {
  document.body.addEventListener('click', (event) => {
    const target = event.target;

    const card = target.closest('.dynamic-card');
    if (card) {
      openExpandedCard(card);
      return;
    }

    if (target.classList.contains('close-btn')) {
      closeExpandedCard(document.querySelector('.expanded-card'));
      return;
    }
  });

  window.addEventListener('keydown', portfolioNavigation);
}

function getCards() {
  return Array.from(document.querySelectorAll('.dynamic-card')).filter(
    (card) => card.offsetParent !== null,
  );
}

let currentIndex = 0;

export function portfolioNavigation(event) {
  const overlay = document.querySelector('.overlay');
  if (!overlay) return;

  if (event.key === 'ArrowLeft') {
    showPreviousImage(overlay);
  } else if (event.key === 'ArrowRight') {
    showNextImage(overlay);
  } else if (event.key === 'Escape') {
    document.querySelector('.close-btn').click();
  }
}

export function addNavigationArrows(expandedCard, overlay) {
  const prevArrow = document.createElement('button');
  prevArrow.classList.add('arrow', 'prev');
  prevArrow.innerHTML = `
    <div class="arrow-inner">
      <div class="arrow-top"></div>
      <div class="arrow-bottom"></div>
    </div>
  `;

  prevArrow.addEventListener('click', (event) => {
    event.stopPropagation();
    showPreviousImage(overlay);
  });

  const nextArrow = document.createElement('button');
  nextArrow.classList.add('arrow', 'next');
  nextArrow.innerHTML = `
    <div class="arrow-inner">
      <div class="arrow-top"></div>
      <div class="arrow-bottom"></div>
    </div>
  `;

  nextArrow.addEventListener('click', (event) => {
    event.stopPropagation();
    showNextImage(overlay);
  });

  expandedCard.appendChild(prevArrow);
  expandedCard.appendChild(nextArrow);
}

function showPreviousImage(overlay) {
  hideDescription();
  const cards = getCards();

  if (cards.length === 0) return;

  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  transitionToNewCard(cards[currentIndex], overlay);
}

function showNextImage(overlay) {
  hideDescription();
  const cards = getCards();

  if (cards.length === 0) return;

  currentIndex = (currentIndex + 1) % cards.length;
  transitionToNewCard(cards[currentIndex], overlay);
}

function transitionToNewCard(newCard, overlay) {
  hideDescription();

  const existingExpandedCard = overlay.querySelector('.expanded-card');
  if (existingExpandedCard) {
    existingExpandedCard.remove();
  }

  if (!newCard) {
    console.error('❌ No new card found to transition to.');
    return;
  }

  openExpandedCard(newCard);

  addNavigationArrows(newCard, overlay);
}

setupNavigation();
