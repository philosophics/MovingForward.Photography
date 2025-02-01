import {
  loadHomeCards,
  ensureHomecardsExist,
  throwInHomecards,
  scatterHomecards,
} from "./base.js";

window.toggleFooterVisibility = function toggleFooterVisibility(hide) {
  const footer = document.querySelector("footer");
  if (footer) {
    if (hide) {
      footer.classList.add("footer-hidden");
    } else {
      footer.classList.remove("footer-hidden");
    }
  }
};

function waitForAppState(callback) {
  if (window.appState) {
    console.log("✅ appState is now available:", window.appState);
    callback();
  } else {
    console.warn("⏳ Waiting for appState to be initialized...");
    setTimeout(() => waitForAppState(callback), 50);
  }
}

if (!window.appState) {
  console.error(
    "appState is undefined in script.js. optics.js may not have loaded first."
  );
}

const appState = window.appState;
console.log("appState in script.js:", appState);

document.addEventListener("contextmenu", (event) => event.preventDefault());

window.handleNavLogic = function handleNavLogic(headerElement) {
  const isHomePage = window.appState.currentPage === "home";
  const is404Page = window.appState.currentPage === "404";
  let nav = headerElement.querySelector("nav");

  if (!nav) {
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
      </nav>
    `;
    headerElement.insertAdjacentHTML("beforeend", navHTML);
    nav = headerElement.querySelector("nav");
  }

  if (isHomePage || is404Page) {
    nav.classList.remove("nav-visible");
  } else {
    nav.classList.add("nav-visible");
  }

  console.log("✅ handleNavLogic executed successfully!");
};

waitForAppState(() => {
  const appState = window.appState;
  console.log("🔄 Calling handleNavLogic after appState is available");
  window.handleNavLogic(document.querySelector("header"));
});

function updateNavigationVisibility() {
  const nav = document.querySelector("nav");
  const footer = document.querySelector("footer");

  if (!nav || !footer) return;

  if (appState.currentPage === "home") {
    nav.classList.remove("nav-visible");
    footer.classList.add("footer-visible");
  } else {
    nav.classList.add("nav-visible");
    footer.classList.remove("footer-visible");
  }
}

let images = [];
let imagesLoaded = false;

document.addEventListener("imagesReady", () => {
  console.log(`🔍 Checking current page: ${appState.currentPage}`);

  if (!appState.currentPage) {
    console.warn("⚠️ appState.currentPage is null! Setting to home.");
    appState.currentPage = "home";
  }

  if (appState.currentPage === "home" && !appState.imagesHandled) {
    console.log("🏠 Filtering images for home page...");
    const homeImages = appState.images.filter((image) =>
      image.src.includes("/homecard/")
    );
    console.log(`📸 Loading ${homeImages.length} homecard images`);
    loadHomeCards(homeImages);
  } else if (appState.currentPage) {
    console.log(`🖼️ Images ready for portfolio page: ${appState.currentPage}`);
    document.dispatchEvent(new Event("portfolioLoaded"));
  } else {
    console.warn("❌ No valid path or page to load images.");
  }

  appState.imagesHandled = true;
});

window.loadedImagePaths = new Set();
const isPortfolioPage = appState.currentPage !== null;
const portfolioGrid = document.querySelector(".portfolio-grid");
const dynamicCards = document.querySelectorAll(".dynamic-card");
if (dynamicCards.length > 0) {
  devLog("Dynamic cards found. Setting up expanded card logic...");
  setupExpandedCardLogic();
} else if (isPortfolioPage) {
  console.warn("No dynamic cards found. Skipping expanded card logic.");
}

if (typeof window.attachHoverBehaviorAfterLoad === "function") {
  window.addEventListener("load", window.attachHoverBehaviorAfterLoad);
} else {
  console.warn("❌ attachHoverBehaviorAfterLoad is not defined yet.");
}

let currentIndex = 0;

const starContainers = document.querySelectorAll(
  ".box-of-star-mobile, .box-of-star1, .box-of-star2, .box-of-star3, .box-of-star4"
);

starContainers.forEach((container) => {
  for (let i = 0; i < 100; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.top = `${Math.random() * 100}vh`;
    star.style.left = `${Math.random() * 100}vw`;
    container.appendChild(star);
  }
});

import "./portfolio.js";
