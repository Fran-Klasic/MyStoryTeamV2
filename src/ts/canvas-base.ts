import type {
  CanvasElement,
  Connection,
  ListData,
  TaskData,
  ImageData,
} from "./types/canvas-element-types";
import { Vector2Int } from "./vector2int";
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
  const element: Extract<CanvasElement, { type: T }> = {
    id: id ?? crypto.randomUUID(),
    type,
    data,
    position,
    size,
    connections,
  } as Extract<CanvasElement, { type: T }>;

  CanvasMemory.push(element);

  return element;
}
//#endregion

//#region GENERATE CANVAS ELEMENT (WORLD)
export function generateElement(element: CanvasElement) {
  const canvas = document.getElementById("canvas");
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

  createHTMLElement(wrapper, element);
  //Make destroy function
  //On dragging element from container destroy it and make a ghost follow the mouse with the data
  // wrapper.appendChild(inner);

  // applyResizeHandle(wrapper);
  // applyMoveHandle(wrapper);
  // applyDeleteHandle(wrapper);
  // applyLinkHandle(wrapper);

  canvas.appendChild(wrapper);
}
export function createHTMLElement(
  wrapper: HTMLElement,
  element: CanvasElement,
) {
  //placeTextElement(wrapper, element);
  //placeListElement(wrapper, element);
  //placeTaskElement(wrapper, element);
  placeImageElement(wrapper, element);
}

export function placeTextElement(wrapper: HTMLElement, element: CanvasElement) {
  if (element.type !== "Text") return;

  const textArea = document.createElement("textarea");
  textArea.classList.add("canvas-element-textarea");
  textArea.value = element.data ?? "";

  textArea.addEventListener("input", () => {
    element.data = textArea.value;
  });

  wrapper.appendChild(textArea);
}

export function placeListElement(wrapper: HTMLElement, element: CanvasElement) {
  if (element.type !== "List") return;

  const list = document.createElement("ul");
  list.classList.add("canvas-element-list");

  const data = element.data;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("canvas-element-list-container");
  buttonContainer.style.display = "grid";
  buttonContainer.style.gridTemplateColumns = "1fr 1fr";

  const buttonAdd = document.createElement("button");
  buttonAdd.classList.add("canvas-element-list-button");
  buttonAdd.innerHTML = "+";

  const buttonRemove = document.createElement("button");
  buttonRemove.classList.add("canvas-element-list-button");
  buttonRemove.innerHTML = "-";

  buttonAdd.addEventListener("click", () => {
    if (data.listData.length >= MAX_LIST_ITEMS) return;
    data.listData.push("");
    render();
  });

  buttonRemove.addEventListener("click", () => {
    if (data.listData.length === 0) return;
    data.listData.pop();
    render();
  });

  buttonContainer.appendChild(buttonRemove);
  buttonContainer.appendChild(buttonAdd);

  function render() {
    list.innerHTML = "";

    data.listData.forEach((text, i) => {
      const li = document.createElement("li");
      li.classList.add("canvas-element-list-item");

      const textDiv = document.createElement("div");
      textDiv.classList.add("canvas-element-list-item-text");
      textDiv.contentEditable = "true";
      textDiv.spellcheck = false;
      textDiv.textContent = text;

      textDiv.addEventListener("input", () => {
        data.listData[i] = textDiv.textContent ?? "";
      });

      li.appendChild(textDiv);
      list.appendChild(li);
    });
  }

  render();

  wrapper.appendChild(list);
  wrapper.appendChild(buttonContainer);
}

export function placeTaskElement(wrapper: HTMLElement, element: CanvasElement) {
  if (element.type !== "Task") return;

  const container = document.createElement("div");
  container.classList.add("canvas-element-task");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("canvas-element-task-checkbox");
  checkbox.checked = element.data.checked;

  const textDiv = document.createElement("div");
  textDiv.classList.add("canvas-element-task-text");
  textDiv.contentEditable = "true";
  textDiv.spellcheck = false;
  textDiv.textContent = element.data.data ?? "";

  checkbox.addEventListener("change", () => {
    element.data.checked = checkbox.checked;
    updateStyle();
  });

  textDiv.addEventListener("input", () => {
    element.data.data = textDiv.textContent ?? "";
  });

  function updateStyle() {
    textDiv.style.textDecoration = checkbox.checked ? "line-through" : "none";
    textDiv.style.opacity = checkbox.checked ? "0.6" : "1";
  }

  updateStyle();

  container.appendChild(checkbox);
  container.appendChild(textDiv);

  wrapper.appendChild(container);
}

export function placeImageElement(
  wrapper: HTMLElement,
  element: CanvasElement,
) {
  if (element.type !== "Image") return;

  const img = document.createElement("img");
  img.classList.add("canvas-element-image");
  img.draggable = false;

  if (element.data.base64File) {
    img.src = element.data.base64File;
  }

  img.addEventListener("dragover", (e) => {
    e.preventDefault();
    img.style.outline = "2px dashed #4f8cff";
  });

  img.addEventListener("dragleave", () => {
    img.style.outline = "";
  });

  img.addEventListener("drop", (e) => {
    e.preventDefault();
    img.style.outline = "";

    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      img.src = base64;
      element.data.base64File = base64;
    };

    reader.readAsDataURL(file);
  });

  wrapper.appendChild(img);
}

//#endregion

const imageBase64: ImageData = {
  base64File:
    "data:image/webp;base64,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",
};
generateElement(
  generateCanvasElement(
    "Image",
    imageBase64,
    new Vector3Int(200, 200, 1),
    new Vector2Int(400, 400),
    [],
    "Custom Id1",
  ),
);
