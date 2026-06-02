import type { RectItem } from "../types/geometry";
import type { SolidInfo } from "../types/solid";

const SIZE_EPSILON = 0.5;

const isSameSize = (a: RectItem, b: RectItem) => {
  return (
    Math.abs(a.width - b.width) <= SIZE_EPSILON &&
    Math.abs(a.height - b.height) <= SIZE_EPSILON
  );
};

export const analyzeSolidFromRects = (rects: RectItem[]): SolidInfo | null => {
  if (rects.length !== 6) {
    return null;
  }

  const base = rects[0];
  const allSameSize = rects.every((rect) => isSameSize(base, rect));

  if (allSameSize) {
    return {
      type: "cube",
      width: base.width,
      height: base.height,
      depth: base.width,
    };
  }

  return null;
};