document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname; // Get the current page's path

  // Paths to header and footer
  const headerPath = "assets/pages/header.html"; // Adjusted for consistent path
  const footerPath = "assets/pages/footer.html"; // Adjusted for consistent path

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
