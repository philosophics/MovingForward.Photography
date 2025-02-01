const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const isDevelopment = isLocal;
const basePath = "";

const routes = {
  "/": `assets/pages/home.html`,
  "/abstract": `assets/pages/abstract.html`,
  "/architecture": `assets/pages/architecture.html`,
  "/landscape": `assets/pages/landscape.html`,
  "/street": `assets/pages/street.html`,
  "/about": `assets/pages/about.html`,
  "/404": `assets/pages/404.html`,
};

const pageMappings = {
  "/street": "street",
  "/abstract": "abstract",
  "/architecture": "architecture",
  "/landscape": "landscape",
  "/about": "about",
  "/404": "404",
};

window.appState = {
  images: [],
  imagesLoaded: false,
  currentPath: window.location.pathname.replace(basePath, "") || "/",
  currentPage: null,
  loadedPages: new Set(),
};

console.log("window.appState is set:", window.appState);

window.devLog = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

if (!isDevelopment) {
  console.warn = window.devLog;
}

const imageDataPath = `assets/images/image-data.json`;

import { ensureHomecardsExist } from "./base.js";

const contentCache = {};

function clearContent() {
  const contentPlaceholder = document.querySelector("#content-placeholder");
  if (contentPlaceholder && contentPlaceholder.childElementCount > 0) {
    while (contentPlaceholder.firstChild) {
      contentPlaceholder.removeChild(contentPlaceholder.firstChild);
    }
    devLog("Cleared content placeholder.");
  } else {
    devLog("Content placeholder is already empty.");
  }
}

function isPageLoaded(page) {
  const portfolioGrid = document.querySelector(".portfolio-grid");
  return (
    appState.loadedPages.has(page) || portfolioGrid?.dataset.loaded === "true"
  );
}

function loadContent(path) {
  console.log(`🛠️ Loading content for: ${path}`);

  const normalizedPath =
    path === "/" || path === "/index.html" ? "/" : path.replace(basePath, "");
  const filePath = routes[normalizedPath] || routes["/"];

  appState.currentPath = normalizedPath;
  appState.currentPage =
    normalizedPath === "/" ? "home" : pageMappings[normalizedPath] || null;

  console.log(`🛠️ Fetching file: ${filePath}`);

  fetch(filePath)
    .then((response) => response.text())
    .then((html) => {
      console.log("✅ Content fetched. Preview:");
      console.log(html);

      const contentPlaceholder = document.querySelector("#content-placeholder");
      if (contentPlaceholder) {
        console.log(
          "🔄 Clearing and replacing inner HTML of #content-placeholder..."
        );

        // ✅ Clear and replace content
        contentPlaceholder.innerHTML = html;
        console.log(
          "✅ Content successfully inserted into #content-placeholder"
        );

        // ✅ Wait for homecards after content is inserted
        if (appState.currentPage === "home") {
          console.log("🏠 Home detected, ensuring homecards exist first...");

          ensureHomecardsExist(); // ✅ Make sure this function exists!

          function waitForHomecardContainer(attempts = 0) {
            const homecards = document.querySelectorAll(".home-card img");

            if (homecards.length >= 4) {
              console.log(`✅ Homecards detected in DOM: ${homecards.length}`);
              document.dispatchEvent(new Event("homeLoaded"));
            } else if (attempts < 20) {
              console.warn(
                `⏳ Waiting for homecards to appear... Attempt ${attempts + 1}`
              );
              setTimeout(() => waitForHomecardContainer(attempts + 1), 100);
            } else {
              console.error("❌ Homecards did not load in time.");
            }
          }

          waitForHomecardContainer();
        } else {
          console.log(
            "📂 Portfolio page detected, triggering portfolioLoaded."
          );
          document.dispatchEvent(new Event("portfolioLoaded"));
        }
      } else {
        console.error("❌ #content-placeholder not found.");
      }
    })
    .catch((err) => {
      console.error("❌ Error loading content:", err);
      redirectToHome();
    });
}

function observeHomecardsAndDispatch() {
  const observer = new MutationObserver((mutationsList, observer) => {
    const homecards = document.querySelectorAll(".home-card");
    if (homecards.length >= 4) {
      console.log(`✅ Homecards detected in DOM: ${homecards.length}`);
      document.dispatchEvent(new Event("homeLoaded"));
      observer.disconnect(); // Stop observing once the event fires
    }
  });

  observer.observe(document.querySelector("#content-placeholder"), {
    childList: true,
    subtree: true,
  });
}

if (appState.currentPage === "home") {
  console.log("🏠 Home detected, waiting for homecards...");
  observeHomecardsAndDispatch();
} else {
  console.log("📂 Portfolio page detected, triggering portfolioLoaded.");
  document.dispatchEvent(new Event("portfolioLoaded"));
}

function redirectToHome() {
  const redirectPath = isDevelopment ? basePath : "/";
  const normalizedPath =
    appState.currentPath === "/index.html" ? "/" : appState.currentPath;

  if (normalizedPath !== "/") {
    console.warn(`Redirecting to home: ${redirectPath}`);
    history.replaceState(null, "", redirectPath);
    loadContent("/");
  } else {
    devLog("Already at home. Skipping redirect.");
  }
}

function fetchContent(filePath, contentPlaceholder) {
  fetch(filePath)
    .then((response) => response.text())
    .then((html) => {
      if (contentPlaceholder) {
        contentPlaceholder.innerHTML = html;
        contentPlaceholder.classList.remove("fade-out");
        contentPlaceholder.classList.add("fade-in");
      }
      triggerPageEvents();
    })
    .catch((err) => {
      console.error("Error loading content:", err);
      redirectToHome();
    });
}

fetch(imageDataPath)
  .then((response) => response.json())
  .then((images) => {
    console.log(`📸 Loaded ${images.length} images into appState`);
    appState.images = images;
    appState.imagesLoaded = true;
    document.dispatchEvent(new Event("imagesReady"));
  })
  .catch((error) => console.error("❌ Error loading images:", error));

document.addEventListener("DOMContentLoaded", () => {
  const headerElement = document.querySelector("header");

  if (headerElement) {
    let attempts = 0;
    const maxAttempts = 10;

    function waitForHandleNavLogic() {
      if (typeof window.handleNavLogic === "function") {
        console.log("✅ handleNavLogic is now available!");
        window.handleNavLogic(headerElement);
      } else if (attempts < maxAttempts) {
        console.warn(
          `⏳ Waiting for handleNavLogic... Attempt ${attempts + 1}`
        );
        attempts++;
        setTimeout(waitForHandleNavLogic, 50);
      } else {
        console.error("❌ handleNavLogic failed to load.");
      }
    }

    waitForHandleNavLogic();
  }

  // Ensure appState initializes correctly
  const initialPath = window.location.pathname.replace(basePath, "") || "/";
  if (window.appState) {
    window.appState.currentPath = initialPath;

    // ✅ Ensure home page is correctly set
    if (initialPath === "/" || initialPath === "/index.html") {
      window.appState.currentPage = "home";
    } else {
      window.appState.currentPage = pageMappings[initialPath] || null;
    }
  }

  if (!routes[initialPath]) {
    redirectToHome();
  } else {
    loadContent(initialPath);
  }

  const hideFooterOnPages = ["street", "abstract", "architecture", "landscape"];

  function waitForToggleFooterVisibility(attempts = 0, maxAttempts = 10) {
    if (typeof window.toggleFooterVisibility === "function") {
      console.log("✅ toggleFooterVisibility is now available!");
      window.toggleFooterVisibility(
        hideFooterOnPages.includes(window.appState.currentPage)
      );
    } else if (attempts < maxAttempts) {
      console.warn(
        `⏳ Waiting for toggleFooterVisibility... Attempt ${attempts + 1}`
      );
      setTimeout(
        () => waitForToggleFooterVisibility(attempts + 1, maxAttempts),
        100
      );
    } else {
      console.error(
        "❌ toggleFooterVisibility failed to load after multiple attempts."
      );
    }
  }

  waitForToggleFooterVisibility();
});

function triggerPageEvents() {
  if (appState.currentPage === "home" && !isPageLoaded("home")) {
    appState.loadedPages.add("home");
    document.dispatchEvent(new Event("homeLoaded"));
  } else if (appState.currentPage && !isPageLoaded(appState.currentPage)) {
    appState.loadedPages.add(appState.currentPage);
    document.dispatchEvent(new Event("portfolioLoaded"));
  }
}

window.addEventListener("popstate", () => {
  const path = window.location.pathname.replace(basePath, "") || "/";
  devLog("Popstate triggered:", path);

  if (!routes[path]) {
    devLog(`Invalid path detected during popstate: ${path}`);
    redirectToHome();
    return;
  }

  if (appState.currentPath !== path) {
    devLog(`Navigating to: ${path}`);
    appState.currentPath = path;
    appState.currentPage = path === "/" ? "home" : pageMappings[path] || null;

    loadContent(path);
  } else {
    devLog(
      `Popstate triggered for the same path (${path}). Re-triggering events.`
    );
    triggerPageEvents();
  }
});

let isNavigating = false;

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-link]");
  if (link) {
    event.preventDefault();

    const path = link.getAttribute("href").replace(basePath, "");
    if (path !== appState.currentPath) {
      devLog(`Navigating to: ${path}`);
      appState.currentPath = path;
      appState.currentPage = pageMappings[path] || null;

      if (
        ["street", "abstract", "architecture", "landscape"].includes(
          appState.currentPage
        )
      ) {
        loadedImagePaths.clear();
      }

      loadContent(path);
      setTimeout(() => {
        triggerPageEvents();
      }, 0);
    } else {
      devLog(`Already on ${path}, skipping navigation.`);
      triggerPageEvents();
    }
  }
});

function apply404Background() {
  const body = document.body;
  body.style.background = "linear-gradient(180deg, #000428 0%, #00427b 80%)";
  body.style.backgroundColor = "#000428";
  devLog("Applied 404 background");
}

function resetBackground() {
  const body = document.body;
  body.style.background = "";
  body.style.backgroundColor = "";
}
