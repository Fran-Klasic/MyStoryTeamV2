export type BoardItemType = "textarea" | "input" | "ul" | "img" | "iframe";
export type ConnectionSide = "top" | "right" | "bottom" | "left";
export type SvgConnection = {
  line: SVGLineElement;
  fromItem: BoardItem;
  toWrapper: HTMLElement;
  fromSide: ConnectionSide;
  toSide: ConnectionSide;
};

type Size = `${number}px` | `${number}%`;

type BoardItemBase = {
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
type BoardItemInput = BoardItemBase & {
  type: "input";
  checked: boolean;
};

type BoardItemNormal = BoardItemBase & {
  type: Exclude<BoardItemType, "section" | "input">;
  sectionData?: never;
};

export type BoardItem = BoardItemInput | BoardItemNormal;
