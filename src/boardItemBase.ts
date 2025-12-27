type BoardItemType = "textarea" | "input" | "ul" | "section" | "img" | "video";

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

type SectionBoardItem = BoardItemBase & {
  type: "section";
  sectionData: BoardItemType;
};

type NonSectionBoardItem = BoardItemBase & {
  type: Exclude<BoardItemType, "section">;
  sectionData?: never;
};

export type BoardItem = SectionBoardItem | NonSectionBoardItem;
