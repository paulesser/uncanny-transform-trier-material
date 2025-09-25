const api = "http://localhost:8000";

main();

async function main() {
  try{
    const body = document.querySelector("body");
    if (!body) {
      throw new Error("🤔 the body element could not be found.");
    }
    const svg = document.querySelector("svg");
    if (!svg) {
      throw new Error("🤔 the svg element could not be found.");
    }
    const imageUrl = await svg2png(svg);
    const pngOfSvg = document.createElement("img");
    pngOfSvg.src = imageUrl;
    body.appendChild(pngOfSvg);
    const svgResponse = await fetch(imageUrl);
    if (!svgResponse.ok) {
      throw new Error(
        "🤔 failed to fetch image which was converted with svg2png",
      );
    }
    const image = await svgResponse.blob();
    // use api to add noise
    const noised = await noiseImage(image, {
      blurNoise: 2,
      blurMask: 12.5,
    });
  
    const noisedImageElement = document.createElement("img");
    noisedImageElement.src = URL.createObjectURL(noised);
    body.appendChild(noisedImageElement);
    // use api to call ai model
    const generated = await generate(noised, {
      // model: "stable-diffusion-xl-turbo",
      model: "stable-diffusion-v1-5",
      prompt: "a black flower in a white room, black tulip, c4d, film grain",
      negativePrompt: "",
      guidanceScale: 7.5,
      strength: 0.7,
      steps: 20,
      seed: 12346661,
    });
    const generatedImageElement = document.createElement("img");
    generatedImageElement.src = URL.createObjectURL(generated);
    body.appendChild(generatedImageElement);
    // use api to get duotone b&w image
    const highContrastImage = await highContrast(generated, 127);
    const highContrastImageElement = document.createElement("img");
    highContrastImageElement.src = URL.createObjectURL(highContrastImage);
    body.appendChild(highContrastImageElement);
    // trace image
    const tracedImage = await trace(highContrastImage, {
      color: "red",
      turdsize: 2,
      alphamax: 1,
      blacklevel: 0.5,
      opttolerance: 2,
    });
    const tracedContainer = document.createElement("div");
    tracedContainer.innerHTML = tracedImage;
    body.appendChild(tracedContainer);
  }
  catch(e){
    console.error(e)
  }
 
  
}

/* api calls
             _             _ _
            (_)           | | |
  __ _ _ __  _    ___ __ _| | |___
 / _` | '_ \| |  / __/ _` | | / __|
| (_| | |_) | | | (_| (_| | | \__ \
 \__,_| .__/|_|  \___\__,_|_|_|___/
      | |
      |_|
*/

/**
 * # Function to use the Noise API Endpoint
 * @param {Blob} image - the source image
 * @param {Object} options - object containing the options for noise addition
 * @param {number} options.blurNoise - the amount of blur which should be added to the noise
 * @param {number} options.blurMask - how much should the mask feather
 * @returns {Promise<Blob>} noised image
 */
async function noiseImage(image, options) {
  const body = new FormData();
  body.append("image", image);
  body.append("blur_noise", `${options.blurNoise}`);
  body.append("blur_mask", `${options.blurMask}`);
  const response = await fetch(`${api}/noise`, {
    body: body,
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`${response}`);
  }
  return await response.blob();
}

/**
 * # Function to call the diffusion image2image model
 * @param {Blob} image - the source image for image2image inpainting
 * @param {Object} options - object containing the options for image generation
 * @param {string} options.prompt - 👍 what you want to see
 * @param {string} options.negativePrompt - 👎 what you don't want to see
 * @param {number} options.guidanceScale - how much should the prompt influence the image, for turbo this should be near 0, normal models between 5 and 10
 * @param {number} options.strength - between 0 and 1 how much per step should the model denoise per step
 * @param {number} options.steps - how many iterations
 * @param {string} options.model - which model to use
 * @param {number} options.seed - your seed for the random noise
 * @returns {Promise<Blob>} ai generated image
 */
async function generate(image, options) {
  const body = new FormData();
  body.append("image", image);
  body.append("prompt", options.prompt);
  body.append("negative_prompt", options.negativePrompt);
  body.append("guidance_scale", `${options.guidanceScale}`);
  body.append("strength", `${options.strength}`);
  body.append("steps", `${options.steps}`);
  body.append("seed", `${options.seed}`);
  const response = await fetch(`${api}/generate/${options.model}`, {
    body: body,
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`${response}`);
  }
  return await response.blob();
}

/**
 * # Sometimes you might need a high contrast image which has only white (255) and black (0) pixels. You can use this function
 * @param {Blob} image - the source image
 * @param {number} threshold - threshold a number between 1 and 254 which color and below is black
 * @returns {Promise<Blob>} duotone image
 */
async function highContrast(image, threshold) {
  const body = new FormData();
  body.append("image", image);
  body.append("threshold", `${threshold}`);
  const response = await fetch(`${api}/duotone`, {
    body: body,
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`${response}`);
  }
  return await response.blob();
}

/**
 * # You can use this Endpoint to automatically trace an image to convert into a svg vector graphic
 * ## see the the potracer docs here: [https://github.com/tatarize/potrace](https://github.com/tatarize/potrace)
 * ## and also the original potrace dose here: [https://potrace.sourceforge.net/#usage](https://potrace.sourceforge.net/#usage)
 * @param {Blob} image - the source image
 * @param {Object} options - object containing the options for tracing
 * @param {string} options.color - fill color of the svg
 * @param {number} options.turdsize - suppress speckles of up to this size
 * @param {number} options.alphamax - corner threshold parameter (default 1)
 * @param {number} options.blacklevel - black/white cutoff in input file (default 0.5)
 * @param {number} options.opttolerance - curve optimization tolerance (default 0.2)
 * @returns {Promise<string>} the traced image in SVG format
 */
async function trace(image, options) {
  const body = new FormData();
  body.append("image", image);
  body.append("color", options.color);
  body.append("turdsize", `${options.turdsize}`);
  body.append("alphamax", `${options.alphamax}`);
  body.append("blacklevel", `${options.blacklevel}`);
  body.append("opttolerance", `${options.opttolerance}`);
  const response = await fetch(`${api}/trace`, {
    body: body,
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`${response}`);
  }
  return await response.text();
}

/* helper functions
   _          _                    __                  _   _
  | |        | |                  / _|                | | (_)
  | |__   ___| |_ __   ___ _ __  | |_ _   _ _ __   ___| |_ _  ___  _ __  ___
  | '_ \ / _ \ | '_ \ / _ \ '__| |  _| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
  | | | |  __/ | |_) |  __/ |    | | | |_| | | | | (__| |_| | (_) | | | \__ \
  |_| |_|\___|_| .__/ \___|_|    |_|  \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
             | |
             |_|
*/

/**
 * #  You can use this function to generate a png for the api from a svg html element
 * @param {SVGElement} svg - the svg element which will be converted
 * @returns {Promise<string>} an url of a png image
 */
async function svg2png(svg) {
  const dataHeader = "data:image/svg+xml;charset=utf-8";
  /**
   *
   * @param {string} url
   * @returns {Promise<HTMLImageElement>}
   */
  async function loadImage(url) {
    const $img = document.createElement("img");
    $img.src = url;
    return new Promise((resolve, reject) => {
      $img.onload = () => resolve($img);
      $img.onerror = (error) => {
        reject(
          `Image load did not work 🤔\n
        ${error}`,
        );
      };
    });
  }
  /**
   *
   * @param {SVGElement} element
   * @returns {string}
   */
  function serializeAsXML(element) {
    return new XMLSerializer().serializeToString(element);
  }
  /**
   *
   * @param {string} inputString
   * @returns  {string}
   */
  function encodeAsUTF8(inputString) {
    return `${dataHeader},${encodeURIComponent(inputString)}`;
  }

  const svgData = encodeAsUTF8(serializeAsXML(svg));
  const img = await loadImage(svgData);
  const $canvas = document.createElement("canvas");
  $canvas.width = svg.clientWidth;
  $canvas.height = svg.clientHeight;
  const context = $canvas.getContext("2d");
  if (context) context.drawImage(img, 0, 0, svg.clientWidth, svg.clientHeight);

  const dataURL = $canvas.toDataURL(`image/png`, 1.0);

  return dataURL;
}
