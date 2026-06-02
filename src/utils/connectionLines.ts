import type { EdgeConnection, RectEdgeName, RectItem } from "../types/geometry";

export type ConnectionLine = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const getRectById = (rects: RectItem[], id: number) => {
  return rects.find((rect) => rect.id === id);
};

const getEdgeLine = (rect: RectItem, edge: RectEdgeName) => {
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;

  if (edge === "top") {
    return { x1: left, y1: top, x2: right, y2: top };
  }

  if (edge === "right") {
    return { x1: right, y1: top, x2: right, y2: bottom };
  }

  if (edge === "bottom") {
    return { x1: left, y1: bottom, x2: right, y2: bottom };
  }

  return { x1: left, y1: top, x2: left, y2: bottom };
};

export const getConnectionLines = (
  rects: RectItem[],
  connections: EdgeConnection[]
): ConnectionLine[] => {
  return connections
    .map((connection) => {
      const rectA = getRectById(rects, connection.shapeAId);

      if (!rectA) {
        return null;
      }

      const line = getEdgeLine(rectA, connection.edgeA);

      return {
        id: connection.id,
        ...line,
      };
    })
    .filter((line): line is ConnectionLine => line !== null);
};