export type ShapeType = "rectangle";

export type RectEdgeName = "top" | "right" | "bottom" | "left";

export type RectItem = {
  id: number;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type EdgeConnection = {
  id: string;
  shapeAId: number;
  edgeA: RectEdgeName;
  shapeBId: number;
  edgeB: RectEdgeName;
};

export type DragMode = "move" | "resize";

export type DragState = {
  mode: DragMode;
  rectId: number;
  startMouseX: number;
  startMouseY: number;
  startRectX: number;
  startRectY: number;
  startWidth: number;
  startHeight: number;
};