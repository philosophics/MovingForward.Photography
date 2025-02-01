if (!window.appState) {
  console.warn("⚠️ appState is not ready in base.js. Waiting...");

  function waitForAppState(attempts = 0, maxAttempts = 10) {
    if (window.appState && window.appState.imagesLoaded) {
      console.log("✅ appState is now available in base.js.");
      initializeHomecards();
    } else if (attempts < maxAttempts) {
      console.warn(`⏳ Waiting for appState... Attempt ${attempts + 1}`);
      setTimeout(() => waitForAppState(attempts + 1, maxAttempts), 100);
    } else {
      console.error("❌ appState failed to initialize in base.js.");
    }
  }
  waitForAppState();
} else {
  console.log("✅ appState is already available in base.js.");
  initializeHomecards();
}

// ✅ Function to load homecards safely
function initializeHomecards() {
  document.addEventListener("homeLoaded", () => {
    console.log("🏠 homeLoaded event triggered, checking homecards...");
    waitForHomecardImages();
  });
}

export function loadHomeCards(images) {
  console.log(`📸 Loading homecards - Images available: ${images.length}`);
  if (!images.length) {
    console.error("❌ No images found for homecards.");
    return;
  }

  const sections = ["abstract", "architecture", "landscape", "street"];
  sections.forEach((section) => {
    const sectionImages = images.filter(
      (image) => image.page === section && image.src.includes("/homecard/")
    );

    console.log(
      `🔍 Found ${sectionImages.length} homecard images for ${section}`
    );

    if (sectionImages.length > 0) {
      const randomImage =
        sectionImages[Math.floor(Math.random() * sectionImages.length)];
      const card = document.querySelector(
        `.home-card[data-text="${section}"] img`
      );
      if (card) {
        console.log(
          `✅ Setting homecard image for ${section}: ${randomImage.src}`
        );
        card.src = `${randomImage.src.replace(/^\/+/, "")}`;
      } else {
        console.warn(`⚠️ No homecard element found for ${section}`);
      }
    }
  });
}

export function ensureHomecardsExist() {
  const sections = ["abstract", "architecture", "landscape", "street"];
  let container = document.querySelector(".home-card-container");

  if (!container) {
    console.error("❌ No `.home-card-container` found in the DOM.");
    return;
  }

  sections.forEach((section) => {
    let homecard = document.querySelector(`.home-card[data-text="${section}"]`);
    if (!homecard) {
      console.warn(`⚠️ Missing homecard for ${section}, adding it now.`);
      homecard = document.createElement("a");
      homecard.classList.add("home-card");
      homecard.setAttribute("data-text", section);
      homecard.innerHTML = `<img src="" alt="${section} image">`;
      container.appendChild(homecard);
    }
  });
}

function waitForHomecardImages(attempts = 0) {
  const homecards = document.querySelectorAll(".home-card img");

  if (homecards.length >= 4 && window.appState.imagesLoaded) {
    console.log(
      `✅ Homecards detected: ${homecards.length}, loading images...`
    );
    loadHomeCards(window.appState.images);
    throwInHomecards();
  } else if (attempts < 15) {
    // Try up to 15 times
    console.warn(
      `⏳ Waiting for homecards & images... Attempt ${attempts + 1}`
    );
    setTimeout(() => waitForHomecardImages(attempts + 1), 100);
  } else {
    console.error("❌ Homecards failed to load after multiple attempts.");
  }
}

document.addEventListener("homeLoaded", () => {
  console.log("🏠 homeLoaded event triggered, checking homecards...");
  waitForHomecardImages();
});

let homeAnimationFired = false;

export function throwInHomecards() {
  if (homeAnimationFired) {
    console.warn("⚠️ Homecard animations already fired. Skipping.");
    return;
  }

  console.log("🎬 Running throwInHomecards() - Ensuring images are loaded...");

  const homecards = document.querySelectorAll(".home-card img");
  let imagesLoaded = 0;

  homecards.forEach((img) => {
    img.style.visibility = "hidden"; // 👈 Hide until loaded

    if (img.complete && img.naturalHeight !== 0) {
      imagesLoaded++;
    } else {
      img.onload = () => {
        imagesLoaded++;
        img.style.visibility = "visible"; // 👈 Show only when fully loaded

        if (imagesLoaded === homecards.length) {
          animateHomecards();
        }
      };
      img.onerror = () => console.error(`❌ Image failed to load: ${img.src}`);
    }
  });

  if (imagesLoaded === homecards.length) {
    animateHomecards();
  }
}

function animateHomecards() {
  homeAnimationFired = true;
  console.log("🎬 Running throwInHomecards() - Animating homecards...");
  const homecards = document.querySelectorAll(".home-card");

  homecards.forEach((card, index) => {
    console.log(`🎭 Animating homecard ${index + 1}`);
    card.style.transform = "translateY(100vh)";
    card.style.opacity = "0";

    setTimeout(() => {
      card.style.transition = "transform 0.6s ease, opacity 0.6s ease";
      card.style.transform = "translateY(0)";
      card.style.opacity = "1";
    }, index * 100);
  });
}

export function scatterHomecards() {
  const homecards = document.querySelectorAll(".homecard");
  homecards.forEach((card) => {
    card.style.transform = `translate(${Math.random() * 200 - 100}px, ${
      Math.random() * 200 - 100
    }px) rotate(${Math.random() * 360}deg)`;
    card.style.transition = "transform 0.6s ease, opacity 0.6s ease";
    card.style.opacity = "0";
  });

  setTimeout(() => {
    stackInPortfolioGrid();
  }, 600);
}
