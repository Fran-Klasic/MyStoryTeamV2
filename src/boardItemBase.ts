export type BoardItemType = "textarea" | "input" | "ul" | "img" | "iframe";

type Size = `${number}px` | `${number}%`;

type BoardItemBase = {
  positionX: Size;
  positionY: Size;
  defWidth: Size;
  defHeight: Size;
  placeholder: string;
  data?: string;
  connections: number[][];
};
type BoardItemInput = BoardItemBase & {
  type: "input";
  checked: boolean;
};

type BoardItemNormal = BoardItemBase & {
  type: Exclude<BoardItemType, "section" | "input">;
  sectionData?: never;
};

export type BoardItem = BoardItemInput | BoardItemNormal;
