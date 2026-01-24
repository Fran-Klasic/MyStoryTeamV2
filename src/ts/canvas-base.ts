import type { CanvasElement, Connection } from "./types/canvas-element-types";
import { Vector2Int } from "./vector2int";
import { Vector3Int } from "./vector3int";

//#region DEBUG

//in DEV TOOLS: logCanvasMemory()
// @ts-ignore
window.logCanvasMemory = logCanvasMemory;

export function logCanvasMemory() {
  console.info("CanvasMemory Array:");
  console.info(
    CanvasMemory.map((el) => ({
      id: el.id,
      type: el.type,
      position: el.position,
      size: el.size,
      data: el.data,
      connections: el.connections,
    })),
  );
}

//in DEV TOOLS: exportCanvasMemoryJSON() || exportCanvasMemoryJSON("fileName.json")
// @ts-ignore
window.exportCanvasMemoryJSON = exportCanvasMemoryJSON;
export function exportCanvasMemoryJSON(filename = "canvas-memory.json") {
  const data = {
    exportedAt: new Date().toISOString(),
    elements: Array.isArray(CanvasMemory) ? CanvasMemory : [],
  };

  const json = JSON.stringify(data, null, 2);

  console.info("CanvasMemory JSON:");
  console.info(json);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

//in DEV TOOLS:
/*
 fetch("/assets/templates/canvas-memory.json")
   .then(r => r.text())
   .then(importCanvasMemoryJSON);
*/
// @ts-ignore
window.importCanvasMemoryJSON = importCanvasMemoryJSON;
export function importCanvasMemoryJSON(json: string | object) {
  let parsed: any;

  try {
    parsed = typeof json === "string" ? JSON.parse(json) : json;
  } catch (err) {
    console.error("Invalid JSON", err);
    return;
  }

  if (!parsed || !Array.isArray(parsed.elements)) {
    console.error("Invalid canvas memory format");
    return;
  }

  clearCanvas();

  parsed.elements.forEach((raw: CanvasElement) => {
    const element: CanvasElement = {
      ...raw,
      connections: [],
    };

    CanvasMemory.push(element);
    generateElement(element);
  });

  parsed.elements.forEach((raw: CanvasElement) => {
    const target = CanvasMemory.find((e) => e.id === raw.id);
    if (!target) return;

    raw.connections.forEach((c) => {
      if (CanvasMemory.some((e) => e.id === c.target)) {
        target.connections.push(c);
      }
    });
  });

  renderConnections();

  console.info("Canvas imported successfully");
}

//#endregion

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
  console.log(`Position: ${x}, ${y}`);
  onElementDrop(crypto.randomUUID(), x, y);
}
//#endregion

//#region CONST VARIABLES
export const MAX_WIDTH = 1200;
export const MAX_HEIGHT = 600;
export const MIN_WIDTH = 160;
export const MIN_HEIGHT = 120;
export const DEFAULT_WIDTH = 260;
export const DEFAULT_HEIGHT = 160;
export const MAX_LIST_ITEMS = 10;
export const PLACEHOLDER = "Enter text...";
export const PLACEHOLDER_VIDEO = "https://www.youtube.com/embed/oznr-1-poSU";
export const PLACEHOLDER_IMAGE = "/public/assets/images/placeholder.webp";
export const PLACEHOLDER_DATE = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  new Date().getDate(),
);

//#endregion

//#region MEMORY
export const CanvasMemory: CanvasElement[] = [];
//#endregion

//#region HELPER
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCanvasRect() {
  const canvas = document.getElementById("canvas");
  if (!canvas) throw new Error("Canvas not found");
  return canvas.getBoundingClientRect();
}

function destroyElement(wrapper: HTMLElement) {
  const id = wrapper.dataset.id;
  if (!id) return;

  CanvasMemory.forEach((el) => {
    el.connections = el.connections.filter(
      (c) => c.self !== id && c.target !== id,
    );
  });

  const index = CanvasMemory.findIndex((e) => e.id === id);
  if (index !== -1) {
    CanvasMemory.splice(index, 1);
  }

  wrapper.remove();

  renderConnections();
}

function normalizeYouTubeUrl(url: string): string {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }

    return "";
  } catch {
    return "";
  }
}

function startRemainingTimer(date: Date, el: HTMLElement): number {
  function update() {
    const now = new Date();
    const diff = date.getTime() - now.getTime();

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
  return window.setInterval(update, 1000);
}

function screenToCanvas(x: number, y: number): Vector3Int {
  const canvas = document.getElementById("canvas");
  if (!canvas) throw new Error("Canvas not found");

  const rect = canvas.getBoundingClientRect();

  return new Vector3Int(x - rect.left, y - rect.top, 1);
}

function isValidDrop(x: number, y: number): boolean {
  const canvas = document.getElementById("canvas");
  const aside = document.getElementById("aside");
  if (!canvas || !aside) return false;

  const canvasRect = canvas.getBoundingClientRect();
  const asideRect = aside.getBoundingClientRect();

  //inside canvas
  if (
    x < canvasRect.left ||
    y < canvasRect.top ||
    x > canvasRect.right ||
    y > canvasRect.bottom
  ) {
    return false;
  }

  //not inside aside
  if (
    x > asideRect.left &&
    x < asideRect.right &&
    y > asideRect.top &&
    y < asideRect.bottom
  ) {
    return false;
  }

  return true;
}

function parseYYYYMMDD(input: string): Date | null {
  const match = /^(\d{4}):(\d{2}):(\d{2})$/.exec(input);
  if (!match) return null;

  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);

  // Validate real calendar date
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }

  return date;
}

function formatYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}:${m}:${d}`;
}

function getEmptyData(type: CanvasElement["type"]) {
  switch (type) {
    case "Text":
      return "";
    case "List":
      return { listData: [] };
    case "Task":
      return { data: "", checked: false };
    case "Image":
      return { base64File: "" };
    case "Audio":
      return { base64File: "" };
    case "Video":
      return { url: "" };
    case "Date":
      return {
        date: formatYYYYMMDD(PLACEHOLDER_DATE),
        data: "",
      };
  }
}

function onElementDrop(id: string, x: number, y: number) {
  if (!activeSource) return;

  const type = activeSource.dataset.type as CanvasElement["type"];
  if (!type) return;

  if (!isValidDrop(x, y)) return;

  const position = screenToCanvas(x, y);

  const element = generateCanvasElement(
    type,
    getEmptyData(type),
    position,
    new Vector2Int(DEFAULT_WIDTH, DEFAULT_HEIGHT),
  );

  generateElement(element);
}

function applyHandleZIndex(wrapper: HTMLElement, handle: HTMLElement) {
  const id = wrapper.dataset.id;
  if (!id) return;

  const element = CanvasMemory.find((e) => e.id === id);
  if (!element) return;

  handle.style.zIndex = String(element.position.z);
}

function getWrapperById(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `.canvas-element-wrapper[data-id="${id}"]`,
  );
}

function getElementCenter(wrapper: HTMLElement) {
  const rect = wrapper.getBoundingClientRect();
  const canvasRect = getCanvasRect();

  return {
    x: rect.left - canvasRect.left + rect.width / 2,
    y: rect.top - canvasRect.top + rect.height / 2,
  };
}

function createSVGLine(): SVGLineElement {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

  line.setAttribute("stroke", "#4f8cff");
  line.setAttribute("stroke-width", "3");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("opacity", "0.9");

  return line;
}

function renderConnections() {
  const svg = getConnectionSVG();

  if (!svg) return;

  svg.innerHTML = "";

  CanvasMemory.forEach((el) => {
    const fromWrapper = getWrapperById(el.id);
    if (!fromWrapper) return;

    const fromCenter = getElementCenter(fromWrapper);

    el.connections.forEach((conn) => {
      const toWrapper = getWrapperById(conn.target);
      if (!toWrapper) return;

      const toCenter = getElementCenter(toWrapper);

      const line = createSVGLine();
      line.setAttribute("x1", String(fromCenter.x));
      line.setAttribute("y1", String(fromCenter.y));
      line.setAttribute("x2", String(toCenter.x));
      line.setAttribute("y2", String(toCenter.y));

      svg.appendChild(line);
    });
  });
}

function getConnectionSVG(): SVGSVGElement {
  const el = document.getElementById("connection-layer");

  if (!(el instanceof SVGSVGElement)) {
    throw new Error("connection-layer is not an SVGSVGElement");
  }

  return el;
}

function mouseToCanvas(ev: MouseEvent) {
  const rect = getCanvasRect();
  return {
    x: ev.clientX - rect.left,
    y: ev.clientY - rect.top,
  };
}

function connectionExists(a: string, b: string): boolean {
  return CanvasMemory.some((el) =>
    el.connections.some(
      (c) =>
        (c.self === a && c.target === b) || (c.self === b && c.target === a),
    ),
  );
}

function getElementByWrapper(wrapper: HTMLElement): CanvasElement | null {
  const id = wrapper.dataset.id;
  if (!id) return null;
  return CanvasMemory.find((e) => e.id === id) ?? null;
}

function clearCanvas() {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  canvas
    .querySelectorAll(".canvas-element-wrapper")
    .forEach((el) => el.remove());

  CanvasMemory.length = 0;

  renderConnections();
}

//#endregion

//#region GENERATE CANVAS ELEMENT (LOGIC)
//In:
//TYPE, DATA, POSITION, SIZE, CONNECTIONS, ID?
//Out:
//CanvasElement
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
  wrapper.style.zIndex = String(element.position.z);
  wrapper.style.left = `${element.position.x}px`;
  wrapper.style.top = `${element.position.y}px`;
  wrapper.style.width = `${element.size.x}px`;
  wrapper.style.height = `${element.size.y}px`;
  wrapper.style.boxSizing = "border-box";

  createHTMLElement(wrapper, element);

  applyResizeHandle(wrapper);
  applyMoveHandle(wrapper);
  applyDeleteHandle(wrapper);
  applyLinkHandle(wrapper);

  canvas.appendChild(wrapper);
}

//#region HANDLES
export function applyMoveHandle(wrapper: HTMLElement) {
  const handle = document.createElement("div");
  handle.classList.add("move-handle");

  applyHandleZIndex(wrapper, handle);

  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();

    const canvasRect = getCanvasRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    startX = e.clientX;
    startY = e.clientY;
    startLeft = wrapper.offsetLeft;
    startTop = wrapper.offsetTop;

    function onMove(ev: MouseEvent) {
      const aside = document.getElementById("aside");
      const width = aside?.getBoundingClientRect().width;

      let nextLeft = startLeft + (ev.clientX - startX);
      const nextTop = startTop + (ev.clientY - startY);

      const maxLeft = canvasRect.width - wrapperRect.width;
      const maxTop = canvasRect.height - wrapperRect.height;

      if (nextLeft < width!) {
        nextLeft = width!;
      }

      wrapper.style.left = `${clamp(nextLeft, 0, maxLeft)}px`;
      wrapper.style.top = `${clamp(nextTop, 0, maxTop)}px`;
      renderConnections();
    }

    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);

      const el = getElementByWrapper(wrapper);
      if (!el) return;

      el.position.x = wrapper.offsetLeft;
      el.position.y = wrapper.offsetTop;
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  wrapper.appendChild(handle);
}

export function applyResizeHandle(wrapper: HTMLElement) {
  const handle = document.createElement("div");
  handle.classList.add("resize-handle");

  applyHandleZIndex(wrapper, handle);

  let startX = 0;
  let startY = 0;
  let startW = 0;
  let startH = 0;

  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();

    const canvasRect = getCanvasRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    startX = e.clientX;
    startY = e.clientY;
    startW = wrapper.offsetWidth;
    startH = wrapper.offsetHeight;

    function onMove(ev: MouseEvent) {
      let newWidth = startW + (ev.clientX - startX);
      let newHeight = startH + (ev.clientY - startY);

      newWidth = clamp(newWidth, MIN_WIDTH, MAX_WIDTH);
      newHeight = clamp(newHeight, MIN_HEIGHT, MAX_HEIGHT);

      const maxWidth = canvasRect.width - wrapper.offsetLeft;
      const maxHeight = canvasRect.height - wrapper.offsetTop;

      newWidth = clamp(newWidth, MIN_WIDTH, maxWidth);
      newHeight = clamp(newHeight, MIN_HEIGHT, maxHeight);

      if (newWidth < MIN_WIDTH || newWidth > MAX_WIDTH) {
        newWidth = DEFAULT_WIDTH;
      }

      if (newHeight < MIN_HEIGHT || newHeight > MAX_HEIGHT) {
        newHeight = DEFAULT_HEIGHT;
      }

      wrapper.style.width = `${newWidth}px`;
      wrapper.style.height = `${newHeight}px`;
      renderConnections();
    }

    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);

      const el = getElementByWrapper(wrapper);
      if (!el) return;

      el.size.x = wrapper.offsetWidth;
      el.size.y = wrapper.offsetHeight;
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  wrapper.appendChild(handle);
}

export function applyDeleteHandle(wrapper: HTMLElement) {
  const btn = document.createElement("button");
  btn.classList.add("delete-handle");

  applyHandleZIndex(wrapper, btn);

  btn.textContent = "×";

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    destroyElement(wrapper);
    renderConnections();
  });

  wrapper.appendChild(btn);
}

export function applyLinkHandle(wrapper: HTMLElement) {
  const btn = document.createElement("button");
  btn.classList.add("link-handle");
  btn.textContent = "🔗";

  applyHandleZIndex(wrapper, btn);
  wrapper.appendChild(btn);

  let previewLine: SVGLineElement | null = null;

  btn.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    e.preventDefault();

    const selfId = wrapper.dataset.id;
    if (!selfId) return;

    const selfElement = CanvasMemory.find((e) => e.id === selfId);
    if (!selfElement) return;

    const svg = getConnectionSVG();
    const start = getElementCenter(wrapper);

    previewLine = createSVGLine();
    previewLine.setAttribute("x1", String(start.x));
    previewLine.setAttribute("y1", String(start.y));
    previewLine.setAttribute("x2", String(start.x));
    previewLine.setAttribute("y2", String(start.y));

    svg.appendChild(previewLine);

    function onMove(ev: MouseEvent) {
      if (!previewLine) return;
      const { x, y } = mouseToCanvas(ev);
      previewLine.setAttribute("x2", String(x));
      previewLine.setAttribute("y2", String(y));
    }

    function onUp(ev: MouseEvent) {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);

      previewLine?.remove();
      previewLine = null;

      const targetWrapper = document
        .elementFromPoint(ev.clientX, ev.clientY)
        ?.closest<HTMLElement>(".canvas-element-wrapper");

      if (!targetWrapper) return;
      if (targetWrapper === wrapper) return;

      const targetId = targetWrapper.dataset.id;
      if (!targetId) return;

      if (connectionExists(selfId!, targetId)) return;

      selfElement!.connections.push({
        self: selfId!,
        target: targetId,
      });

      renderConnections();
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}
//#endregion

export function createHTMLElement(
  wrapper: HTMLElement,
  element: CanvasElement,
) {
  switch (element.type) {
    case "Text":
      placeTextElement(wrapper, element);
      return;
    case "List":
      placeListElement(wrapper, element);
      return;
    case "Task":
      placeTaskElement(wrapper, element);
      return;
    case "Image":
      placeImageElement(wrapper, element);
      return;
    case "Audio":
      placeAudioElement(wrapper, element);
      return;
    case "Video":
      placeVideoElement(wrapper, element);
      return;
    case "Date":
      placeDateElement(wrapper, element);
      return;
  }
}

//#region PLACE FUNCTIONS
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

  img.src = element.data.base64File || "/public/assets/images/placeholder.webp";

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

export function placeAudioElement(
  wrapper: HTMLElement,
  element: CanvasElement,
) {
  if (element.type !== "Audio") return;

  const audio = document.createElement("audio");
  audio.classList.add("canvas-element-audio");
  audio.controls = true;

  if (element.data.base64File) {
    audio.src = element.data.base64File;
  }

  audio.addEventListener("dragover", (e) => {
    e.preventDefault();
    audio.style.outline = "2px dashed #4f8cff";
  });

  audio.addEventListener("dragleave", () => {
    audio.style.outline = "";
  });

  audio.addEventListener("drop", (e) => {
    e.preventDefault();
    audio.style.outline = "";

    const file = e.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith("audio/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      element.data.base64File = reader.result as string;
      audio.src = element.data.base64File;
    };

    reader.readAsDataURL(file);
  });

  wrapper.appendChild(audio);
}

export function placeVideoElement(
  wrapper: HTMLElement,
  element: CanvasElement,
) {
  if (element.type !== "Video") return;

  const container = document.createElement("div");
  container.classList.add("canvas-element-video-wrapper");

  container.style.width = "100%";
  container.style.height = "100%";

  const iframe = document.createElement("iframe");
  iframe.classList.add("canvas-element-video");
  iframe.allowFullscreen = true;
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

  const embed = normalizeYouTubeUrl(element.data.url);
  iframe.src = embed || PLACEHOLDER_VIDEO;

  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  const editor = document.createElement("div");
  editor.classList.add("canvas-element-video-url");
  editor.contentEditable = "true";
  editor.spellcheck = false;
  editor.textContent = element.data.url;

  editor.addEventListener("input", () => {
    element.data.url = editor.textContent ?? "";
    const embed = normalizeYouTubeUrl(element.data.url);
    iframe.src = embed || PLACEHOLDER_VIDEO;
  });

  container.appendChild(iframe);
  container.appendChild(editor);
  wrapper.appendChild(container);
}

export function placeDateElement(wrapper: HTMLElement, element: CanvasElement) {
  if (element.type !== "Date") return;

  const container = document.createElement("div");

  const dateInput = document.createElement("div");
  dateInput.classList.add("canvas-element-date");
  dateInput.contentEditable = "true";
  dateInput.spellcheck = false;
  dateInput.textContent = element.data.date;

  const remaining = document.createElement("div");
  remaining.classList.add("canvas-element-date-time-remaining");

  const text = document.createElement("div");
  text.contentEditable = "true";
  text.classList.add("canvas-element-date-textarea");
  text.textContent = element.data.data ?? "";

  text.addEventListener("input", () => {
    element.data.data = text.textContent ?? "";
  });

  let timerId: number | null = null;

  function restartTimer(date: Date) {
    if (timerId !== null) clearInterval(timerId);
    timerId = startRemainingTimer(date, remaining);
  }

  const initialDate = parseYYYYMMDD(element.data.date) ?? PLACEHOLDER_DATE;

  element.data.date = formatYYYYMMDD(initialDate);
  dateInput.textContent = element.data.date;
  restartTimer(initialDate);

  dateInput.addEventListener("blur", () => {
    const parsed = parseYYYYMMDD(dateInput.textContent ?? "");

    const finalDate = parsed ?? PLACEHOLDER_DATE;

    element.data.date = formatYYYYMMDD(finalDate);
    dateInput.textContent = element.data.date;

    restartTimer(finalDate);
  });

  container.appendChild(dateInput);
  container.appendChild(remaining);
  container.appendChild(text);
  wrapper.appendChild(container);
}

//#endregion
//#endregion
