import { placeBoardItem, PLACEHOLDER } from "./planner-base";

import { INPUT_HEIGHT } from "./planner-base";
import { INPUT_WIDTH } from "./planner-base";
import { DEFAULT_WIDTH } from "./planner-base";
import { DEFAULT_HEIGHT } from "./planner-base";
import { EDGE_PADDING } from "./planner-base";
import { clearBoardItems } from "./planner-base";
import { exportBoardToJson } from "./planner-base";
import type { BoardItem, BoardItemType } from "./types/board-item-types";

let placing = false;
function startPlacing(type: BoardItemType) {
  if (placing) return;
  placing = true;

  const main = document.querySelector("main") as HTMLElement;
  const header = document.querySelector("header") as HTMLElement;
  const board = document.getElementById("board") as HTMLElement;

  document.body.style.cursor = "not-allowed";
  header.style.cursor = "not-allowed";
  main.style.cursor = "crosshair";

  const onClick = (e: MouseEvent) => {
    const rect = board.getBoundingClientRect();

    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    generateItem(rawX, rawY, type, board);

    cleanup();
  };

  function cleanup() {
    placing = false;
    document.body.style.cursor = "default";
    header.style.cursor = "default";
    main.style.cursor = "default";
    board.removeEventListener("click", onClick);
  }

  board.addEventListener("click", onClick);
}

function generateItem(
  x: number,
  y: number,
  type: BoardItemType,
  board: HTMLElement,
) {
  const boardWidth = board.clientWidth;
  const boardHeight = board.clientHeight;

  const width = type === "input" ? INPUT_WIDTH : DEFAULT_WIDTH;
  const height = type === "input" ? INPUT_HEIGHT : DEFAULT_HEIGHT;

  const maxX = boardWidth - width - EDGE_PADDING;
  const maxY = boardHeight - height - EDGE_PADDING;

  if (x > maxX || y > maxY) {
    return;
  }

  if (type === "input") {
    const item: BoardItem = {
      id: crypto.randomUUID(),
      type: "input",
      positionX: `${x}px`,
      positionY: `${y}px`,
      defWidth: `${width}px`,
      defHeight: `${height}px`,
      placeholder: PLACEHOLDER,
      checked: false,
      connections: [],
    };

    placeBoardItem(item);
    return;
  }

  const item: BoardItem = {
    id: crypto.randomUUID(),
    type,
    positionX: `${x}px`,
    positionY: `${y}px`,
    defWidth: `${width}px`,
    defHeight: `${height}px`,
    placeholder: PLACEHOLDER,
    connections: [],
  };

  placeBoardItem(item);
}

(window as any).startPlacing = startPlacing;
(window as any).clearBoardItems = clearBoardItems;
(window as any).exportBoardToJson = exportBoardToJson;
