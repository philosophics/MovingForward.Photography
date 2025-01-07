filteredImages.forEach((image) => {
  const card = document.createElement("div");
  card.classList.add("card");

  const img = new Image();
  img.src = image.src;

  img.onload = () => {
    EXIF.getData(img, function () {
      const focalLength = EXIF.getTag(this, "FocalLength") || "N/A";
      const fStop = EXIF.getTag(this, "FNumber") || "N/A";
      const exposureTime = EXIF.getTag(this, "ExposureTime") || "N/A";
      const isoSpeed = EXIF.getTag(this, "ISOSpeedRatings") || "N/A";

      card.innerHTML = `
          <div class="card-front">
            <p class="title">${image.title}</p>
            <p class="subtitle">
              Focal Length: ${focalLength}, F-Stop: ${fStop}, Exposure: ${exposureTime}, ISO: ${isoSpeed}
            </p>
          </div>
          <div class="card-back">
            <p>Description for ${image.title}</p>
          </div>
        `;
      portfolioGrid.appendChild(card);
    });
  };
});
