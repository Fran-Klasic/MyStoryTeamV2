const MAX_WIDTH = 400;
const MAX_HEIGHT = 300;
const MIN_WIDTH = 60;
const MIN_HEIGHT = 40;

import { BoardItem } from "./boardItemBase.js";

const boardItems: BoardItem[] = [];

function placeBoardItem(item: BoardItem) {
  const parent = document.getElementById("board");
  if (!parent) return;

  const wrapper = document.createElement("div");
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

  applyPlaceholder(el, item);

  addResizeHandle(wrapper, item);
  addMoveHandle(wrapper, item);

  wrapper.appendChild(el);
  parent.appendChild(wrapper);

  boardItems.push(item);
}

function applyPlaceholder(el: HTMLElement, item: BoardItem) {
  switch (item.type) {
    case "input":
      (el as HTMLInputElement).placeholder = item.placeholder;
      (el as HTMLInputElement).value = item.data ?? "";
      break;

    case "textarea":
      (el as HTMLTextAreaElement).placeholder = item.placeholder;
      (el as HTMLTextAreaElement).value = item.data ?? "";
      break;

    case "img":
      if (item.data) (el as HTMLImageElement).src = item.data;
      break;

    case "video":
      if (item.data) {
        (el as HTMLVideoElement).src = item.data;
        el.setAttribute("controls", "true");
      }
      break;

    case "ul":
      if (item.data) {
        const lines = item.data.split("\n");
        if (lines.length === 0) lines[0] = " ";
        for (const text of lines) {
          const li = document.createElement("li");
          li.textContent = text;
          el.appendChild(li);
        }
      }
      break;

    case "section":
      break;
  }
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
  handle.style.zIndex = "10";
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

  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();

    document.body.style.userSelect = "none";

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

    let newWidth = startWidth + dx;
    let newHeight = startHeight + dy;

    newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
    newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));

    wrapper.style.width = `${newWidth}px`;
    wrapper.style.height = `${newHeight}px`;

    item.defWidth = `${newWidth}px`;
    item.defHeight = `${newHeight}px`;
  }

  function onMouseUp() {
    document.body.style.userSelect = "";
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
  handle.style.zIndex = "10";

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
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}

const textItem: BoardItem = {
  type: "textarea",
  positionX: "50%",
  positionY: "10%",
  defWidth: "150px",
  defHeight: "40px",
  placeholder: "Enter text",
  data: "Hello",
  connections: [],
};

placeBoardItem(textItem);

setInterval(() => {
  console.log("📋 Board Items:");

  boardItems.forEach((item, index) => {
    console.log(`Item ${index + 1}:`, {
      type: item.type,
      positionX: item.positionX,
      positionY: item.positionY,
      width: item.defWidth,
      height: item.defHeight,
      data: item.data,
      connections: item.connections.length,
    });
  });
}, 2000);
