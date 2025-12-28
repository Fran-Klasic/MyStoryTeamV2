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

const boardItems: BoardItem[] = [];

export function placeBoardItem(item: BoardItem) {
  const parent = document.getElementById("board");
  if (!parent) return;

  const wrapper = document.createElement("div");
  wrapper.classList.add("board-item-wrapper");

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

      const editor = createEditor();

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

      const editor = createEditor();

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

      const editor = createEditor();

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
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.alignItems = "center";
      container.style.gap = "6px";
      container.style.width = "100%";
      container.style.height = "100%";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!item.checked;

      const label = document.createElement("span");
      label.contentEditable = "true";
      label.style.flex = "1";
      label.style.outline = "none";
      label.textContent = item.data ?? "";

      function updateStyle() {
        label.style.textDecoration = checkbox.checked ? "line-through" : "none";
        label.style.opacity = checkbox.checked ? "0.6" : "1";
      }

      updateStyle();

      checkbox.addEventListener("change", () => {
        item.checked = checkbox.checked;
        updateStyle();
      });

      label.addEventListener("input", () => {
        item.data = label.textContent ?? "";
      });

      container.appendChild(checkbox);
      container.appendChild(label);
      wrapper.appendChild(container);
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
function createEditor(): HTMLDivElement {
  const editor = document.createElement("div");
  editor.style.position = "absolute";
  editor.style.left = "0";
  editor.style.bottom = "-28px";
  editor.style.width = "100%";
  editor.style.background = "#f1f1f1";
  editor.style.border = "1px solid #ccc";
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
  // handle.style.zIndex = "10";
  handle.style.pointerEvents = "auto";

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
  // handle.style.zIndex = "10";

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
  }

  function onMouseUp() {
    document.body.style.userSelect = "";

    enableIframeInteraction(wrapper);

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}

// const textItem: BoardItem = {
//   type: "iframe",
//   positionX: "50px",
//   positionY: "10px",
//   defWidth: "400px",
//   defHeight: "300px",
//   placeholder: PLACEHOLDER,
//   data: "https://www.youtube.com/watch?v=sO26X7Tpcm4",
//   connections: [],
// };
// placeBoardItem(textItem);

// setInterval(() => {
//   console.log("📋 Board Items Snapshot");

//   boardItems.forEach((item, index) => {
//     const base = {
//       index: index + 1,
//       type: item.type,
//       positionX: item.positionX,
//       positionY: item.positionY,
//       width: item.defWidth,
//       height: item.defHeight,
//       data: item.data,
//       connections: item.connections,
//     };

//     if (item.type === "input") {
//       console.log({
//         ...base,
//         checked: item.checked,
//       });
//     } else {
//       console.log(base);
//     }
//   });
// }, 2000);
