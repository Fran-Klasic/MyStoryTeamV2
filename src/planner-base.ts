const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;
const MIN_WIDTH = 60;
const MIN_HEIGHT = 40;

export const INPUT_WIDTH = 220;
export const INPUT_HEIGHT = 60;

export const DEFAULT_WIDTH = 260;
export const DEFAULT_HEIGHT = 160;

export const EDGE_PADDING = 10;

const MAX_UL_ITEMS = 10;
export const PLACEHOLDER = "ENTER TEXT...";

const IMAGE_PLACEHOLDER_SRC = "../Images/CinematicPlannerHelper.png";
const IFRAME_PLACEHOLDER_SRC = "https://www.youtube.com/embed/oznr-1-poSU";

import { BoardItem } from "./boardItemBase.js";
import { ConnectionSide } from "./boardItemBase.js";
import { SvgConnection } from "./boardItemBase.js";

const boardItems: BoardItem[] = [];
const svgConnections: SvgConnection[] = [];

export function placeBoardItem(item: BoardItem) {
  const parent = document.getElementById("board");
  if (!parent) return;

  const wrapper = document.createElement("div");
  wrapper.classList.add("board-item-wrapper");
  wrapper.dataset.id = item.id;

  wrapper.style.position = "absolute";
  wrapper.style.left = item.positionX;
  wrapper.style.top = item.positionY;
  wrapper.style.width = item.defWidth;
  wrapper.style.height = item.defHeight;
  wrapper.style.boxSizing = "border-box";

  const el = document.createElement(item.type);

  el.style.width = "100%";
  el.style.height = "100%";
  el.style.resize = "none";
  el.style.boxSizing = "border-box";

  applyPlaceholder(el, wrapper, item);

  addResizeHandle(wrapper, item);
  addMoveHandle(wrapper, item);
  addDeleteHandle(wrapper, item);
  addConnectionPoints(wrapper, item);

  if (item.type !== "input") {
    wrapper.appendChild(el);
  }

  parent.appendChild(wrapper);

  boardItems.push(item);
}

function applyPlaceholder(
  el: HTMLElement,
  wrapper: HTMLElement,
  item: BoardItem
) {
  switch (item.type) {
    case "img": {
      const img = el as HTMLImageElement;
      img.draggable = false;
      img.style.objectFit = "contain";

      function setImage(src?: string) {
        if (isValidImageUrl(src)) {
          img.src = src!;
          item.data = src;
        } else {
          img.src = IMAGE_PLACEHOLDER_SRC;
          item.data = undefined;
        }
      }

      setImage(item.data);

      img.onerror = () => {
        img.src = IMAGE_PLACEHOLDER_SRC;
        item.data = undefined;
      };

      const editor = createEditor("img-editor");

      const inputWrapper = document.createElement("div");
      inputWrapper.style.display = "none";

      const input = document.createElement("input");
      input.placeholder = "Image URL";
      input.value = isValidImageUrl(item.data) ? item.data! : "";

      input.addEventListener("input", () => {
        setImage(input.value);
      });

      inputWrapper.appendChild(input);

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = "SHOW";

      toggleBtn.onclick = () => {
        inputWrapper.style.display =
          inputWrapper.style.display === "none" ? "block" : "none";
      };

      enableImageDrop(img, item, input);

      editor.style.display = "grid";
      editor.style.gridTemplateColumns = "1fr 3fr";
      input.style.width = "100%";

      editor.appendChild(toggleBtn);
      editor.appendChild(inputWrapper);
      wrapper.appendChild(editor);
      break;
    }
    case "iframe": {
      const iframe = el as HTMLIFrameElement;

      iframe.style.border = "none";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;

      function setIframe(src?: string) {
        if (src && src.startsWith("http")) {
          iframe.src = normalizeYouTubeUrl(src);
          item.data = iframe.src;
        } else {
          iframe.src = IFRAME_PLACEHOLDER_SRC;
          item.data = undefined;
        }
      }

      setIframe(item.data);

      iframe.onerror = () => {
        iframe.src = IFRAME_PLACEHOLDER_SRC;
        item.data = undefined;
      };

      const editor = createEditor("iframe-editor");

      const inputWrapper = document.createElement("div");
      inputWrapper.style.display = "none";

      const input = document.createElement("input");
      input.placeholder = "YouTube / Embed URL";
      input.value = item.data ?? "";
      input.style.width = "100%";

      input.addEventListener("input", () => {
        setIframe(input.value);
      });

      inputWrapper.appendChild(input);

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = "SHOW";

      toggleBtn.onclick = () => {
        const hidden = inputWrapper.style.display === "none";
        inputWrapper.style.display = hidden ? "block" : "none";
      };

      editor.style.display = "grid";
      editor.style.gridTemplateColumns = "1fr 4fr";
      editor.style.gap = "4px";

      editor.appendChild(toggleBtn);
      editor.appendChild(inputWrapper);
      wrapper.appendChild(editor);

      break;
    }
    case "ul": {
      const ul = el as HTMLUListElement;
      let items = item.data ? item.data.split("\n") : [];

      if (items.length === 0) items = ["Item"];

      const editor = createEditor("ul-editor");

      const addBtn = document.createElement("button");
      addBtn.textContent = "+";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "−";

      function render() {
        ul.innerHTML = "";

        items.forEach((text, i) => {
          const li = document.createElement("li");
          li.contentEditable = "true";
          li.textContent = text;

          li.addEventListener("input", () => {
            items[i] = li.textContent ?? "";
            item.data = items.join("\n");
          });

          ul.appendChild(li);
        });

        addBtn.disabled = items.length >= MAX_UL_ITEMS;
        removeBtn.disabled = items.length <= 1;
      }

      addBtn.onclick = () => {
        if (items.length >= MAX_UL_ITEMS) return;

        items.push("New item");
        item.data = items.join("\n");
        render();
      };

      removeBtn.onclick = () => {
        if (items.length <= 1) return;

        items.pop();
        item.data = items.join("\n");
        render();
      };

      render();

      editor.style.display = "grid";
      editor.style.gridTemplateColumns = "1fr 1fr";
      editor.style.gap = "10px";

      editor.appendChild(addBtn);
      editor.appendChild(removeBtn);
      wrapper.appendChild(editor);
      break;
    }
    case "input": {
      wrapper.classList.add("checkbox-wrapper-11");

      const checkboxId = `task-${item.id}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.checked = !!item.checked;

      const label = document.createElement("label");
      label.textContent = item.data ?? item.placeholder ?? PLACEHOLDER;
      label.contentEditable = "true";
      label.spellcheck = false;

      function updateStyle() {
        label.style.textDecoration = checkbox.checked ? "line-through" : "none";
      }

      updateStyle();

      checkbox.addEventListener("change", () => {
        item.checked = checkbox.checked;
        updateStyle();
      });

      label.addEventListener("input", () => {
        item.data = label.textContent ?? "";
      });

      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);
      break;
    }
    case "textarea": {
      const textarea = el as HTMLTextAreaElement;

      textarea.style.resize = "none";

      textarea.placeholder = item.placeholder ?? "";
      textarea.value = item.data ?? "";

      textarea.addEventListener("input", () => {
        item.data = textarea.value;
      });

      wrapper.appendChild(textarea);
      break;
    }
  }
}

let dragLine: HTMLDivElement | null = null;

let activeConnection: { fromItem: BoardItem; fromSide: ConnectionSide } | null =
  null;
function createDragLine() {
  const line = document.createElement("div");
  line.classList.add("preview-line");
  document.body.appendChild(line);
  return line;
}
function getOrCreateConnectionSvg(): SVGSVGElement {
  let svg = document.getElementById("connection-svg") as SVGSVGElement | null;
  const board = document.getElementById("board")!;

  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "connection-svg";

    svg.style.position = "absolute";
    svg.style.left = "0";
    svg.style.top = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.overflow = "visible";

    board.appendChild(svg);
  }

  const width = board.scrollWidth;
  const height = board.scrollHeight;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  svg.setAttribute("preserveAspectRatio", "none");

  return svg;
}
function addConnectionPoints(wrapper: HTMLElement, item: BoardItem) {
  const sides: ConnectionSide[] = ["top", "right", "bottom", "left"];

  sides.forEach((side) => {
    const point = document.createElement("div");
    point.classList.add("connection-point", side);

    point.dataset.side = side;

    styleConnectionPoint(point, side);
    enableConnectionDrag(point, wrapper, item, side);

    wrapper.appendChild(point);
  });
}
function styleConnectionPoint(point: HTMLElement, side: ConnectionSide) {
  point.style.position = "absolute";
  point.style.width = "10px";
  point.style.height = "10px";
  point.style.background = "#ff4757";
  point.style.borderRadius = "50%";
  point.style.cursor = "crosshair";

  switch (side) {
    case "top":
      point.style.top = "-5px";
      point.style.left = "50%";
      point.style.transform = "translateX(-50%)";
      break;
    case "bottom":
      point.style.bottom = "-5px";
      point.style.left = "50%";
      point.style.transform = "translateX(-50%)";
      break;
    case "left":
      point.style.left = "-5px";
      point.style.top = "50%";
      point.style.transform = "translateY(-50%)";
      break;
    case "right":
      point.style.right = "-5px";
      point.style.top = "50%";
      point.style.transform = "translateY(-50%)";
      break;
  }
}
function getSidePoint(wrapper: HTMLElement, side: ConnectionSide) {
  const boardRect = document.getElementById("board")!.getBoundingClientRect();

  const rect = wrapper.getBoundingClientRect();

  switch (side) {
    case "top":
      return {
        x: rect.left + rect.width / 2 - boardRect.left,
        y: rect.top - boardRect.top,
      };
    case "bottom":
      return {
        x: rect.left + rect.width / 2 - boardRect.left,
        y: rect.bottom - boardRect.top,
      };
    case "left":
      return {
        x: rect.left - boardRect.left,
        y: rect.top + rect.height / 2 - boardRect.top,
      };
    case "right":
      return {
        x: rect.right - boardRect.left,
        y: rect.top + rect.height / 2 - boardRect.top,
      };
  }
}
function updateSvgConnections() {
  svgConnections.forEach((c) => {
    const fromWrapper = document.querySelector(
      `[data-id="${c.fromItem.id}"]`
    ) as HTMLElement;

    if (!fromWrapper) return;

    const p1 = getSidePoint(fromWrapper, c.fromSide);
    const p2 = getSidePoint(c.toWrapper, c.toSide);

    c.line.setAttribute("x1", `${p1.x}`);
    c.line.setAttribute("y1", `${p1.y}`);
    c.line.setAttribute("x2", `${p2.x}`);
    c.line.setAttribute("y2", `${p2.y}`);
  });
}
function enableConnectionDrag(
  point: HTMLElement,
  wrapper: HTMLElement,
  item: BoardItem,
  side: ConnectionSide
) {
  point.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    e.preventDefault();

    activeConnection = { fromItem: item, fromSide: side };
    highlightConnectionTargets(true);
    dragLine = createDragLine();

    const startRect = point.getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;

    function onMouseMove(ev: MouseEvent) {
      if (!dragLine) return;

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const length = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      dragLine.style.left = `${startX}px`;
      dragLine.style.top = `${startY}px`;
      dragLine.style.width = `${length}px`;
      dragLine.style.transform = `rotate(${angle}deg)`;
    }

    function onMouseUp(ev: MouseEvent) {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if (dragLine) {
        dragLine.remove();
        dragLine = null;
      }

      const target = document.elementFromPoint(
        ev.clientX,
        ev.clientY
      ) as HTMLElement | null;

      if (target && target.classList.contains("connection-point")) {
        const targetWrapper = target.parentElement as HTMLElement;

        if (targetWrapper === wrapper) {
          console.warn("⛔ Cannot connect item to itself");
          return;
        }

        const svg = getOrCreateConnectionSvg();

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );

        line.classList.add("connection-line");

        line.setAttribute("stroke", "#333");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-linecap", "round");

        svg.appendChild(line);
        requestAnimationFrame(() => {
          line.style.strokeDashoffset = "0";
        });
        line.animate(
          [
            { strokeDashoffset: "0" },
            { strokeDashoffset: "-6" },
            { strokeDashoffset: "0" },
          ],
          {
            duration: 2000,
            iterations: Infinity,
            easing: "ease-in-out",
          }
        );

        svgConnections.push({
          line,
          fromItem: item,
          toWrapper: targetWrapper,
          fromSide: side,
          toSide: target.dataset.side as ConnectionSide,
        });

        updateSvgConnections();

        const x = targetWrapper.offsetLeft;
        const y = targetWrapper.offsetTop;

        const toItem = boardItems.find(
          (bi) =>
            bi !== item && bi.positionX === `${targetWrapper.offsetLeft}px`
        );

        if (!toItem) return;

        item.connections.push({
          toId: toItem.id,
          fromSide: side,
          toSide: target.dataset.side as ConnectionSide,
        });

        console.log("🔗 Connection created", {
          from: item.id,
          to: toItem.id,
        });
      }

      activeConnection = null;
      clearConnectionHover();
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}
function highlightConnectionTargets(enable: boolean) {
  document.querySelectorAll(".connection-point").forEach((p) => {
    const el = p as HTMLElement;
    el.style.background = enable ? "#2ed573" : "#ff4757";
  });
}
function clearConnectionHover() {
  highlightConnectionTargets(false);
}
document.addEventListener("mouseover", (e) => {
  const t = e.target as HTMLElement;
  if (t.classList.contains("connection-point")) {
    t.style.transform += " scale(1.3)";
  }
});
document.addEventListener("mouseout", (e) => {
  const t = e.target as HTMLElement;
  if (t.classList.contains("connection-point")) {
    t.style.transform = t.style.transform.replace(" scale(1.3)", "");
  }
});
function disableIframeInteraction(wrapper: HTMLElement) {
  const iframe = wrapper.querySelector("iframe") as HTMLIFrameElement | null;
  if (iframe) iframe.style.pointerEvents = "none";
}
function enableIframeInteraction(wrapper: HTMLElement) {
  const iframe = wrapper.querySelector("iframe") as HTMLIFrameElement | null;
  if (iframe) iframe.style.pointerEvents = "auto";
}
function normalizeYouTubeUrl(url: string): string {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }

    return url;
  } catch {
    return url;
  }
}
function isValidImageUrl(value?: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
function createEditor(extraClass?: string): HTMLDivElement {
  const editor = document.createElement("div");

  editor.classList.add("board-item-editor");
  if (extraClass) editor.classList.add(extraClass);

  editor.style.position = "absolute";
  editor.style.left = "0";
  editor.style.bottom = "-28px";
  editor.style.width = "100%";
  editor.style.fontSize = "12px";
  editor.style.padding = "2px";
  editor.style.boxSizing = "border-box";
  return editor;
}
function enableImageDrop(
  img: HTMLImageElement,
  item: BoardItem,
  urlInput?: HTMLInputElement
) {
  img.addEventListener("dragover", (e) => {
    e.preventDefault();
    img.style.outline = "2px dashed #2c7be5";
  });

  img.addEventListener("dragleave", () => {
    img.style.outline = "";
  });

  img.addEventListener("drop", (e) => {
    e.preventDefault();
    img.style.outline = "";

    const dt = e.dataTransfer;
    if (!dt) return;

    if (dt.files && dt.files.length > 0) {
      const file = dt.files[0];
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
        item.data = img.src;

        if (urlInput) urlInput.value = "";
      };
      reader.readAsDataURL(file);
      return;
    }

    const url = dt.getData("text/uri-list");
    if (url) {
      img.src = url;
      item.data = url;

      if (urlInput) urlInput.value = url;
    }
  });
}
function deleteBoardItem(wrapper: HTMLElement, item: BoardItem) {
  for (let i = svgConnections.length - 1; i >= 0; i--) {
    const c = svgConnections[i];

    if (c.fromItem === item || c.toWrapper === wrapper) {
      c.line.remove();
      svgConnections.splice(i, 1);
    }
  }

  boardItems.forEach((bi) => {
    if (!bi.connections) return;

    bi.connections = bi.connections.filter((conn) => conn.toId !== item.id);
  });

  const index = boardItems.indexOf(item);
  if (index !== -1) {
    boardItems.splice(index, 1);
  }

  wrapper.remove();

  updateSvgConnections();
}
function addDeleteHandle(wrapper: HTMLElement, item: BoardItem) {
  const handle = document.createElement("div");

  handle.style.position = "absolute";
  handle.style.left = "0";
  handle.style.top = "0";
  handle.style.width = "14px";
  handle.style.height = "14px";
  handle.style.background = "#e74c3c";
  handle.style.cursor = "pointer";
  handle.style.borderBottomRightRadius = "6px";
  handle.title = "Delete";

  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    e.preventDefault();

    deleteBoardItem(wrapper, item);
  });

  wrapper.appendChild(handle);
}
function addResizeHandle(wrapper: HTMLElement, item: BoardItem) {
  const handle = document.createElement("div");

  handle.style.position = "absolute";
  handle.style.width = "12px";
  handle.style.height = "12px";
  handle.style.right = "0";
  handle.style.bottom = "0";
  handle.style.cursor = "se-resize";
  handle.style.background = "#555";
  handle.style.borderTopLeftRadius = "25px";
  handle.style.pointerEvents = "auto";
  handle.title = "Resize";

  wrapper.appendChild(handle);

  enableResize(wrapper, handle, item);
}
function enableResize(
  wrapper: HTMLElement,
  handle: HTMLElement,
  item: BoardItem
) {
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  const board = document.getElementById("board")!;
  const boardRect = board.getBoundingClientRect();

  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();

    document.body.style.userSelect = "none";

    disableIframeInteraction(wrapper);

    startX = e.clientX;
    startY = e.clientY;
    startWidth = wrapper.offsetWidth;
    startHeight = wrapper.offsetHeight;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e: MouseEvent) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const left = wrapper.offsetLeft;
    const top = wrapper.offsetTop;

    const boardMaxWidth = boardRect.width - wrapper.offsetLeft;
    const boardMaxHeight = boardRect.height - wrapper.offsetTop;

    const maxWidth = Math.min(MAX_WIDTH, boardMaxWidth);
    const maxHeight = Math.min(MAX_HEIGHT, boardMaxHeight);

    let newWidth = startWidth + dx;
    let newHeight = startHeight + dy;

    newWidth = Math.max(MIN_WIDTH, Math.min(maxWidth, newWidth));

    newHeight = Math.max(MIN_HEIGHT, Math.min(maxHeight, newHeight));

    wrapper.style.width = `${newWidth}px`;
    wrapper.style.height = `${newHeight}px`;

    item.defWidth = `${newWidth}px`;
    item.defHeight = `${newHeight}px`;

    updateSvgConnections();
  }

  function onMouseUp() {
    document.body.style.userSelect = "";

    enableIframeInteraction(wrapper);

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}
function addMoveHandle(wrapper: HTMLElement, item: BoardItem) {
  const handle = document.createElement("div");

  handle.style.position = "absolute";
  handle.style.width = "14px";
  handle.style.height = "14px";
  handle.style.right = "0";
  handle.style.top = "0";
  handle.style.cursor = "move";
  handle.style.background = "#2c7be5";
  handle.style.borderBottomLeftRadius = "6px";
  handle.title = "Move";

  wrapper.appendChild(handle);

  enableMove(wrapper, handle, item);
}
function enableMove(
  wrapper: HTMLElement,
  handle: HTMLElement,
  item: BoardItem
) {
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  const board = document.getElementById("board")!;
  const boardRect = board.getBoundingClientRect();

  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();

    document.body.style.userSelect = "none";

    disableIframeInteraction(wrapper);

    startX = e.clientX;
    startY = e.clientY;
    startLeft = wrapper.offsetLeft;
    startTop = wrapper.offsetTop;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e: MouseEvent) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newLeft = startLeft + dx;
    let newTop = startTop + dy;

    const maxX = boardRect.width - wrapper.offsetWidth;
    const maxY = boardRect.height - wrapper.offsetHeight;

    newLeft = Math.max(0, Math.min(maxX, newLeft));
    newTop = Math.max(0, Math.min(maxY, newTop));

    wrapper.style.left = `${newLeft}px`;
    wrapper.style.top = `${newTop}px`;

    item.positionX = `${newLeft}px`;
    item.positionY = `${newTop}px`;
    updateSvgConnections();
  }

  function onMouseUp() {
    document.body.style.userSelect = "";

    enableIframeInteraction(wrapper);

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}
export function clearBoardItems() {
  const wrappers = document.querySelectorAll(".board-item-wrapper");
  wrappers.forEach((w) => w.remove());

  svgConnections.forEach((c) => c.line.remove());
  svgConnections.length = 0;

  boardItems.length = 0;

  document.getElementById("connection-svg")?.remove();

  console.log("Board cleared (memory + DOM)");
}

export function exportBoardToJson(filename = "board-export.json") {
  const data = {
    meta: {
      exportedAt: new Date().toISOString(),
      version: 1,
    },
    items: boardItems.map((item) => ({
      id: item.id,
      type: item.type,
      positionX: item.positionX,
      positionY: item.positionY,
      width: item.defWidth,
      height: item.defHeight,
      data: item.data ?? null,
      placeholder: item.placeholder ?? null,
      checked: "checked" in item ? (item as any).checked : null,
      connections: item.connections ?? [],
    })),
    connections: svgConnections.map((c) => ({
      fromId: c.fromItem.id,
      toId: c.toWrapper.dataset.id,
      fromSide: c.fromSide,
      toSide: c.toSide,
    })),
  };

  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);

  console.log("Board exported to JSON");
}

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "i") {
    debugDumpBoardItems();
  }
});

function debugDumpBoardItems() {
  const snapshot = boardItems.map((item) => ({
    id: item.id,
    type: item.type,
    position: {
      x: item.positionX,
      y: item.positionY,
    },
    size: {
      width: item.defWidth,
      height: item.defHeight,
    },
    data: item.data ?? null,
    checked: "checked" in item ? (item as any).checked : null,
    connections: item.connections
      ? item.connections.map((c) => ({
          toId: c.toId,
          fromSide: c.fromSide,
          toSide: c.toSide,
        }))
      : [],
  }));

  console.group("Board Items Dump");
  console.log(snapshot);
  console.groupEnd();

  return snapshot;
}
