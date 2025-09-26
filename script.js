const API_BASE_URL = "";

class TypefaceGenerator {
  constructor() {
    this.canvas = document.getElementById("letterCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.currentFont = null;
    this.currentLetter = "A";
    this.generatedLetters = new Map();
    this.currentPreviewBlob = null;

    this.initializeElements();
    this.bindEvents();
    this.updateSliderValues();
    this.drawDefaultLetter();
  }

  initializeElements() {
    this.elements = {
      letterSelect: document.getElementById("letterSelect"),
      fontUpload: document.getElementById("fontUpload"),
      fontStatus: document.getElementById("fontStatus"),
      fontSize: document.getElementById("fontSize"),
      fontSizeValue: document.getElementById("fontSizeValue"),
      modelSelect: document.getElementById("modelSelect"),
      promptInput: document.getElementById("promptInput"),
      negativePromptInput: document.getElementById("negativePromptInput"),
      guidanceScale: document.getElementById("guidanceScale"),
      guidanceScaleValue: document.getElementById("guidanceScaleValue"),
      strength: document.getElementById("strength"),
      strengthValue: document.getElementById("strengthValue"),
      steps: document.getElementById("steps"),
      stepsValue: document.getElementById("stepsValue"),
      seed: document.getElementById("seed"),
      randomSeed: document.getElementById("randomSeed"),
      blurNoise: document.getElementById("blurNoise"),
      blurNoiseValue: document.getElementById("blurNoiseValue"),
      blurMask: document.getElementById("blurMask"),
      blurMaskValue: document.getElementById("blurMaskValue"),
      generatePreview: document.getElementById("generatePreview"),
      generateFont: document.getElementById("generateFont"),
      generationStatus: document.getElementById("generationStatus"),
      generatedLetters: document.getElementById("generatedLetters"),
      duotoneToggle: document.getElementById("duotoneToggle"),
      duotoneThreshold: document.getElementById("duotoneThreshold"),
      duotoneThresholdValue: document.getElementById("duotoneThresholdValue"),
      duotoneThresholdGroup: document.getElementById("duotoneThresholdGroup"),
      exportPreview: document.getElementById("exportPreview"),
      exportFullFont: document.getElementById("exportFullFont"),
      turdsize: document.getElementById("turdsize"),
      turdsizeValue: document.getElementById("turdsizeValue"),
      alphamax: document.getElementById("alphamax"),
      alphamaxValue: document.getElementById("alphamaxValue"),
      opttolerance: document.getElementById("opttolerance"),
      opttoleranceValue: document.getElementById("opttoleranceValue"),
      blacklevel: document.getElementById("blacklevel"),
      blacklevelValue: document.getElementById("blacklevelValue"),
      svgColor: document.getElementById("svgColor"),
      fontName: document.getElementById("fontName"),
      downloadPreview: document.getElementById("downloadPreview"),
      exportOtf: document.getElementById("exportOtf"),
    };
  }

  bindEvents() {
    this.elements.letterSelect.addEventListener("change", (e) => {
      this.currentLetter = e.target.value;
      this.drawLetter();
    });

    this.elements.fontUpload.addEventListener("change", (e) =>
      this.handleFontUpload(e),
    );

    this.elements.fontSize.addEventListener("input", () => {
      this.updateSliderValues();
      this.drawLetter();
    });

    this.elements.guidanceScale.addEventListener("input", () =>
      this.updateSliderValues(),
    );
    this.elements.strength.addEventListener("input", () =>
      this.updateSliderValues(),
    );
    this.elements.steps.addEventListener("input", () =>
      this.updateSliderValues(),
    );
    this.elements.blurNoise.addEventListener("input", () =>
      this.updateSliderValues(),
    );
    this.elements.blurMask.addEventListener("input", () =>
      this.updateSliderValues(),
    );
    this.elements.duotoneThreshold.addEventListener("input", () =>
      this.updateSliderValues(),
    );
    this.elements.turdsize.addEventListener("input", () =>
      this.updateSliderValues(),
    );
    this.elements.alphamax.addEventListener("input", () =>
      this.updateSliderValues(),
    );
    this.elements.opttolerance.addEventListener("input", () =>
      this.updateSliderValues(),
    );
    this.elements.blacklevel.addEventListener("input", () =>
      this.updateSliderValues(),
    );

    this.elements.duotoneToggle.addEventListener("change", () => {
      const isEnabled = this.elements.duotoneToggle.checked;
      this.elements.duotoneThresholdGroup.style.display = isEnabled
        ? "block"
        : "none";
    });

    this.elements.randomSeed.addEventListener("click", () => {
      this.elements.seed.value = Math.floor(Math.random() * 1000000);
    });

    this.elements.generatePreview.addEventListener("click", () =>
      this.generateSingleLetter(),
    );
    this.elements.generateFont.addEventListener("click", () =>
      this.generateFullFont(),
    );
    this.elements.exportPreview.addEventListener("click", () =>
      this.exportPreview(),
    );
    this.elements.exportFullFont.addEventListener("click", () =>
      this.exportFullFont(),
    );
    this.elements.downloadPreview.addEventListener("click", () =>
      this.downloadPreview(),
    );
    this.elements.exportOtf.addEventListener("click", () => this.exportOft());

    this.elements.modelSelect.addEventListener("change", () => {
      const isturbo =
        this.elements.modelSelect.value === "stable-diffusion-xl-turbo";
      if (isturbo) {
        this.elements.guidanceScale.value = "0";
        this.elements.steps.value = "4";
      } else {
        this.elements.guidanceScale.value = "7.5";
        this.elements.steps.value = "10";
      }
      this.updateSliderValues();
    });
  }

  updateSliderValues() {
    this.elements.fontSizeValue.textContent = this.elements.fontSize.value;
    this.elements.guidanceScaleValue.textContent =
      this.elements.guidanceScale.value;
    this.elements.strengthValue.textContent = this.elements.strength.value;
    this.elements.stepsValue.textContent = this.elements.steps.value;
    this.elements.blurNoiseValue.textContent = this.elements.blurNoise.value;
    this.elements.blurMaskValue.textContent = this.elements.blurMask.value;
    this.elements.duotoneThresholdValue.textContent =
      this.elements.duotoneThreshold.value;
    this.elements.turdsizeValue.textContent = this.elements.turdsize.value;
    this.elements.alphamaxValue.textContent = this.elements.alphamax.value;
    this.elements.opttoleranceValue.textContent =
      this.elements.opttolerance.value;
    this.elements.blacklevelValue.textContent = this.elements.blacklevel.value;
  }

  async handleFontUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.currentFont = opentype.parse(arrayBuffer);
      this.elements.fontStatus.textContent = `Loaded: ${file.name}`;
      this.elements.fontStatus.style.color = "var(--success-color)";
      this.drawLetter();
    } catch (error) {
      console.error("Error loading font:", error);
      this.elements.fontStatus.textContent = "Error loading font";
      this.elements.fontStatus.style.color = "var(--danger-color)";
    }
  }

  drawDefaultLetter() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawDefaultLetterOnContext(this.ctx);
  }

  drawDefaultLetterOnContext(ctx) {
    ctx.fillStyle = "black";
    ctx.font = `${this.elements.fontSize.value}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      this.currentLetter,
      this.canvas.width / 2,
      this.canvas.height / 2,
    );
  }

  drawLetter() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawLetterOnContext(this.ctx);
  }

  drawLetterOnContext(ctx) {
    if (this.currentFont) {
      const fontSize = parseInt(this.elements.fontSize.value);
      const path = this.currentFont.getPath(
        this.currentLetter,
        (this.canvas.width - fontSize * 0.6) / 2,
        (this.canvas.height + fontSize * 0.4) / 2,
        fontSize,
      );

      ctx.fillStyle = "black";
      path.draw(ctx);
      path.fill = "black";
      ctx.fill();
    } else {
      this.drawDefaultLetterOnContext(ctx);
    }
  }

  async generateSingleLetter() {
    this.setGenerationStatus("generating", "Generating...");
    this.elements.generatePreview.disabled = true;

    try {
      const maskBlob = await this.canvasToBlob();

      const noiseBlob = await this.applyNoise(maskBlob);

      const generatedImage = await this.generateImage(noiseBlob);

      this.displayGeneratedImage(generatedImage);
      this.currentPreviewBlob = generatedImage;

      this.addToGeneratedLetters(this.currentLetter, generatedImage);

      this.setGenerationStatus("success", "Generated!");
    } catch (error) {
      console.error("Generation error:", error);
      this.setGenerationStatus("error", "Generation failed");
    } finally {
      this.elements.generatePreview.disabled = false;
      setTimeout(() => this.setGenerationStatus("ready", "Ready"), 3000);
    }
  }

  async generateFullFont() {
    this.setGenerationStatus("generating", "Generating full font...");
    this.elements.generateFont.disabled = true;
    this.elements.generatePreview.disabled = true;

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    this.generatedLetters.clear();
    this.elements.generatedLetters.innerHTML = "";

    try {
      for (const letter of alphabet) {
        this.currentLetter = letter;
        this.elements.letterSelect.value = letter;
        this.drawLetter();

        this.setGenerationStatus("generating", `Generating ${letter}...`);

        const maskBlob = await this.canvasToBlob();
        const noiseBlob = await this.applyNoise(maskBlob);
        const generatedImage = await this.generateImage(noiseBlob);

        this.displayGeneratedImage(generatedImage);
        this.currentPreviewBlob = generatedImage;
        this.addToGeneratedLetters(letter, generatedImage);

        await this.delay(100);
      }

      this.setGenerationStatus("success", "Font generated!");
    } catch (error) {
      console.error("Font generation error:", error);
      this.setGenerationStatus("error", "Generation failed");
    } finally {
      this.elements.generateFont.disabled = false;
      this.elements.generatePreview.disabled = false;
      setTimeout(() => this.setGenerationStatus("ready", "Ready"), 3000);
    }
  }

  async canvasToBlob() {
    // Create a clean mask with only the black letter on white background
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = this.canvas.width;
    maskCanvas.height = this.canvas.height;
    const maskCtx = maskCanvas.getContext("2d");

    // Fill with white background
    maskCtx.fillStyle = "white";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Draw the letter in black
    this.drawLetterOnContext(maskCtx, "black");

    return new Promise((resolve) => {
      maskCanvas.toBlob(resolve, "image/png");
    });
  }

  async applyNoise(imageBlob) {
    const formData = new FormData();
    formData.append("image", imageBlob);
    formData.append("blur_noise", this.elements.blurNoise.value);
    formData.append("blur_mask", this.elements.blurMask.value);

    const response = await fetch(`${API_BASE_URL}/noise`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Noise generation failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  async generateImage(imageBlob) {
    const formData = new FormData();
    formData.append("image", imageBlob);
    formData.append("prompt", this.elements.promptInput.value || "");
    formData.append(
      "negative_prompt",
      this.elements.negativePromptInput.value || "",
    );
    formData.append("seed", this.elements.seed.value);
    formData.append("steps", this.elements.steps.value);
    formData.append("strength", this.elements.strength.value);
    formData.append("guidance_scale", this.elements.guidanceScale.value);

    const model = this.elements.modelSelect.value;
    const response = await fetch(`${API_BASE_URL}/generate/${model}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  async displayGeneratedImage(blob) {
    try {
      let displayBlob = blob;

      // Apply duotone if toggle is enabled
      if (this.elements.duotoneToggle.checked) {
        displayBlob = await this.applyDuotone(blob);
      }

      const url = URL.createObjectURL(displayBlob);
      const img = new Image();
      img.onload = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (error) {
      console.error("Error displaying image:", error);
      // Fallback to original image
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }

  addToGeneratedLetters(letter, blob) {
    this.generatedLetters.set(letter, blob);

    const letterItem = document.createElement("div");
    letterItem.className = "letter-item";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(blob);

    const downloadBtn = document.createElement("button");
    downloadBtn.className = "letter-download-btn";
    downloadBtn.title = "Download image";
    downloadBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
        `;

    downloadBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent triggering the letter click
      this.downloadImage(blob, `letter-${letter}.png`);
    });

    const label = document.createElement("div");
    label.className = "letter-label";
    label.textContent = letter;

    letterItem.appendChild(img);
    letterItem.appendChild(downloadBtn);
    letterItem.appendChild(label);

    letterItem.addEventListener("click", () => {
      this.currentLetter = letter;
      this.elements.letterSelect.value = letter;
      this.displayGeneratedImage(blob);
      this.currentPreviewBlob = blob;
    });

    this.elements.generatedLetters.appendChild(letterItem);
  }

  setGenerationStatus(status, text) {
    this.elements.generationStatus.textContent = text;
    this.elements.generationStatus.className = status;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async applyDuotone(imageBlob) {
    const formData = new FormData();
    formData.append("image", imageBlob);
    formData.append("threshold", this.elements.duotoneThreshold.value);

    const response = await fetch(`${API_BASE_URL}/duotone`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Duotone conversion failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  async traceToSVG(imageBlob) {
    const bw = await this.applyDuotone(imageBlob);
    const formData = new FormData();
    formData.append("image", bw);
    formData.append("turdsize", this.elements.turdsize.value);
    formData.append("alphamax", this.elements.alphamax.value);
    formData.append("opttolerance", this.elements.opttolerance.value);
    formData.append("blacklevel", this.elements.blacklevel.value);
    formData.append("color", this.elements.svgColor.value);

    const response = await fetch(`${API_BASE_URL}/trace`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`SVG tracing failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  async blobToString(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(blob);
    });
  }
  async exportPreview() {
    if (!this.currentPreviewBlob) {
      alert("No preview image available. Generate a letter first.");
      return;
    }

    try {
      this.elements.exportPreview.disabled = true;
      this.elements.exportPreview.textContent = "📄 Exporting...";

      const svgBlob = await this.traceToSVG(this.currentPreviewBlob);
      const filename = `letter-${this.currentLetter}-preview.svg`;
      this.downloadBlob(svgBlob, filename);
    } catch (error) {
      console.error("Export preview error:", error);
      alert("Failed to export preview. Please try again.");
    } finally {
      this.elements.exportPreview.disabled = false;
      this.elements.exportPreview.textContent = "📄 Export Preview SVG";
    }
  }

  async exportFullFont() {
    if (this.generatedLetters.size === 0) {
      alert("No generated letters available. Generate some letters first.");
      return;
    }

    try {
      this.elements.exportFullFont.disabled = true;
      this.elements.exportFullFont.textContent = "📦 Exporting...";

      let exportCount = 0;
      for (const [letter, blob] of this.generatedLetters.entries()) {
        const svgBlob = await this.traceToSVG(blob);
        const filename = `letter-${letter}.svg`;
        this.downloadBlob(svgBlob, filename);
        exportCount++;

        // Update progress
        this.elements.exportFullFont.textContent = `📦 Exporting ${exportCount}/${this.generatedLetters.size}`;

        // Small delay to prevent browser from blocking downloads
        await this.delay(100);
      }
    } catch (error) {
      console.error("Export full font error:", error);
      alert("Failed to export full font. Please try again.");
    } finally {
      this.elements.exportFullFont.disabled = false;
      this.elements.exportFullFont.textContent = "📦 Export Full Font SVG";
    }
  }
  async exportOft() {
    if (this.generatedLetters.size === 0) {
      alert("No generated letters available. Generate some letters first.");
      return;
    }
    let font_name = this.elements.fontName.value;
    if (font_name.length <= 1) {
      font_name = new Date().toISOString();
    }
    let glyphs = {};
    try {
      this.elements.exportOtf.disabled = true;
      this.elements.exportOtf.textContent = "📦 Exporting...";

      let exportCount = 0;
      for (const [letter, blob] of this.generatedLetters.entries()) {
        const svgBlob = await this.traceToSVG(blob);
        const svgString = await this.blobToString(svgBlob);
        glyphs[letter] = svgString;
        exportCount++;
        // Update progress
        this.elements.exportOtf.textContent = `🖊️ Generating Glifs ${exportCount}/${this.generatedLetters.size}`;
      }
      this.elements.exportOtf.textContent = `🖊️ Building Font-File`;
      const body = JSON.stringify({
        font_name,
        glyphs,
      });
      console.log(body);
      const response = await fetch(`${API_BASE_URL}/font`, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`SVG tracing failed: ${response.statusText}`);
      }
      const fontFile = await response.blob();
      this.downloadBlob(fontFile, `${font_name}.otf`);
    } catch (error) {
      console.error("Export full font error:", error);
      alert("Failed to export otf-file. Please try again.");
    } finally {
      this.elements.exportOtf.disabled = false;
      this.elements.exportOtf.textContent = "🖊️ Export OTF-File";
    }
  }

  downloadImage(blob, filename) {
    this.downloadBlob(blob, filename);
  }

  downloadPreview() {
    if (this.currentPreviewBlob) {
      this.downloadImage(
        this.currentPreviewBlob,
        `letter-${this.currentLetter}-preview.png`,
      );
    } else {
      // Download from canvas if no preview blob
      this.canvas.toBlob((blob) => {
        this.downloadImage(blob, `letter-${this.currentLetter}-canvas.png`);
      }, "image/png");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new TypefaceGenerator();
});
