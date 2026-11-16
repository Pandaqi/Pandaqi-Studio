export const displayImageFullscreen = (img:HTMLImageElement) =>
{
    // create one on the spot
    const overlay = document.createElement("div");
    document.body.appendChild(overlay);

    overlay.style.display = "none";
    overlay.style.position = "fixed";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.top = "0";
    overlay.style.bottom = "0";
    overlay.style.backgroundColor = "rgba(0,0,0,0.66)";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.padding = "3em";

    const overlayImage = document.createElement("img");
    overlayImage.src = img.src;
    overlay.appendChild(overlayImage);

    // remove it again if clicked
    overlay.addEventListener("click", () => overlay.remove());

    return overlay;
}