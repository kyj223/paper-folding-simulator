import type { EdgeConnection, RectEdgeName, RectItem } from "../types/geometry";

const CONNECTION_EPSILON = 0.5;

const rangesOverlap = (
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
) => {
  return Math.min(aEnd, bEnd) - Math.max(aStart, bStart) > CONNECTION_EPSILON;
};

const makeConnectionId = (
  shapeAId: number,
  edgeA: RectEdgeName,
  shapeBId: number,
  edgeB: RectEdgeName
) => {
  const first = `${shapeAId}:${edgeA}`;
  const second = `${shapeBId}:${edgeB}`;

  return [first, second].sort().join("__");
};

export const detectRectConnections = (
  rects: RectItem[]
): EdgeConnection[] => {
  const connections: EdgeConnection[] = [];

  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i];
      const b = rects[j];

      const aLeft = a.x;
      const aRight = a.x + a.width;
      const aTop = a.y;
      const aBottom = a.y + a.height;

      const bLeft = b.x;
      const bRight = b.x + b.width;
      const bTop = b.y;
      const bBottom = b.y + b.height;

      const verticalOverlap = rangesOverlap(aTop, aBottom, bTop, bBottom);
      const horizontalOverlap = rangesOverlap(aLeft, aRight, bLeft, bRight);

      if (verticalOverlap && Math.abs(aRight - bLeft) <= CONNECTION_EPSILON) {
        connections.push({
          id: makeConnectionId(a.id, "right", b.id, "left"),
          shapeAId: a.id,
          edgeA: "right",
          shapeBId: b.id,
          edgeB: "left",
        });
      }

      if (verticalOverlap && Math.abs(aLeft - bRight) <= CONNECTION_EPSILON) {
        connections.push({
          id: makeConnectionId(a.id, "left", b.id, "right"),
          shapeAId: a.id,
          edgeA: "left",
          shapeBId: b.id,
          edgeB: "right",
        });
      }

      if (horizontalOverlap && Math.abs(aBottom - bTop) <= CONNECTION_EPSILON) {
        connections.push({
          id: makeConnectionId(a.id, "bottom", b.id, "top"),
          shapeAId: a.id,
          edgeA: "bottom",
          shapeBId: b.id,
          edgeB: "top",
        });
      }

      if (horizontalOverlap && Math.abs(aTop - bBottom) <= CONNECTION_EPSILON) {
        connections.push({
          id: makeConnectionId(a.id, "top", b.id, "bottom"),
          shapeAId: a.id,
          edgeA: "top",
          shapeBId: b.id,
          edgeB: "bottom",
        });
      }
    }
  }

  return connections;
};