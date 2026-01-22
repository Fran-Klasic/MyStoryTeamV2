import { text } from "node:stream/consumers";
import type { CanvasElement, Connection } from "./types/canvas-element-types";
import type { Vector2Int } from "./vector2int";
import { Vector3Int } from "./vector3int";

//#region DISABLE ZOOM
window.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) e.preventDefault();
  },
  { passive: false },
);

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && ["+", "-", "0"].includes(e.key)) {
    e.preventDefault();
  }
});
//#endregion

//#region GHOST DRAGGING
const sources = document.querySelectorAll<HTMLElement>(".element-holder");

let ghost: HTMLElement | null = null;
let isHolding = false;
let activeSource: HTMLElement | null = null;

sources.forEach((source) => {
  source.addEventListener("mousedown", (e) => {
    isHolding = true;
    activeSource = source;

    ghost = source.cloneNode(true) as HTMLElement;
    ghost.classList.add("drag-ghost");

    document.body.appendChild(ghost);
    moveGhost(e);
  });
});

document.addEventListener("mousemove", (e) => {
  if (!isHolding || !ghost) return;
  moveGhost(e);
});

document.addEventListener("mouseup", (e) => {
  if (!isHolding) return;

  isHolding = false;

  if (ghost && activeSource) {
    onDrop(activeSource.id, e.clientX, e.clientY);
    ghost.remove();
  }

  ghost = null;
  activeSource = null;
});

function moveGhost(e: MouseEvent) {
  if (!ghost) return;
  ghost.style.left = `${e.clientX}px`;
  ghost.style.top = `${e.clientY}px`;
}

function onDrop(id: string, x: number, y: number) {
  console.log(`Dropped element ID: ${id}`);
  console.log(`Position: ${x}, ${y}`);
}
//#endregion

//#region CONST VARIABLES
export const MAX_WIDTH = 800;
export const MAX_HEIGHT = 600;
export const MIN_WIDTH = 60;
export const MIN_HEIGHT = 40;
export const DEFAULT_WIDTH = 260;
export const DEFAULT_HEIGHT = 160;
export const MAX_LIST_ITEMS = 10;
export const PLACEHOLDER = "Enter text...";
//#endregion

//#region MEMORY
export const CanvasMemory: CanvasElement[] = [];
//#endregion

//#region GENERATE CANVAS ELEMENT (LOGIC)
export function generateCanvasElement<T extends CanvasElement["type"]>(
  type: T,
  data: Extract<CanvasElement, { type: T }>["data"],
  position: Vector3Int,
  size: Vector2Int,
  connections: Connection[] = [],
  id?: string,
): Extract<CanvasElement, { type: T }> {
  return {
    id: id ?? crypto.randomUUID(),
    type,
    data,
    position,
    size,
    connections,
  } as Extract<CanvasElement, { type: T }>;
}
//#endregion

//#region GENERATE CANVAS ELEMENT (WORLD)
export function generateElement(element: CanvasElement) {
  const canvas = document.getElementById("canvas-viewport");
  if (!canvas) return;

  const wrapper = document.createElement("div");
  wrapper.classList.add("canvas-element-wrapper");
  wrapper.dataset.id = element.id;

  wrapper.style.position = "absolute";
  wrapper.style.left = `${element.position.x}px`;
  wrapper.style.top = `${element.position.y}px`;
  wrapper.style.width = `${element.size.x}px`;
  wrapper.style.height = `${element.size.y}px`;
  wrapper.style.boxSizing = "border-box";

  const inner = createHTMLElementFromCanvasElement(element);
  //Apply handles and add listeners
  //Make destroy function
  //On dragging element from container destroy it and make a ghost follow the mouse with the data
  wrapper.appendChild(inner);

  canvas.appendChild(wrapper);
}
function createHTMLElementFromCanvasElement(
  element: CanvasElement,
): HTMLElement {
  switch (element.type) {
    case "Text":
      const textArea = document.createElement("textarea");
      textArea.classList.add("canvas-element-textarea");
      textArea.dataset.id = element.id;
      textArea.value = element.data;
      textArea.placeholder = PLACEHOLDER;
      textArea.style.width = "100%";
      //Style

      return textArea;

    case "List":
      const list = document.createElement("ul");
      list.classList.add("canvas-element-list");
      list.dataset.id = element.id;
      //Style
      list.style.width = "100%";

      element.data.listData.forEach((itemText) => {
        const item = document.createElement("li");
        item.classList.add("canvas-element-list-item");
        item.innerHTML = itemText;
        //Style
        list.style.width = "100%";

        list.appendChild(item);
      });

      return list;

    case "Task":
      const task = document.createElement("div");
      task.classList.add("canvas-element-task");
      task.dataset.id = element.id;

      const input = document.createElement("input");
      input.classList.add("canvas-element-input");
      input.checked = element.data.checked;

      const inputText = document.createElement("textarea");
      inputText.classList.add("canvas-element-input-text");
      inputText.value = element.data.data;
      inputText.placeholder = PLACEHOLDER;

      //Style
      task.style.display = "grid";
      task.style.gridTemplateColumns = "1fr 3fr";

      task.appendChild(input);
      task.appendChild(inputText);
      return task;

    case "Date":
      const wrapper = document.createElement("div");
      wrapper.dataset.id = element.id;

      const date = document.createElement("div");
      date.classList.add("canvas-element-date");
      date.innerHTML = element.data.date;

      const timeRemaining = document.createElement("div");
      timeRemaining.classList.add("canvas-element-date-time-remaining");

      const dateText = document.createElement("textarea");
      dateText.classList.add("canvas-element-date-textarea");
      dateText.value = element.data.data;

      wrapper.appendChild(date);
      wrapper.appendChild(timeRemaining);
      wrapper.appendChild(dateText);

      startRemainingTimer(element.data.date, timeRemaining);

      return wrapper;

    case "Image":
      const img = document.createElement("img");
      img.classList.add("canvas-element-image");
      img.dataset.id = element.id;
      img.src = element.data.base64File;
      img.style.width = "100%";
      img.style.objectFit = "contain";
      img.draggable = false;

      return img;

    case "Audio":
      const audio = document.createElement("audio");
      audio.classList.add("canvas-element-audio");
      audio.dataset.id = element.id;
      audio.controls = true;
      audio.src = element.data.base64File;
      audio.style.width = "100%";
      return audio;

    case "Video":
      const videoWrapper = document.createElement("div");
      videoWrapper.dataset.id = element.id;
      videoWrapper.classList.add("canvas-element-video-wrapper");

      const video = document.createElement("video");
      video.classList.add("canvas-element-video");
      video.controls = true;
      video.src = element.data.url;
      video.style.width = "100%";

      const videoUrl = document.createElement("textarea");
      videoUrl.classList.add("canvas-element-video-url");
      videoUrl.value = element.data.url;

      videoWrapper.appendChild(video);
      videoWrapper.appendChild(videoUrl);

      return videoWrapper;

    case "Container":
      const container = document.createElement("div");
      container.classList.add("canvas-element-container");
      container.dataset.id = element.id;

      element.data.forEach((child) => {
        const childEl = createHTMLElementFromCanvasElement(child);
        container.appendChild(childEl);
      });

      return container;
  }
}
function startRemainingTimer(dateString: string, el: HTMLElement) {
  const target = new Date(dateString);

  function update() {
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      el.textContent = "Time reached";
      return;
    }

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / 1000 / 60) % 60;
    const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);

    el.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  update();
  setInterval(update, 1000);
}

export function applyResizeHandle(parent: HTMLElement) {}
export function applyMoveHandle(parent: HTMLElement) {}
export function applyDeleteHandle(parent: HTMLElement) {}
export function applyLinkHandle(parent: HTMLElement) {}

//#endregion
