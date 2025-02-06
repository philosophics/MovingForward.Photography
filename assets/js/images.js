import { devLog, devWarn, devError } from './develop.js';
import { clearPortfolioGrid, finalizePortfolioGrid } from './portfolio.js';
import { ensureHomecardsExist } from './base.js';
import { attachPortfolioNavigation } from './nav.js';
import { throwInHomecards, stackInPortfolioImages } from './transitions.js';

export function waitForAppState(callback, attempts = 0) {
  if (window.appState && window.appState.imagesLoaded) {
    devLog('✅ appState is available.');
    callback();
  } else if (attempts < 10) {
    if (attempts > 0) {
      devWarn(`⏳ Waiting for appState... Attempt ${attempts + 1}`);
    }
    setTimeout(() => waitForAppState(callback, attempts + 1), 100);
  } else {
    devError('❌ appState failed to initialize.');
  }
}

export function setupImages() {
  console.log('🖼️ Initializing image handling...');

  fetch('/assets/images/image-data.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(`📸 Loaded ${data.length} images into appState.`);
      window.appState.images = data;
      window.appState.imagesLoaded = true;
      document.dispatchEvent(new Event('imagesReady'));
    })
    .catch((error) => {
      console.error('❌ Failed to load images:', error);
    });
}

export function loadHomeCards(images) {
  console.log('🔄 Loading homecards...');

  if (!images || images.length === 0) {
    console.warn('⚠️ No images available to load homecards.');
    return;
  }

  const homecardImages = images.filter((img) => img.src.includes('/homecard/'));

  if (homecardImages.length === 0) {
    console.warn('⚠️ No homecard images found.');
    return;
  }

  console.log(`📸 Found ${homecardImages.length} homecard images...`);

  const sections = ['abstract', 'architecture', 'landscape', 'street'];
  let loadedCount = 0;

  sections.forEach((section, index) => {
    const cardImg = document.querySelector(`.home-card[data-text="${section}"] img`);
    const homecard = document.querySelector(`.home-card[data-text="${section}"]`);

    console.log(`🔍 Checking homecard for ${section}...`);

    if (!cardImg || !homecard) {
      console.warn(`⚠️ Homecard or image tag missing for ${section}, reloading.`);
      ensureHomecardsExist();
      return;
    }

    const sectionImages = homecardImages.filter((img) => img.page === section);

    if (sectionImages.length > 0) {
      const selectedImage = sectionImages[Math.floor(Math.random() * sectionImages.length)];
      console.log(`🔄 Assigning image ${selectedImage.src} to ${section}`);

      cardImg.src = selectedImage.src;
      cardImg.alt = `${section} homecard`;

      const checkIfLoaded = () => {
        loadedCount++;

        if (loadedCount === sections.length) {
          console.log('✅ Homepage READY.');

          document.querySelectorAll('.home-card').forEach((card) => {
            card.style.visibility = 'visible';
          });

          throwInHomecards();
        }
      };

      if (cardImg.complete && cardImg.naturalHeight !== 0) {
        console.log(`🟢 ${section} image already loaded (cached).`);
        checkIfLoaded();
      } else {
        console.log(`⏳ ${section} image is still loading...`);
        cardImg.onload = checkIfLoaded;
        cardImg.onerror = () => console.error(`❌ Failed to load image for ${section}`);
      }
    }
  });
}

export function waitForHomecardImages(attempts = 0) {
  if (attempts > 15) {
    devError('❌ Homecards or images failed to load.');
    return;
  }

  const homecards = document.querySelectorAll('.home-card img');

  if (homecards.length >= 4) {
    devLog(`✅ Homecards & images ready: ${homecards.length}`);
    document.dispatchEvent(new Event('homeLoaded'));
    return;
  }

  if (attempts > 0) {
    devWarn(`⏳ Waiting for homecards & images... Attempt ${attempts + 1}`);
  }

  setTimeout(() => waitForHomecardImages(attempts + 1), 100);
}

document.addEventListener('imagesReady', () => {
  if (!window.appState.imagesLoaded) {
    devLog('✅ imagesReady event detected, marking images as loaded.');
    window.appState.imagesLoaded = true;
  }

  if (!window.appState.homecardsLoaded) {
    ensureHomecardsExist();
    window.appState.homecardsLoaded = true;
    loadHomeCards(window.appState.images);
  } else {
    devLog('✅ Skipping redundant loadHomeCards() since homecards are already loaded.');
  }
});

export function setupPortfolio() {
  devLog('🖼️ Initializing portfolio page...');

  waitForPortfolioImages();

  if (!window.portfolioInitialized) {
    devLog('🛠 Setting up portfolio for the first time...');
    window.portfolioInitialized = true;
    attachPortfolioNavigation();
  } else {
    devLog('🔄 Portfolio already initialized, reloading images...');
  }
}

const loadedImagePaths = new Set();

export function loadPortfolioImages(images, currentPage, portfolioGrid) {
  if (!portfolioGrid) {
    console.error('❌ portfolioGrid is NULL. Images cannot be appended!');
    return;
  }

  const filteredImages = images.filter(
    (image) => image.page === currentPage && !image.src.includes('/homecard/'),
  );

  if (filteredImages.length === 0) {
    console.warn('⚠️ No images found for this page. Skipping...');
    finalizePortfolioGrid(portfolioGrid);
    return;
  }

  console.log(`📸 Found ${filteredImages.length} images...`);

  let loadedImages = 0;
  const totalImages = filteredImages.length;

  shuffleArray(filteredImages);

  const numFeatured = getRandomInt(1, Math.min(4, filteredImages.length));
  console.log(`🎲 Selecting ${numFeatured} featured images`);

  filteredImages.forEach((image, index) => {
    const img = new Image();
    img.src = image.src.replace(/^\/+/, '');

    const card = document.createElement('div');
    card.classList.add('dynamic-card');

    if (index < numFeatured) {
      card.classList.add('featured');
      console.log(`🌟 Featuring: ${image.title}`);
    }

    img.onload = () => {
      card.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;

      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <img src="${img.src}" alt="${image.title}" />
            <div class="text-wrapper front">
              <p class="title">${image.title}</p>
              <p class="subtitle">${image.subtitle || 'N/A'}</p>
            </div>
          </div>
          <div class="card-back">
            <div class="text-wrapper back">
              <p class="description">${image.description || 'No description available.'}</p>
            </div>
          </div>
        </div>`;

      portfolioGrid.appendChild(card);
      loadedImages++;

      if (loadedImages === totalImages) {
        console.log(`✅ Images loaded.`);
        finalizePortfolioGrid(portfolioGrid);
        stackInPortfolioImages();
      }
    };

    img.onerror = () => {
      console.error(`❌ Failed to load image: ${img.src}`);
      loadedImages++;
      if (loadedImages === totalImages) {
        finalizePortfolioGrid(portfolioGrid);
      }
    };
  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export function waitForPortfolioImages(attempts = 0) {
  if (attempts > 15) {
    devError('❌ Portfolio images failed to load.');
    return;
  }

  const portfolioGrid = document.querySelector('.portfolio-grid');
  const dynamicCards = document.querySelectorAll('.dynamic-card');

  if (portfolioGrid && window.appState.imagesLoaded) {
    devLog(`🔍 Locating images for ${window.appState.currentPage}`);
    document.dispatchEvent(new Event('portfolioReady'));
    return;
  }

  if (attempts > 0) {
    devWarn(`⏳ Waiting for portfolio images... Attempt ${attempts + 1}`);
  }

  setTimeout(() => waitForPortfolioImages(attempts + 1), 100);
}

document.addEventListener('portfolioReady', () => {
  if (!window.appState.imagesLoaded || window.appState.currentPage === 'home') return;

  const portfolioGrid = document.querySelector('.portfolio-grid');
  if (!portfolioGrid) {
    console.warn('❌ Portfolio grid not found.');
    return;
  }

  loadPortfolioImages(window.appState.images, window.appState.currentPage, portfolioGrid);

  console.log('🔄 Loading Portfolio.');
});
