document.addEventListener("DOMContentLoaded", () => {
  const starContainers = document.querySelectorAll(
    ".box-of-star1, .box-of-star2, .box-of-star3, .box-of-star4"
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

  const currentPath = window.location.pathname; // Get the current page's path
  const isInSubdir = currentPath.includes("/assets/pages/"); // Check if we're in a subdirectory

  // Paths to header and footer based on the current location
  const headerPath = isInSubdir
    ? "../../assets/header.html"
    : "assets/header.html";
  const footerPath = isInSubdir
    ? "../../assets/footer.html"
    : "assets/footer.html";

  // Dynamically load the header
  fetch(headerPath)
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.text();
    })
    .then((data) => {
      document.querySelector("header").innerHTML = data; // Inject header HTML into the document

      // Disable "Moving Forward Photography" link if on the homepage
      if (currentPath.endsWith("index.html") || currentPath.endsWith("/")) {
        const homeTitle = document.querySelector("h1 a"); // Adjust to your header structure
        if (homeTitle) {
          homeTitle.removeAttribute("href"); // Remove the href to make it unclickable
          homeTitle.style.pointerEvents = "none"; // Disable pointer events
          homeTitle.style.cursor = "default"; // Change cursor to default
          homeTitle.style.color = "gray"; // Optional: Style it as inactive
        }
      }

      // Disable the link for the current page in the navigation bar
      const currentFile = currentPath.split("/").pop(); // Get the current file name
      document.querySelectorAll("nav a").forEach((link) => {
        if (link.getAttribute("href").includes(currentFile)) {
          link.style.pointerEvents = "none"; // Disable the link
          link.style.color = "gray"; // Optional: Style it as inactive
          link.style.cursor = "default"; // Change cursor to default
        }
      });
    })
    .catch((err) => console.error("Error loading header:", err));

  // Dynamically load the footer
  fetch(footerPath)
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.text();
    })
    .then((data) => {
      document.querySelector("footer").innerHTML = data; // Inject footer HTML into the document
    })
    .catch((err) => console.error("Error loading footer:", err));
});
