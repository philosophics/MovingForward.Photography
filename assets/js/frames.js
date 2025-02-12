import { devLog } from './develop.js';
import { addNavigationArrows, portfolioNavigation } from './osd.js';
import { hideDescription, showDescription, positionDescription } from './portfolio.js';

export function setupTransitions() {
  document.addEventListener('transitionStart', () => {
    document.body.classList.add('fade-out');
  });

  document.addEventListener('transitionEnd', () => {
    document.body.classList.remove('fade-out');
  });
}

export function apply404Background() {
  const body = document.body;
  body.style.background = 'linear-gradient(180deg, #000428 0%, #00427b 80%)';
  body.style.backgroundColor = '#000428';
  devLog('Applied 404 background');
}

export function resetBackground() {
  const body = document.body;
  body.style.background = '';
  body.style.backgroundColor = '';
}

export function handleNavVisibility(isVisible) {
  const nav = document.querySelector('nav');
  if (!nav) {
    console.warn('⚠️ Navbar element not found.');
    return;
  }

  if (isVisible) {
    nav.classList.add('nav-visible');
    nav.classList.remove('nav-hidden');
  } else {
    nav.classList.add('nav-hidden');
    nav.classList.remove('nav-visible');
  }
}

export function handleFooterVisibility(isVisible) {
  const footer = document.querySelector('footer');
  if (!footer) {
    console.warn('⚠️ Footer element not found.');
    return;
  }

  if (isVisible) {
    footer.classList.add('footer-visible');
    footer.classList.remove('footer-hidden');
  } else {
    footer.classList.add('footer-hidden');
    footer.classList.remove('footer-visible');
  }
}

export function throwInHomecards() {
  const homecards = document.querySelectorAll('.home-card');

  if (!homecards.length) {
    console.warn('⚠️ No homecards found.');
    return;
  }

  homecards.forEach((card, index) => {
    const startX = (Math.random() - 0.5) * window.innerWidth * 2;
    const startY = -window.innerHeight * (1.2 + Math.random() * 0.8);
    const startRotation = (Math.random() - 0.5) * 90;

    card.style.transition = 'none';
    card.style.transform = 'translate(0, 0) rotate(0deg)';
    card.style.opacity = '1';

    requestAnimationFrame(() => {
      card.style.transform = `translate(${startX}px, ${startY}px) rotate(${startRotation}deg)`;
      card.style.opacity = '0.01';

      void card.offsetWidth;

      setTimeout(() => {
        card.style.transition =
          'transform 0.8s cubic-bezier(0.2, 1.2, 0.3, 1), opacity 0.5s ease-out';
        card.style.transform = 'translate(0, 0) rotate(0deg)';
        card.style.opacity = '1';
      }, index * 120 + Math.random() * 100);
    });
  });
}

export function stackInPortfolioImages() {
  const portfolioCards = document.querySelectorAll('.dynamic-card');

  if (!portfolioCards.length) {
    console.warn('⚠️ No portfolio images found.');
    return;
  }

  portfolioCards.forEach((card, index) => {
    const startX = (Math.random() - 0.5) * 100;
    const startY = 100 + Math.random() * 50;
    const startRotation = (Math.random() - 0.5) * 10;

    card.style.opacity = '0';
    card.style.transform = `translate(${startX}px, ${startY}px) rotate(${startRotation}deg)`;
    card.style.transition = 'none';

    requestAnimationFrame(() => {
      card.getBoundingClientRect();

      setTimeout(() => {
        card.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.7s ease';
        card.style.transform = 'translate(0, 0) rotate(0deg)';
        card.style.opacity = '1';
      }, index * 100);
    });
  });
}

let lastPage = null;

document.addEventListener('pageLoaded', () => {
  if (window.appState.currentPage === lastPage) {
    console.log('⚠️ handleNavVisibility already executed for this page, skipping...');
    return;
  }
  lastPage = window.appState.currentPage;

  if (window.appState.currentPage === '404') {
    console.log('🚨 404 Page Loaded, Keeping Background');
    apply404Background();
  } else {
    resetBackground();
  }

  const isPortfolioPage = ['abstract', 'architecture', 'landscape', 'street'].includes(
    window.appState.currentPage,
  );
  handleNavVisibility(isPortfolioPage);
  handleFooterVisibility(isPortfolioPage);
});

export function makeRandomImagesLarger() {
  const portfolioGrid = document.querySelector('.portfolio-grid');

  if (!portfolioGrid) {
    devWarn('Portfolio grid not found. Retrying in 100ms...');
    setTimeout(makeRandomImagesLarger, 100);
    return;
  }

  if (window.innerWidth < 1024) {
    devLog('⚠️ Disabling featured tag on mobile view.');
    return;
  }

  const featuredCards = [...portfolioGrid.querySelectorAll('.dynamic-card.featured')].filter(
    (card) => card.querySelector('img'),
  );

  if (featuredCards.length === 0) {
    devWarn('No featured cards found in the grid. Retrying in 100ms...');
    setTimeout(makeRandomImagesLarger, 100);
    return;
  }

  featuredCards.forEach((card) => {
    const img = card.querySelector('img');

    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      applySpans(card, img);
    } else {
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          requestAnimationFrame(() => applySpans(card, img));
        } else {
          devError('Failed to get valid dimensions for image:', img);
        }
      };
    }
  });
}

function applySpans(card, img) {
  if (!img.naturalWidth || !img.naturalHeight) {
    console.warn('Skipping applySpans() - Image not ready:', img);
    return;
  }

  const width = img.naturalWidth;
  const height = img.naturalHeight;
  const aspectRatio = width / height;

  let rowSpan, colSpan;
  if (width > 2000 || height > 1500) {
    rowSpan = 3;
    colSpan = 3;
  } else if (aspectRatio > 1) {
    rowSpan = 2;
    colSpan = 2;
  } else {
    rowSpan = 3;
    colSpan = 1;
  }

  card.style.transition = 'all 0.5s ease-in-out';
  card.style.gridRow = `span ${rowSpan}`;
  card.style.gridColumn = `span ${colSpan}`;
}

export function setupHoverExpansion() {
  if (window.innerWidth < 1024) return;

  const cards = document.querySelectorAll('.dynamic-card');

  cards.forEach((card) => {
    const textWrapper = card.querySelector('.text-wrapper');
    const title = card.querySelector('.title');
    const subtitle = card.querySelector('.subtitle');

    if (textWrapper && title && subtitle) {
      const initialHeight = title.scrollHeight + 16;
      const expandedHeight = title.scrollHeight + subtitle.scrollHeight + 16;

      textWrapper.style.height = `${initialHeight}px`;

      card.addEventListener('mouseenter', () => {
        textWrapper.style.height = `${expandedHeight}px`;
      });

      card.addEventListener('mouseleave', () => {
        textWrapper.style.height = `${initialHeight}px`;
      });
    }
  });
}

export function adjustCardHoverBehaviorForCard(card) {
  const frontWrapper = card.querySelector('.text-wrapper.front');
  const title = frontWrapper?.querySelector('.title');
  const subtitle = frontWrapper?.querySelector('.subtitle');

  if (frontWrapper && title && subtitle) {
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
      const wrapperPadding =
        parseInt(window.getComputedStyle(frontWrapper).paddingTop) +
        parseInt(window.getComputedStyle(frontWrapper).paddingBottom);

      const initialHeight = title.scrollHeight + wrapperPadding;
      frontWrapper.style.height = `${initialHeight}px`;
      frontWrapper.style.transition = 'height 0.3s ease';

      card.addEventListener('mouseenter', () => {
        const expandedHeight = title.scrollHeight + subtitle.scrollHeight + wrapperPadding;
        frontWrapper.style.height = `${expandedHeight}px`;
        subtitle.style.opacity = '1';
        subtitle.style.transform = 'translateY(0)';
      });

      card.addEventListener('mouseleave', () => {
        frontWrapper.style.height = `${initialHeight}px`;
        subtitle.style.opacity = '0';
        subtitle.style.transform = 'translateY(10px)';
      });
    } else {
      frontWrapper.style.height = 'auto';
      subtitle.style.opacity = '1';
      subtitle.style.transform = 'translateY(0)';
    }
  }
}

async function handleOrientationChange() {
  const expandedCard = document.querySelector('.expanded-card');

  if (!expandedCard) {
    if (screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock('portrait-primary');
      } catch (err) {
        console.warn('Orientation lock failed:', err);
      }
    }
    return;
  }

  if (window.matchMedia('(orientation: landscape)').matches) {
    const description = expandedCard.querySelector('.description');
    const textWrapper = expandedCard.querySelector('.text-wrapper');

    const isMobile = /Mobi/i.test(navigator.userAgent);
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;

    if (isMobile && expandedCard) {
      if (isLandscape) {
        if (description) description.style.display = 'none';
        if (textWrapper) textWrapper.style.display = 'none';
      } else {
        if (description) description.style.display = '';
        if (textWrapper) textWrapper.style.display = '';
      }
    } else {
      if (description) description.style.display = '';
      if (textWrapper) textWrapper.style.display = '';
    }

    const closeBtn = expandedCard.querySelector('.close-btn');
    if (closeBtn) {
      if (window.matchMedia('(orientation: landscape)').matches) {
        closeBtn.style.position = 'fixed';
        closeBtn.style.top = '15px';
        closeBtn.style.right = '15px';
        closeBtn.style.zIndex = '1001';
      } else {
        closeBtn.style.position = '';
        closeBtn.style.top = '';
        closeBtn.style.right = '';
      }
    }

    const navArrows = expandedCard.querySelectorAll('.nav-arrow');
    navArrows.forEach((arrow) => {
      arrow.style.position = 'absolute';
      arrow.style.top = '50%';
      arrow.style.transform = 'translateY(-50%)';
    });

    const prevArrow = expandedCard.querySelector('.nav-arrow.prev');
    const nextArrow = expandedCard.querySelector('.nav-arrow.next');

    if (prevArrow) prevArrow.style.left = '10px';
    if (nextArrow) nextArrow.style.right = '10px';
  } else {
    expandedCard.querySelector('.description').style.display = '';

    const closeBtn = expandedCard.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.style.position = '';
      closeBtn.style.top = '';
      closeBtn.style.right = '';
    }

    const navArrows = expandedCard.querySelectorAll('.nav-arrow');
    navArrows.forEach((arrow) => {
      arrow.style.position = '';
      arrow.style.top = '';
      arrow.style.transform = '';
    });
  }

  if (screen.orientation && screen.orientation.lock && /Mobi/i.test(navigator.userAgent)) {
    try {
      await screen.orientation.lock('portrait-primary');
    } catch (err) {
      console.warn('Orientation lock failed:', err);
    }
  }
}

window.addEventListener('resize', handleOrientationChange);
window.addEventListener('orientationchange', handleOrientationChange);

function cleanupOrientationLock() {
  if (!document.querySelector('.expanded-card')) {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait').catch(() => {});
    }
  }
}

export function openExpandedCard(card) {
  const descriptionText = card.querySelector('.description')?.innerText;

  let overlay = document.querySelector('.overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);
  }

  const existingExpandedCard = overlay.querySelector('.expanded-card');
  if (existingExpandedCard) {
    overlay.removeChild(existingExpandedCard);
  }

  const cardRect = card.getBoundingClientRect();
  const expandedCard = card.cloneNode(true);
  expandedCard.originalCardRect = cardRect;

  expandedCard.classList.add('expanded-card', 'dynamic-card');
  expandedCard.style.position = 'fixed';
  expandedCard.style.top = `${cardRect.top + window.scrollY}px`;
  expandedCard.style.left = `${cardRect.left}px`;
  expandedCard.style.width = `${cardRect.width}px`;
  expandedCard.style.height = `${cardRect.height}px`;
  expandedCard.style.zIndex = '1000';
  expandedCard.style.transition = 'all 0.5s ease-in-out';

  overlay.appendChild(expandedCard);
  overlay.style.display = 'flex';

  addNavigationArrows(expandedCard, overlay);
  // FIXME: https://github.com/philosophics/MovingForward.Photography/issues/1 Investigate why text-wrapper visibility glitches on hover
  const expandedImg = expandedCard.querySelector('img');
  const textWrapperBack = expandedCard.querySelector('.text-wrapper.back');
  const subtitle = expandedCard.querySelector('.subtitle');

  setTimeout(() => {
    if (window.innerWidth <= 768 && descriptionText) {
      showDescription(descriptionText);
      positionDescription(expandedCard);
    }
  }, 500);

  if (expandedImg) {
    expandedImg.onload = async () => {
      const imageRatio = expandedImg.naturalWidth / expandedImg.naturalHeight;
      const viewportRatio = window.innerWidth / window.innerHeight;

      if (imageRatio > viewportRatio) {
        expandedCard.style.width = '90vw';
        expandedCard.style.height = 'auto';
      } else {
        expandedCard.style.width = 'auto';
        expandedCard.style.height = '90vh';
      }

      if (textWrapperBack) {
        if (window.innerWidth <= 768) {
          textWrapperBack.style.display = 'flex';
          textWrapperBack.style.opacity = '1';
          textWrapperBack.style.transform = 'translateY(0)';
        } else {
          expandedCard.addEventListener('mouseenter', () => {
            textWrapperBack.style.display = 'flex';
            textWrapperBack.style.opacity = '1';
            textWrapperBack.style.transform = 'translateY(0)';
          });

          expandedCard.addEventListener('mouseleave', () => {
            textWrapperBack.style.opacity = '0';
            textWrapperBack.style.transform = 'translateY(10px)';
            setTimeout(() => {
              textWrapperBack.style.display = 'none';
            }, 400);
          });
        }
      } else {
        console.error('No .text-wrapper.back found in expanded card');
      }

      if (subtitle && window.innerWidth <= 768) {
        subtitle.style.opacity = '1';
        subtitle.style.transform = 'translateY(0)';
        subtitle.style.transition = 'none';
      }
    };
  }

  requestAnimationFrame(() => {
    expandedCard.style.transition = 'all 0.5s ease-in-out';
    expandedCard.style.top = '50%';
    expandedCard.style.left = '50%';
    expandedCard.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('close-btn');
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    closeExpandedCard(expandedCard, cardRect, overlay);
  });

  expandedCard.appendChild(closeBtn);

  window.addEventListener('keydown', portfolioNavigation);
  handleOrientationChange();

  expandedCard.addEventListener('click', async () => {
    if (screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock('landscape');
      } catch (err) {
        console.warn('Orientation lock failed:', err);

        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) {
            await document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            await document.documentElement.webkitRequestFullscreen();
          } else if (document.documentElement.msRequestFullscreen) {
            await document.documentElement.msRequestFullscreen();
          }
        }
      }
    }
  });

  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('natural').catch(() => {});
  }
}

export function closeExpandedCard(
  expandedCard,
  cardRect = null,
  overlay = document.querySelector('.overlay'),
) {
  hideDescription();

  if (!cardRect && expandedCard.originalCardRect) {
    cardRect = expandedCard.originalCardRect;
  }

  if (!cardRect) {
    console.error('❌ Missing original cardRect! Closing instantly.');
    expandedCard.remove();
    return;
  }

  expandedCard.style.transition = 'all 0.5s ease-in-out';
  expandedCard.style.top = `${cardRect.top + window.scrollY}px`;
  expandedCard.style.left = `${cardRect.left}px`;
  expandedCard.style.width = `${cardRect.width}px`;
  expandedCard.style.height = `${cardRect.height}px`;
  expandedCard.style.transform = 'none';

  setTimeout(() => {
    if (expandedCard && document.body.contains(expandedCard)) {
      expandedCard.remove();
    }

    const overlay = document.querySelector('.overlay');
    if (overlay) {
      overlay.style.display = 'none';
      overlay.innerHTML = '';
    }

    cleanupOrientationLock();

    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait-primary').catch(() => {});
    }

    window.removeEventListener('keydown', portfolioNavigation);
  }, 500);
}
