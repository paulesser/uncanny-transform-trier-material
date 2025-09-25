const upload = document.querySelector("#fileUpload");
const fontName = document.querySelector("#fontName");
upload.addEventListener("change", () => {
  const file = upload.files[0];
  if (!file) {
    return;
  }
  fontName.innerHTML = file.name;

  const reader = new FileReader();
  reader.onload = () => {
    const fontUrl = reader.result;
    const fontFace = new FontFace(file.name.split(".")[0], `url(${fontUrl})`);
    fontFace
      .load()
      .then(() => {
        document.fonts.add(fontFace);
        applyFontToCssVariables(fontFace);
      })
      .catch((error) => {
        console.error("Failed to load font:", error);
      });
  };
  reader.readAsDataURL(file);
});

function applyFontToCssVariables(fontFace) {
  const style = document.createElement("style");
  style.id = "dynamicFontStyle";
  style.innerHTML = `
    :root {
      --uploaded-font: ${fontFace.family};
    }
    `;
  if (document.getElementById("dynamicFontStyle")) {
    document.head.removeChild(document.getElementById("dynamicFontStyle"));
  }
  document.head.appendChild(style);
}
