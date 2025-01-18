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
};

const pageMappings = {
  "/street": "street",
  "/abstract": "abstract",
  "/architecture": "architecture",
  "/landscape": "landscape",
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
  if (contentPlaceholder) {
    while (contentPlaceholder.firstChild) {
      contentPlaceholder.removeChild(contentPlaceholder.firstChild);
    }
    devLog("Cleared content placeholder.");
  }
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

  clearContent();

  if (normalizedPath !== "/" && document.querySelector(".portfolio-grid")) {
    clearPortfolioGrid();
  }

  if (contentCache[normalizedPath]) {
    devLog(`Using cached content for ${normalizedPath}`);
    document.querySelector("#content-placeholder").innerHTML =
      contentCache[normalizedPath];
    handlePageSpecificLogic();
    return;
  }

  fetch(filePath)
    .then((response) => response.text())
    .then((html) => {
      const contentPlaceholder = document.querySelector("#content-placeholder");
      if (contentPlaceholder) {
        contentPlaceholder.innerHTML = html;
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
  if (portfolioGrid) {
    while (portfolioGrid.firstChild) {
      portfolioGrid.removeChild(portfolioGrid.firstChild);
    }
    portfolioGrid.dataset.loaded = "false";
    devLog("Portfolio grid cleared.");
  }
}

function redirectToHome() {
  const redirectPath = isDevelopment ? basePath : "/";
  console.warn(`Redirecting to home: ${redirectPath}`);
  history.replaceState(null, "", redirectPath);
  loadContent("/");
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
  appState.currentPath = initialPath;
  appState.currentPage =
    initialPath === "/" ? "home" : pageMappings[initialPath] || null;

  const hideFooterOnPages = ["street", "abstract", "architecture", "landscape"];
  toggleFooterVisibility(hideFooterOnPages.includes(appState.currentPage));

  if (!routes[initialPath]) {
    redirectToHome();
  } else {
    loadContent(initialPath);
  }
});

window.addEventListener("popstate", () => {
  const path = window.location.pathname.replace(basePath, "");
  if (routes[path]) {
    loadContent(path);
  } else {
    redirectToHome();
  }
});

let navigationInProgress = false;

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-link]");
  if (link && !navigationInProgress) {
    event.preventDefault();
    navigationInProgress = true;

    const path = link.getAttribute("href").replace(basePath, "");
    if (routes[path]) {
      history.pushState(null, "", path);
      loadContent(path);
    } else {
      redirectToHome();
    }

    setTimeout(() => (navigationInProgress = false), 500);
  }
});
