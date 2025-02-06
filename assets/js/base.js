import { devLog, devWarn } from './develop.js';
import { waitForAppState, loadHomeCards } from './images.js';

let firstRebuildDone = false;

if (!sessionStorage.getItem('firstRebuildDone')) {
  sessionStorage.setItem('firstRebuildDone', 'false');
}

export function ensureHomecardsExist() {
  const container = document.querySelector('.home-card-container');

  if (!container) {
    devWarn('⚠️ No `.home-card-container` found.');
    return;
  }

  const sections = ['abstract', 'architecture', 'landscape', 'street'];

  let suppressWarnings = sessionStorage.getItem('firstRebuildDone') === 'false';

  if (sessionStorage.getItem('firstRebuildDone') === 'false') {
    console.log('✅ First rebuild detected, suppressing warnings.');
    sessionStorage.setItem('firstRebuildDone', 'true');
  }

  sections.forEach((section) => {
    let homecard = document.querySelector(`.home-card[data-text="${section}"]`);

    if (!homecard) {
      if (!suppressWarnings) {
        devWarn(`⚠️ Missing homecard for ${section}, adding it now.`);
      }
      homecard = document.createElement('a');
      homecard.classList.add('home-card');
      homecard.setAttribute('data-text', section);
      container.appendChild(homecard);
    }

    let img = homecard.querySelector('img');
    if (!img) {
      if (!suppressWarnings) {
        devWarn(`⚠️ Missing <img> for ${section}, adding it now.`);
      }
      img = document.createElement('img');
      img.alt = `${section} image`;
      img.dataset.section = section;
      homecard.appendChild(img);
    }
  });
}
