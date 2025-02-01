function waitForPortfolioGrid() {
  return new Promise((resolve) => {
    const portfolioGrid = document.querySelector(".portfolio-grid");
    if (portfolioGrid) {
      resolve();
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const grid = document.querySelector(".portfolio-grid");
      if (grid) {
        obs.disconnect();
        resolve();
      }
    });

    observer.observe(document.querySelector("#content-placeholder"), {
      childList: true,
      subtree: true,
    });
  });
}

function initializePortfolio() {
  const portfolioGrid = document.querySelector(".portfolio-grid");
  if (!portfolioGrid) {
    waitForPortfolioGrid().then(() => initializePortfolio());
    return;
  }

  portfolioGrid.innerHTML = "";
  loadedImagePaths.clear();

  if (portfolioGrid.dataset.loaded === "true") {
    devLog("Portfolio already initialized. Skipping initialization.");
    return;
  }

  loadPortfolioImages(appState.images, appState.currentPage, portfolioGrid);

  portfolioGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".dynamic-card");
    if (card) {
      openExpandedCard(card);
    }
  });

  devLog("Portfolio initialization triggered.");
}

document.addEventListener("portfolioLoaded", () => {
  console.log(`🖼️ Loading images for portfolio page: ${appState.currentPage}`);

  const portfolioImages = appState.images.filter(
    (image) => image.page === appState.currentPage
  );

  console.log(
    `📷 Found ${portfolioImages.length} images for ${appState.currentPage}`
  );

  if (portfolioImages.length > 0) {
    initializePortfolio(portfolioImages);
  } else {
    console.warn(`⚠️ No images found for ${appState.currentPage}`);
  }
});

function loadPortfolioImages(images, currentPage, portfolioGrid) {
  const filteredImages = images.filter(
    (image) => image.page === currentPage && !image.src.includes("/homecard/")
  );

  devLog("Filtered Images for Portfolio:", filteredImages);

  if (!filteredImages.length) {
    console.warn("No portfolio images found for the current page.");
    finalizePortfolioGrid(portfolioGrid);
    return;
  }

  let loadedImages = 0;
  const totalImages = filteredImages.length;

  shuffleArray(filteredImages);

  filteredImages.forEach((image, index) => {
    const imagePath = image.src.replace(/^\/+/, "");

    if (loadedImagePaths.has(imagePath)) {
      devLog(`Image already loaded: ${imagePath}. Skipping.`);
      loadedImages++;
      if (loadedImages === totalImages) {
        finalizePortfolioGrid(portfolioGrid);
      }
      return;
    }

    loadedImagePaths.add(imagePath);

    const card = document.createElement("div");
    card.classList.add("dynamic-card");

    const img = new Image();
    img.src = imagePath;
    img.setAttribute("loading", "lazy");

    if (index < 4) {
      card.classList.add("featured");
      devLog("Assigning featured class to:", image.title);
    }

    img.onload = () => {
      card.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
      card.innerHTML = `
              <div class="card-inner">
                <div class="card-front">
                  <img src="${img.src}" alt="${image.title}" />
                  <div class="text-wrapper front">
                    <p class="title">${image.title}</p>
                    <p class="subtitle">${image.subtitle || "N/A"}</p>
                  </div>
                </div>
                <div class="card-back">
                  <div class="text-wrapper back">
                    <p class="description">${
                      image.description || "No description available."
                    }</p>
                  </div>
                </div>
              </div>`;
      portfolioGrid.appendChild(card);

      loadedImages++;
      if (loadedImages === totalImages) {
        finalizePortfolioGrid(portfolioGrid);
      }
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${img.src}`);
      loadedImages++;
      if (loadedImages === totalImages) {
        finalizePortfolioGrid(portfolioGrid);
      }
    };
  });
}

function finalizePortfolioGrid(portfolioGrid) {
  devLog("Finalizing portfolio grid layout...");

  makeRandomImagesLarger();
  adjustTitleFontSize();
  setupHoverExpansion();

  portfolioGrid.dataset.loaded = "true";
  devLog("Portfolio grid finalized.");
}

function makeRandomImagesLarger() {
  const portfolioGrid = document.querySelector(".portfolio-grid");

  if (!portfolioGrid) {
    console.warn("Portfolio grid not found. Skipping makeRandomImagesLarger.");
    return;
  }

  if (window.innerWidth < 1024) {
    devLog("Skipping featured logic for non-desktop views.");
    return;
  }

  const featuredCards = portfolioGrid.querySelectorAll(
    ".dynamic-card.featured"
  );

  if (featuredCards.length === 0) {
    console.warn("No featured cards found in the grid.");
    return;
  }

  featuredCards.forEach((card) => {
    const img = card.querySelector("img");

    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      applySpans(card, img);
    } else if (img) {
      console.warn("Image not ready for card. Waiting for load event:", card);

      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          requestAnimationFrame(() => applySpans(card, img));
        } else {
          console.error("Failed to get valid dimensions for image:", img);
        }
      };
    } else {
      console.warn("No image found in card:", card);
    }
  });
}

function applySpans(card, img) {
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

  card.style.transition = "all 0.5s ease-in-out";
  card.style.gridRow = `span ${rowSpan}`;
  card.style.gridColumn = `span ${colSpan}`;
}

function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

window.setupHoverExpansion = function setupHoverExpansion() {
  if (window.innerWidth < 1024) return;

  const cards = document.querySelectorAll(".dynamic-card");

  cards.forEach((card) => {
    const textWrapper = card.querySelector(".text-wrapper");
    const title = card.querySelector(".title");
    const subtitle = card.querySelector(".subtitle");

    if (textWrapper && title && subtitle) {
      const initialHeight = title.scrollHeight + 16;
      const expandedHeight = title.scrollHeight + subtitle.scrollHeight + 16;

      textWrapper.style.height = `${initialHeight}px`;

      card.addEventListener("mouseenter", () => {
        textWrapper.style.height = `${expandedHeight}px`;
      });

      card.addEventListener("mouseleave", () => {
        textWrapper.style.height = `${initialHeight}px`;
      });
    }
  });
};

window.attachHoverBehaviorAfterLoad = function attachHoverBehaviorAfterLoad() {
  const portfolioPages = ["abstract", "architecture", "landscape", "street"];

  if (!portfolioPages.includes(window.appState.currentPage)) {
    console.log(
      "ℹ️ Not on a portfolio page. Skipping attachHoverBehaviorAfterLoad."
    );
    return;
  }

  const portfolioGrid = document.querySelector(".portfolio-grid");
  if (!portfolioGrid) {
    console.warn(
      "⚠️ portfolioGrid is not available, but it's expected on this page."
    );
    return;
  }

  const observer = new MutationObserver(() => {
    const cards = portfolioGrid.querySelectorAll(
      ".dynamic-card:not(.hover-attached)"
    );

    cards.forEach((card) => {
      adjustCardHoverBehaviorForCard(card);
      card.classList.add("hover-attached");
    });
  });

  observer.observe(portfolioGrid, { childList: true, subtree: true });
  portfolioGrid.dataset.hoverAttached = "true";
  console.log("✅ attachHoverBehaviorAfterLoad executed successfully!");
};

function adjustCardHoverBehaviorForCard(card) {
  const frontWrapper = card.querySelector(".text-wrapper.front");
  const title = frontWrapper?.querySelector(".title");
  const subtitle = frontWrapper?.querySelector(".subtitle");

  if (frontWrapper && title && subtitle) {
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
      const wrapperPadding =
        parseInt(window.getComputedStyle(frontWrapper).paddingTop) +
        parseInt(window.getComputedStyle(frontWrapper).paddingBottom);

      const initialHeight = title.scrollHeight + wrapperPadding;
      frontWrapper.style.height = `${initialHeight}px`;
      frontWrapper.style.transition = "height 0.3s ease";

      card.addEventListener("mouseenter", () => {
        const expandedHeight =
          title.scrollHeight + subtitle.scrollHeight + wrapperPadding;
        frontWrapper.style.height = `${expandedHeight}px`;
        subtitle.style.opacity = "1";
        subtitle.style.transform = "translateY(0)";
      });

      card.addEventListener("mouseleave", () => {
        frontWrapper.style.height = `${initialHeight}px`;
        subtitle.style.opacity = "0";
        subtitle.style.transform = "translateY(10px)";
      });
    } else {
      frontWrapper.style.height = "auto";
      subtitle.style.opacity = "1";
      subtitle.style.transform = "translateY(0)";
    }
  }
}

function getCards() {
  return Array.from(document.querySelectorAll(".dynamic-card")).filter(
    (card) => card.offsetParent !== null
  );
}

function openExpandedCard(card) {
  const descriptionText = card.querySelector(".description")?.innerText;

  let overlay = document.querySelector(".overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);
  }

  const existingExpandedCard = overlay.querySelector(".expanded-card");
  if (existingExpandedCard) {
    overlay.removeChild(existingExpandedCard);
  }

  const cardRect = card.getBoundingClientRect();
  const expandedCard = card.cloneNode(true);
  expandedCard.originalCardRect = cardRect;

  expandedCard.classList.add("expanded-card");
  expandedCard.style.position = "fixed";
  expandedCard.style.top = `${cardRect.top + window.scrollY}px`;
  expandedCard.style.left = `${cardRect.left}px`;
  expandedCard.style.width = `${cardRect.width}px`;
  expandedCard.style.height = `${cardRect.height}px`;
  expandedCard.style.zIndex = "1000";
  expandedCard.style.transition = "all 0.5s ease-in-out";

  overlay.appendChild(expandedCard);
  overlay.style.display = "flex";

  addNavigationArrows(expandedCard, overlay);
  // FIXME: https://github.com/philosophics/MovingForward.Photography/issues/1 Investigate why text-wrapper visibility glitches on hover
  const expandedImg = expandedCard.querySelector("img");
  const textWrapperBack = expandedCard.querySelector(".text-wrapper.back");
  const subtitle = expandedCard.querySelector(".subtitle");

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
        expandedCard.style.width = "90vw";
        expandedCard.style.height = "auto";
      } else {
        expandedCard.style.width = "auto";
        expandedCard.style.height = "90vh";
      }

      if (textWrapperBack) {
        if (window.innerWidth <= 768) {
          textWrapperBack.style.display = "flex";
          textWrapperBack.style.opacity = "1";
          textWrapperBack.style.transform = "translateY(0)";
        } else {
          expandedCard.addEventListener("mouseenter", () => {
            textWrapperBack.style.display = "flex";
            textWrapperBack.style.opacity = "1";
            textWrapperBack.style.transform = "translateY(0)";
          });

          expandedCard.addEventListener("mouseleave", () => {
            textWrapperBack.style.opacity = "0";
            textWrapperBack.style.transform = "translateY(10px)";
            setTimeout(() => {
              textWrapperBack.style.display = "none";
            }, 400);
          });
        }
      } else {
        console.error("No .text-wrapper.back found in expanded card");
      }

      if (subtitle && window.innerWidth <= 768) {
        subtitle.style.opacity = "1";
        subtitle.style.transform = "translateY(0)";
        subtitle.style.transition = "none";
      }
    };
  }

  requestAnimationFrame(() => {
    expandedCard.style.transition = "all 0.5s ease-in-out";
    expandedCard.style.top = "50%";
    expandedCard.style.left = "50%";
    expandedCard.style.transform = "translate(-50%, -50%) scale(1)";
  });

  const closeBtn = document.createElement("button");
  closeBtn.classList.add("close-btn");
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", () =>
    closeExpandedCard(expandedCard, cardRect, overlay)
  );

  expandedCard.appendChild(closeBtn);
  window.addEventListener("keydown", handleKeyNavigation);
}

function addNavigationArrows(expandedCard, overlay) {
  const prevArrow = document.createElement("button");
  prevArrow.classList.add("arrow", "prev");
  prevArrow.innerHTML = `
              <div class="arrow-inner">
                <div class="arrow-top"></div>
                <div class="arrow-bottom"></div>
              </div>
            `;
  prevArrow.addEventListener("click", () => showPreviousImage(overlay));

  const nextArrow = document.createElement("button");
  nextArrow.classList.add("arrow", "next");
  nextArrow.innerHTML = `
              <div class="arrow-inner">
                <div class="arrow-top"></div>
                <div class="arrow-bottom"></div>
              </div>
            `;
  nextArrow.addEventListener("click", () => showNextImage(overlay));

  expandedCard.appendChild(prevArrow);
  expandedCard.appendChild(nextArrow);
}

function showPreviousImage(overlay) {
  hideDescription();
  const cards = getCards();
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  transitionToNewCard(cards[currentIndex], overlay);
}

function showNextImage(overlay) {
  hideDescription();
  const cards = getCards();
  currentIndex = (currentIndex + 1) % cards.length;
  transitionToNewCard(cards[currentIndex], overlay);
}

function transitionToNewCard(newCard, overlay) {
  hideDescription();

  const existingExpandedCard = overlay.querySelector(".expanded-card");
  if (existingExpandedCard) {
    overlay.removeChild(existingExpandedCard);
  }

  openExpandedCard(newCard);
}

function adjustTitleFontSize() {
  if (window.innerWidth < 1024) return;

  const titles = document.querySelectorAll(".text-wrapper .title");

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

function showDescription(descriptionText) {
  let descriptionContainer = document.querySelector(".description-container");
  if (!descriptionContainer) {
    descriptionContainer = document.createElement("div");
    descriptionContainer.classList.add("description-container");
    document.body.appendChild(descriptionContainer);
  }

  descriptionContainer.innerText = descriptionText;
  descriptionContainer.style.display = "block";
  requestAnimationFrame(() => {
    descriptionContainer.classList.add("show");
  });
}

function positionDescription(expandedCard) {
  const descriptionContainer = document.querySelector(".description-container");
  if (!descriptionContainer) return;

  const expandedCardRect = expandedCard.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const footerTop = document
    .querySelector("footer")
    .getBoundingClientRect().top;

  const spaceBelowCard = footerTop - expandedCardRect.bottom;
  const minPadding = 20;
  const descriptionTop =
    expandedCardRect.bottom + Math.max(spaceBelowCard / 2, minPadding);

  descriptionContainer.style.top = `${Math.min(
    descriptionTop,
    footerTop - minPadding
  )}px`;
  descriptionContainer.style.display = "block";
}

function hideDescription() {
  const descriptionContainer = document.querySelector(".description-container");
  if (!descriptionContainer) return;

  descriptionContainer.classList.remove("show");
  descriptionContainer.classList.add("hide");

  setTimeout(() => {
    descriptionContainer.style.display = "none";
    descriptionContainer.classList.remove("hide");
  }, 400);
}

function closeExpandedCard(expandedCard, cardRect, overlay) {
  hideDescription();
  expandedCard.style.transition = "all 0.5s ease-in-out";
  expandedCard.style.top = `${cardRect.top + window.scrollY}px`;
  expandedCard.style.left = `${cardRect.left}px`;
  expandedCard.style.width = `${cardRect.width}px`;
  expandedCard.style.height = `${cardRect.height}px`;
  expandedCard.style.transform = "none";

  setTimeout(() => {
    overlay.style.display = "none";
    overlay.innerHTML = "";
    window.removeEventListener("keydown", handleKeyNavigation);
  }, 500);
}

function handleKeyNavigation(event) {
  const overlay = document.querySelector(".overlay");
  if (!overlay) return;

  if (event.key === "ArrowLeft") {
    showPreviousImage(overlay);
  } else if (event.key === "ArrowRight") {
    showNextImage(overlay);
  } else if (event.key === "Escape") {
    document.querySelector(".close-btn").click();
  }
}

function stackInPortfolioGrid() {
  const portfolioGrid = document.querySelector(".portfolioGrid");
  if (portfolioGrid) {
    portfolioGrid.style.opacity = "0";
    portfolioGrid.style.transform = "translateY(100vh)";
    portfolioGrid.style.transition = "transform 0.6s ease, opacity 0.6s ease";

    setTimeout(() => {
      portfolioGrid.style.transform = "translateY(0)";
      portfolioGrid.style.opacity = "1";
    }, 100);
  }
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
