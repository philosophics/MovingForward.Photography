document.addEventListener("contextmenu", (event) => event.preventDefault());
document.addEventListener("DOMContentLoaded", () => {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const isDevelopment = isLocal;

  function devLog(...args) {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  const pathParts = window.location.pathname.split("/");
  const subDir = isLocal && pathParts.length > 2 ? `/${pathParts[1]}/` : "/";

  const currentPath = window.location.pathname.split("/").pop().split(".")[0];

  const headerPath = `${subDir}assets/pages/header.html`;

  fetch(headerPath)
    .then((response) => {
      if (!response.ok)
        throw new Error(`Failed to load header: ${response.status}`);
      return response.text();
    })
    .then((data) => {
      const headerElement = document.querySelector("header");
      headerElement.insertAdjacentHTML("beforeend", data);

      handleNavLogic(headerElement);
    })
    .catch((err) => console.error("Error loading header:", err));

  function handleNavLogic(headerElement) {
    const isHomePage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname === "/";

    if (!isHomePage) {
      const navHTML = `
          <nav>
            <ul class="desktop-nav">
              <!--<li><a href="../../index.html">Home</a></li>
              <li><a href="abstract.html">Abstract</a></li>
              <li><a href="architecture.html">Architecture</a></li>
              <li><a href="landscape.html">Landscape</a></li>
              <li><a href="street.html">Street</a></li>-->
            </ul>
    
            <label class="hamburger" for="menu-toggle">
              <input type="checkbox" id="menu-toggle" />
              <span class="bar top"></span>
              <span class="bar middle"></span>
              <span class="bar bottom"></span>
            </label>
            <ul class="mobile-nav">
              <!--<li><a href="../../index.html">Home</a></li>
              <li><a href="abstract.html">Abstract</a></li>
              <li><a href="architecture.html">Architecture</a></li>
              <li><a href="landscape.html">Landscape</a></li>
              <li><a href="street.html">Street</a></li>-->
            </ul>
          </nav>
        `;

      let nav = headerElement.querySelector("nav");

      if (!nav) {
        headerElement.insertAdjacentHTML("beforeend", navHTML);
        nav = headerElement.querySelector("nav");

        if (localStorage.getItem("nav-visible") === "true") {
          if (localStorage.getItem("nav-initial-animation") === "true") {
            requestAnimationFrame(() => {
              setTimeout(() => nav.classList.add("nav-visible"), 50);
            });
            localStorage.setItem("nav-initial-animation", "false");
            devLog("Navigation inserted and animated.");
          } else {
            nav.classList.add("nav-visible");
            devLog("Navigation inserted without animation (persisted state).");
          }
        } else {
          requestAnimationFrame(() => {
            setTimeout(() => nav.classList.add("nav-visible"), 50);
          });
          localStorage.setItem("nav-visible", "true");
          localStorage.setItem("nav-initial-animation", "false");
          devLog("Navigation inserted and animated for the first time.");
        }
      } else {
        devLog("Navigation already exists and visible.");
      }

      const menuToggle = document.getElementById("menu-toggle");
      const mobileNav = headerElement.querySelector(".mobile-nav");

      if (
        menuToggle &&
        mobileNav &&
        !menuToggle.hasAttribute("data-listener")
      ) {
        menuToggle.addEventListener("change", () => {
          if (menuToggle.checked) {
            mobileNav.classList.add("open");
          } else {
            mobileNav.classList.remove("open");
          }
        });
        menuToggle.setAttribute("data-listener", "true");
      }

      const navLinks = headerElement.querySelectorAll("nav a");
      navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          const targetUrl = link.getAttribute("href");

          if (targetUrl.includes("index.html") || targetUrl === "../../") {
            event.preventDefault();

            nav.classList.remove("nav-visible");

            setTimeout(() => {
              window.location.href = targetUrl;
            }, 100);
          }
        });
      });
    } else {
      localStorage.removeItem("nav-visible");
      localStorage.setItem("nav-initial-animation", "true");
    }
  }

  const footerPath = `${subDir}assets/pages/footer.html`;

  fetch(footerPath)
    .then((response) => response.text())
    .then((data) => {
      document.querySelector("footer").innerHTML = data;
    })
    .catch((err) => console.error("Error loading footer:", err));

  const imageDataPath = `${subDir}assets/images/image-data.json`;
  const isPortfolioPage = currentPath === "portfolio";
  const portfolioGrid = document.querySelector(".portfolio-grid");

  if (portfolioGrid) {
    devLog("Portfolio grid found. Attaching hover behavior...");
    attachHoverBehaviorAfterLoad();

    portfolioGrid.addEventListener("click", async (event) => {
      const card = event.target.closest(".dynamic-card");
      if (card) {
        const cards = getCards();
        currentIndex = cards.indexOf(card);

        if (currentIndex === -1) {
          console.error("Clicked card not found in cards array.");
          return;
        }

        openExpandedCard(card);
      }
    });
  } else if (isPortfolioPage) {
    console.warn(
      "No portfolio grid found. Skipping click handler and hover behavior."
    );
  }

  const dynamicCards = document.querySelectorAll(".dynamic-card");
  if (dynamicCards.length > 0) {
    devLog("Dynamic cards found. Setting up expanded card logic...");
    setupExpandedCardLogic();
  } else if (isPortfolioPage) {
    console.warn("No dynamic cards found. Skipping expanded card logic.");
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

  function setupHoverExpansion() {
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
  }

  fetch(imageDataPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((images) => {
      const currentPage = currentPath.split("/").pop().split(".")[0];
      const filteredImages = images.filter(
        (image) =>
          image.page === currentPage && !image.src.includes("/homecard/")
      );

      shuffleArray(filteredImages);

      const numToFeature = Math.max(1, Math.ceil(filteredImages.length / 5));
      const shuffledIndices = shuffleArray([
        ...Array(filteredImages.length).keys(),
      ]);
      const guaranteedFeaturedIndices = shuffledIndices.slice(0, numToFeature);

      let imagesLoaded = 0;
      const totalImages = filteredImages.length;
      let featuredAssigned = false;
      let cardsPopulated = 0;

      filteredImages.forEach((image, index) => {
        const card = document.createElement("div");
        card.classList.add("dynamic-card");

        if (
          window.innerWidth >= 1024 &&
          guaranteedFeaturedIndices.includes(index)
        ) {
          devLog("Assigning featured class to:", image.title);
          card.classList.add("featured");
          featuredAssigned = true;
        }

        const img = new Image();
        img.src = image.src;

        img.onload = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          card.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;

          const subtitle = image.subtitle || "N/A";
          const description = image.description || "No description available.";

          card.innerHTML = `
            <div class="card-inner">
              <div class="card-front">
                <img src="${image.src}" alt="${image.title}" />
                <div class="text-wrapper front">
                  <p class="title">${image.title}</p>
                  <p class="subtitle">${subtitle}</p>
                </div>
              </div>
              <div class="card-back">
                <div class="text-wrapper back">
                  <p class="description">${description}</p>
                </div>
              </div>
            </div>`;

          portfolioGrid.appendChild(card);
          cardsPopulated++;

          if (cardsPopulated === totalImages) {
            devLog("All cards fully populated. Applying featured logic.");
            setTimeout(() => {
              makeRandomImagesLarger();
              adjustTitleFontSize();
              setupHoverExpansion();
            }, 100);
          }
        };

        img.onerror = () => {
          console.error(`Failed to load image: ${image.src}`);
          portfolioGrid.appendChild(card);
          cardsPopulated++;

          if (cardsPopulated === totalImages) {
            devLog("All cards fully populated. Applying featured logic.");
            setTimeout(() => {
              makeRandomImagesLarger();
              adjustTitleFontSize();
              setupHoverExpansion();
            }, 100);
          }
        };
      });

      const sections = ["abstract", "architecture", "landscape", "street"];

      sections.forEach((section) => {
        const sectionImages = images.filter(
          (image) => image.page === section && image.src.includes("/homecard/")
        );

        if (sectionImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * sectionImages.length);
          const randomImage = sectionImages[randomIndex].src;

          const card = document.querySelector(
            `.home-card[data-text="${section}"] img`
          );
          if (card) {
            card.src = `${subDir}${randomImage}`;
          }
        } else {
          console.warn(`No homecard images found for section: ${section}`);
        }
      });
    })
    .catch((error) => console.error("Error loading images:", error));

  function makeRandomImagesLarger() {
    if (window.innerWidth < 1024) {
      devLog("Skipping featured logic for non-desktop views.");
      return;
    }

    devLog("Running makeRandomImagesLarger...");
    const featuredCards = portfolioGrid.querySelectorAll(
      ".dynamic-card.featured"
    );

    if (featuredCards.length === 0) {
      console.warn("No featured cards found in the grid.");
      return;
    }

    featuredCards.forEach((card) => {
      const img = card.querySelector("img");

      if (
        img &&
        img.complete &&
        img.naturalWidth > 0 &&
        img.naturalHeight > 0
      ) {
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

    devLog("Featured cards adjusted.");
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

    card.style.gridRow = `span ${rowSpan}`;
    card.style.gridColumn = `span ${colSpan}`;

    devLog("Set grid spans for featured card:", {
      title: card.querySelector(".title")?.innerText,
      width,
      height,
      rowSpan,
      colSpan,
    });
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

  function attachHoverBehaviorAfterLoad() {
    if (!portfolioGrid) return;

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
  }

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

  window.addEventListener("load", attachHoverBehaviorAfterLoad);

  let currentIndex = 0;
  function getCards() {
    return Array.from(document.querySelectorAll(".dynamic-card")).filter(
      (card) => card.offsetParent !== null
    );
  }

  if (portfolioGrid) {
    devLog("Portfolio grid found. Attaching hover behavior...");
    attachHoverBehaviorAfterLoad();

    portfolioGrid.addEventListener("click", async (event) => {
      const card = event.target.closest(".dynamic-card");
      if (card) {
        const cards = getCards();
        currentIndex = cards.indexOf(card);

        if (currentIndex === -1) {
          console.error("Clicked card not found in cards array.");
          return;
        }

        openExpandedCard(card);
      }
    });
  } else if (isPortfolioPage) {
    console.warn(
      "No portfolio grid found. Skipping click handler and hover behavior."
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
    const descriptionContainer = document.querySelector(
      ".description-container"
    );
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
    const descriptionContainer = document.querySelector(
      ".description-container"
    );
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
});
