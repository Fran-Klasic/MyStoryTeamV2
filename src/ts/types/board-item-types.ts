export type BoardItemType = "textarea" | "input" | "ul" | "img" | "iframe";

export type ConnectionSide = "top" | "right" | "bottom" | "left";

export type SvgConnection = {
  line: SVGLineElement;
  fromItem: BoardItem;
  toWrapper: HTMLElement;
  fromSide: ConnectionSide;
  toSide: ConnectionSide;
};

export type Size = `${number}px` | `${number}%`;

export type BoardItemBase = {
  id: string;
  positionX: Size;
  positionY: Size;
  defWidth: Size;
  defHeight: Size;
  placeholder: string;
  data?: string;
  connections: {
    toId: string;
    fromSide: ConnectionSide;
    toSide: ConnectionSide;
  }[];
};

export type BoardItemInput = BoardItemBase & {
  type: "input";
  checked: boolean;
};

export type BoardItemNormal = BoardItemBase & {
  type: Exclude<BoardItemType, "section" | "input">;
  sectionData?: never;
};

export type BoardItem = BoardItemInput | BoardItemNormal;
