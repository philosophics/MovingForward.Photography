document.addEventListener("DOMContentLoaded", () => {
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

  // Load header dynamically
  fetch("./assets/header.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load header.");
      }
      return response.text();
    })
    .then((headerHTML) => {
      document.querySelector("header").innerHTML = headerHTML;
    })
    .catch((error) => {
      console.error("Error loading header:", error);
    });

  // Load footer dynamically
  fetch("assets/footer.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load footer.");
      }
      return response.text();
    })
    .then((footerHTML) => {
      document.querySelector("footer").innerHTML = footerHTML;
    })
    .catch((error) => {
      console.error("Error loading footer:", error);
    });
});
