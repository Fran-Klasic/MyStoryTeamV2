import * as CanvasBase from "../canvas-base";

const settings = document.getElementById("settings") as HTMLElement;
const overlay = document.getElementById("overlay") as HTMLElement;

settings.addEventListener("click", () => {
  overlay.style.display = "block";
});

overlay.addEventListener("click", () => {
  overlay.style.display = "none";
});
