import { devLog, devWarn, devError } from './develop.js';
import { attachPortfolioNavigation, addNavigationArrows } from './nav.js';
import { setupPortfolio, loadPortfolioImages } from './images.js';
import {
  adjustCardHoverBehaviorForCard,
  makeRandomImagesLarger,
  setupHoverExpansion,
} from './transitions.js';

let lastClearedPage = null;

export function finalizePortfolioGrid(portfolioGrid) {
  if (!portfolioGrid || portfolioGrid.children.length === 0) {
    console.warn('⚠️ No portfolio images in the grid. Skipping finalization.');
    return;
  }

  makeRandomImagesLarger();
  adjustTitleFontSize();
  setupHoverExpansion();

  portfolioGrid.dataset.loaded = 'true';
  devLog('✅ Portfolio READY.');
}

export function clearPortfolioGrid() {
  const portfolioGrid = document.querySelector('.portfolio-grid');
  if (!portfolioGrid) {
    devWarn('⚠️ No portfolio grid found, skipping clear.');
    return;
  }

  if (window.DEBUG_DISABLE_CLEAR) {
    console.warn('🚫 Debug: Preventing portfolio grid clear.');
    return;
  }

  if (lastClearedPage === window.appState.currentPage) {
    devLog(`✅ Skipping clear, already cleared for ${window.appState.currentPage}.`);
    return;
  }

  devLog(`🗑️ Clearing portfolio grid before loading new images...`);

  while (portfolioGrid.firstChild) {
    portfolioGrid.removeChild(portfolioGrid.firstChild);
  }

  portfolioGrid.dataset.loaded = 'false';
  lastClearedPage = window.appState.currentPage;
  console.log('✅ Portfolio grid cleared.');
}

function adjustTitleFontSize() {
  if (window.innerWidth < 1024) return;

  const titles = document.querySelectorAll('.text-wrapper .title');

  titles.forEach((title) => {
    const parentWidth = title.parentElement.offsetWidth;
    let fontSize = 16;
    title.style.fontSize = `${fontSize}px`;

    while (title.scrollWidth > parentWidth && fontSize > 11) {
      fontSize--;
      title.style.fontSize = `${fontSize}px`;
    }
  });
}

function attachHoverBehaviorAfterLoad() {
  const portfolioGrid = document.querySelector('.portfolio-grid');
  if (!portfolioGrid) return;

  const observer = new MutationObserver(() => {
    const cards = portfolioGrid.querySelectorAll('.dynamic-card:not(.hover-attached)');
    cards.forEach((card) => {
      adjustCardHoverBehaviorForCard(card);
      card.classList.add('hover-attached');
    });
  });

  observer.observe(portfolioGrid, { childList: true, subtree: true });
  portfolioGrid.dataset.hoverAttached = 'true';
}

window.addEventListener('load', attachHoverBehaviorAfterLoad);

export function showDescription(descriptionText) {
  let descriptionContainer = document.querySelector('.description-container');
  if (!descriptionContainer) {
    descriptionContainer = document.createElement('div');
    descriptionContainer.classList.add('description-container');
    document.body.appendChild(descriptionContainer);
  }

  descriptionContainer.innerText = descriptionText;
  descriptionContainer.style.display = 'block';
  requestAnimationFrame(() => {
    descriptionContainer.classList.add('show');
  });
}

export function positionDescription(expandedCard) {
  const descriptionContainer = document.querySelector('.description-container');
  if (!descriptionContainer) return;

  const expandedCardRect = expandedCard.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const footerTop = document.querySelector('footer').getBoundingClientRect().top;

  const spaceBelowCard = footerTop - expandedCardRect.bottom;
  const minPadding = 20;
  const descriptionTop = expandedCardRect.bottom + Math.max(spaceBelowCard / 2, minPadding);

  descriptionContainer.style.top = `${Math.min(descriptionTop, footerTop - minPadding)}px`;
  descriptionContainer.style.display = 'block';
}

export function hideDescription() {
  const descriptionContainer = document.querySelector('.description-container');
  if (!descriptionContainer) return;

  descriptionContainer.classList.remove('show');
  descriptionContainer.classList.add('hide');

  setTimeout(() => {
    descriptionContainer.style.display = 'none';
    descriptionContainer.classList.remove('hide');
  }, 400);
}

function stackInPortfolioGrid() {
  const portfolioGrid = document.querySelector('.portfolioGrid');
  if (portfolioGrid) {
    portfolioGrid.style.opacity = '0';
    portfolioGrid.style.transform = 'translateY(100vh)';
    portfolioGrid.style.transition = 'transform 0.6s ease, opacity 0.6s ease';

    setTimeout(() => {
      portfolioGrid.style.transform = 'translateY(0)';
      portfolioGrid.style.opacity = '1';
    }, 100);
  }
}
