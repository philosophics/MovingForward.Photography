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
          'transform 0.98s cubic-bezier(0.2, 1.2, 0.3, 1), opacity 0.3s ease-out';
        card.style.transform = 'translate(0, 0) rotate(0deg)';
        card.style.opacity = '1';
      }, index * 120 + Math.random() * 100);
    });
  });
}

export function stackInPortfolioImages() {
  const portfolioCards = Array.from(document.querySelectorAll('.dynamic-card'));
  const header = document.querySelector('header');
  const headerBottom = header ? header.offsetHeight : 100;

  if (!portfolioCards.length) {
    console.warn('⚠️ No portfolio images found.');
    return;
  }

  const isDesktop = window.innerWidth > 1024;

  const rows = [];
  portfolioCards.forEach((card) => {
    const rowTop = card.offsetTop;
    let row = rows.find((r) => Math.abs(r[0].offsetTop - rowTop) < 50);
    if (!row) {
      row = [];
      rows.push(row);
    }
    row.push(card);
  });

  rows.forEach((row, rowIndex) => {
    row.forEach((card, index) => {
      let startX, startY, startRotation, bounceY, settleY;

      if (isDesktop) {
        startX = (Math.random() - 0.3) * window.innerWidth * 0.2;
        startY = window.innerHeight * 0.7;
        startRotation = (Math.random() - 0.5) * 30;
        const previousRowBottom =
          rowIndex === 0 ? headerBottom : rows[rowIndex - 1][0].offsetTop + 50;
        bounceY = previousRowBottom + 20;
        settleY = 0;
      } else {
        startX = (Math.random() - 0.1) * 30;
        startY = 100 + Math.random() * 30;
        startRotation = (Math.random() - 0.5) * 5;
        bounceY = 50;
        settleY = 0;
      }

      card.style.opacity = '0';
      card.style.visibility = 'hidden';
      card.style.transform = `translate3d(${startX}px, ${startY}px, 0) rotate(${startRotation}deg)`;
      card.style.transition = 'none';

      requestAnimationFrame(() => {
        card.getBoundingClientRect();

        setTimeout(() => {
          card.style.visibility = 'visible';

          card.style.transition = isDesktop
            ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease'
            : 'transform 0.4s ease-out, opacity 0.3s ease';

          card.style.transform = `translate3d(0px, ${bounceY}px, 0) rotate(${
            startRotation / 2
          }deg)`;
          card.style.opacity = '1';

          setTimeout(
            () => {
              card.style.transition = isDesktop
                ? 'transform 0.3s ease-in-out'
                : 'transform 0.3s ease-out';
              card.style.transform = `translate3d(0, ${settleY}px, 0) rotate(0deg)`;
            },
            isDesktop ? 200 : 100,
          );
        }, rowIndex * 150 + index * (isDesktop ? 50 : 30));
      });
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
    rowSpan = 2;
    colSpan = 2;
  } else if (aspectRatio > 1.3) {
    rowSpan = 2;
    colSpan = 3;
  } else if (aspectRatio < 0.8) {
    rowSpan = 2;
    colSpan = 2;
  } else {
    rowSpan = 2;
    colSpan = 2;
  }

  card.style.transition = 'all 0.5s ease-in-out';
  card.style.gridRow = `span ${rowSpan}`;
  card.style.gridColumn = `span ${colSpan}`;

  card.style.transform = 'scale(1.0)';
  card.style.opacity = '0.8';
  requestAnimationFrame(() => {
    card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    card.style.transform = 'scale(1.05)';
    card.style.opacity = '1';
  });
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

  expandedCard.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  const isMobile = /Mobi/i.test(navigator.userAgent);

  if (isMobile && expandedImg) {
    expandedImg.onload = () => {
      const imageRatio = expandedImg.naturalWidth / expandedImg.naturalHeight;

      if (imageRatio > 1.3) {
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.classList.add('fullscreen-btn');
        fullscreenBtn.innerHTML = '⛶';

        let isFullscreen = false;

        fullscreenBtn.addEventListener('click', () => {
          if (!isFullscreen) {
            expandedCard.classList.add('fullscreen-active');

            const padding = 16;
            const rotatedWidth = window.innerHeight - padding * 2;
            const rotatedHeight = window.innerWidth - padding * 2;

            expandedCard.style.width = `${window.innerHeight}px`;
            expandedCard.style.height = `${window.innerWidth}px`;
            expandedCard.style.maxWidth = '100vw';
            expandedCard.style.maxHeight = '100vh';
            expandedCard.style.overflow = 'hidden';
            expandedCard.style.position = 'fixed';
            expandedCard.style.top = '50%';
            expandedCard.style.left = '50%';
            expandedCard.style.transformOrigin = 'center center';
            expandedCard.style.transform = 'translate(-50%, -50%) rotate(90deg)';
            expandedCard.style.display = 'flex';
            expandedCard.style.alignItems = 'center';
            expandedCard.style.justifyContent = 'center';
            expandedCard.style.transition = 'transform 0.5s ease-in-out';

            expandedImg.style.width = '100%';
            expandedImg.style.height = '100%';
            expandedImg.style.objectFit = 'contain';

            if (overlay) {
              overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            }

            const descriptionContainer = document.querySelector('.description-container');
            if (textWrapperBack) {
              textWrapperBack.style.transition = 'opacity 0.3s ease-in-out';
              textWrapperBack.style.opacity = '0';
              textWrapperBack.style.pointerEvents = 'none';
            }

            if (descriptionContainer) {
              hideDescription();
            }

            isFullscreen = true;
          } else {
            expandedCard.classList.remove('fullscreen-active');
            expandedCard.style.transform = 'translate(-50%, -50%) rotate(0deg) scale(1)';

            const descriptionContainer = expandedCard.querySelector('.description-container');
            setTimeout(() => {
              if (textWrapperBack) {
                textWrapperBack.style.opacity = '1';
                textWrapperBack.style.pointerEvents = 'auto';
                textWrapperBack.style.transform = 'translateY(0)';
              }
            }, 350);

            if (descriptionContainer) {
              showDescription(descriptionContainer.innerText);
            }

            if (overlay) {
              overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            }

            isFullscreen = false;
          }
        });

        expandedCard.appendChild(fullscreenBtn);
      }
    };

    if (expandedImg.complete) {
      expandedImg.onload();
    }
  }

  window.addEventListener('keydown', portfolioNavigation);

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

    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait-primary').catch(() => {});
    }

    window.removeEventListener('keydown', portfolioNavigation);
  }, 500);
}
