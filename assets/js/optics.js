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

window.devLog = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

if (!isDevelopment) {
  console.warn = window.devLog;
}

const imageDataPath = `assets/images/image-data.json`;

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
  const normalizedPath =
    path === "/" || path === "/index.html" ? "/" : path.replace(basePath, "");
  const filePath = routes[normalizedPath] || routes["/"];

  appState.currentPath = normalizedPath;
  appState.currentPage =
    normalizedPath === "/" ? "home" : pageMappings[normalizedPath] || null;

  devLog("Current Path:", appState.currentPath);
  devLog("Current Page:", appState.currentPage);

  const hideFooterOnPages = ["street", "abstract", "architecture", "landscape"];
  toggleFooterVisibility(hideFooterOnPages.includes(appState.currentPage));

  if (document.querySelector("#content-placeholder").childElementCount > 0) {
    clearContent();
  }

  fetch(filePath)
    .then((response) => response.text())
    .then((html) => {
      const contentPlaceholder = document.querySelector("#content-placeholder");
      if (contentPlaceholder) {
        contentPlaceholder.innerHTML = html;
      }

      const headerElement = document.querySelector("header");
      if (headerElement) {
        handleNavLogic(headerElement);

        if (appState.currentPage === "404") {
          apply404Background();
        } else {
          resetBackground();
        }
      }

      if (appState.currentPage === "home") {
        document.dispatchEvent(new Event("homeLoaded"));
      } else if (appState.currentPage) {
        document.dispatchEvent(new Event("portfolioLoaded"));
      }
    })
    .catch((err) => {
      console.error("Error loading content:", err);
      redirectToHome();
    });
}

function clearPortfolioGrid() {
  const portfolioGrid = document.querySelector(".portfolio-grid");
  if (portfolioGrid && portfolioGrid.childElementCount > 0) {
    while (portfolioGrid.firstChild) {
      portfolioGrid.removeChild(portfolioGrid.firstChild);
    }
    portfolioGrid.dataset.loaded = "false";
    devLog("Portfolio grid cleared.");
  } else {
    devLog("Portfolio grid was already cleared.");
  }
}

function redirectToHome() {
  const redirectPath = isDevelopment ? basePath : "/";
  if (appState.currentPath !== "/") {
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
    appState.images = images;
    appState.imagesLoaded = true;
    devLog(`Prepared ${images.length} images.`);
    document.dispatchEvent(new Event("imagesReady"));
  })
  .catch((error) => console.error("Error loading images:", error));

document.addEventListener("DOMContentLoaded", () => {
  const headerElement = document.querySelector("header");
  if (headerElement) {
    handleNavLogic(headerElement);
  }

  const initialPath = window.location.pathname.replace(basePath, "") || "/";
  if (appState) appState.currentPath = initialPath;
  appState.currentPage =
    initialPath === "/" ? "home" : pageMappings[initialPath] || null;

  if (!routes[initialPath]) {
    redirectToHome();
  } else {
    loadContent(initialPath);
  }

  const hideFooterOnPages = ["street", "abstract", "architecture", "landscape"];
  toggleFooterVisibility(hideFooterOnPages.includes(appState.currentPage));
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

      if (["street", "abstract", "architecture", "landscape"].includes(appState.currentPage)) {
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
