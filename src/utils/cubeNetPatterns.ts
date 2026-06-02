import type { RectItem } from "../types/geometry";

type GridCell = {
  x: number;
  y: number;
};

type Vec3 = {
  x: number;
  y: number;
  z: number;
};

type Orientation = {
  n: Vec3; // normal
  u: Vec3; // up
  r: Vec3; // right
};

const vecKey = (v: Vec3) => `${v.x},${v.y},${v.z}`;

const neg = (v: Vec3): Vec3 => ({
  x: -v.x,
  y: -v.y,
  z: -v.z,
});

const sameVec = (a: Vec3, b: Vec3) => {
  return a.x === b.x && a.y === b.y && a.z === b.z;
};

const sameOrientation = (a: Orientation, b: Orientation) => {
  return sameVec(a.n, b.n) && sameVec(a.u, b.u) && sameVec(a.r, b.r);
};

const getCellKey = (cell: GridCell) => `${cell.x},${cell.y}`;

const getRectGridCells = (rects: RectItem[]) => {
  if (rects.length === 0) return [];

  const unit = rects[0].width;

  return rects.map((rect) => ({
    x: Math.round(rect.x / unit),
    y: Math.round(rect.y / unit),
  }));
};

const getNeighborOrientation = (
  parent: Orientation,
  dx: number,
  dy: number
): Orientation => {
  // 오른쪽
  if (dx === 1 && dy === 0) {
    return {
      n: parent.r,
      u: parent.u,
      r: neg(parent.n),
    };
  }

  // 왼쪽
  if (dx === -1 && dy === 0) {
    return {
      n: neg(parent.r),
      u: parent.u,
      r: parent.n,
    };
  }

  // 아래쪽
  if (dx === 0 && dy === 1) {
    return {
      n: neg(parent.u),
      u: parent.n,
      r: parent.r,
    };
  }

  // 위쪽
  return {
    n: parent.u,
    u: neg(parent.n),
    r: parent.r,
  };
};

export const isCubeNetPattern = (rects: RectItem[]) => {
  const cells = getRectGridCells(rects);

  if (cells.length !== 6) return false;

  const cellMap = new Map<string, GridCell>();

  cells.forEach((cell) => {
    cellMap.set(getCellKey(cell), cell);
  });

  if (cellMap.size !== 6) return false;

  const directions = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  let adjacencyCount = 0;

  cells.forEach((cell) => {
    directions.forEach(({ dx, dy }) => {
      if (cellMap.has(`${cell.x + dx},${cell.y + dy}`)) {
        adjacencyCount += 1;
      }
    });
  });

  adjacencyCount = adjacencyCount / 2;

  if (adjacencyCount !== 5) return false;

  const root = cells[0];

  const rootOrientation: Orientation = {
    n: { x: 0, y: 0, z: 1 },
    u: { x: 0, y: -1, z: 0 },
    r: { x: 1, y: 0, z: 0 },
  };

  const orientations = new Map<string, Orientation>();
  const queue: GridCell[] = [root];

  orientations.set(getCellKey(root), rootOrientation);

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) continue;

    const currentKey = getCellKey(current);
    const currentOrientation = orientations.get(currentKey);

    if (!currentOrientation) continue;

    directions.forEach(({ dx, dy }) => {
      const nextCell = cellMap.get(`${current.x + dx},${current.y + dy}`);

      if (!nextCell) return;

      const nextKey = getCellKey(nextCell);
      const nextOrientation = getNeighborOrientation(
        currentOrientation,
        dx,
        dy
      );

      const existingOrientation = orientations.get(nextKey);

      if (existingOrientation) {
        if (!sameOrientation(existingOrientation, nextOrientation)) {
          orientations.set(nextKey, nextOrientation);
        }

        return;
      }

      orientations.set(nextKey, nextOrientation);
      queue.push(nextCell);
    });
  }

  if (orientations.size !== 6) return false;

  const normalKeys = new Set(
    Array.from(orientations.values()).map((orientation) =>
      vecKey(orientation.n)
    )
  );

  return normalKeys.size === 6;
};