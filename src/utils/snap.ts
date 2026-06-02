import type { RectItem } from "../types/geometry";

const SNAP_DISTANCE = 12;
const ALIGN_DISTANCE = 12;

const round2 = (value: number) => Math.round(value * 100) / 100;

const getBestYAlignment = (movingRect: RectItem, target: RectItem) => {
  const candidates = [
    {
      diff: Math.abs(movingRect.y - target.y),
      y: target.y,
    },
    {
      diff: Math.abs(
        movingRect.y +
          movingRect.height -
          (target.y + target.height)
      ),
      y: target.y + target.height - movingRect.height,
    },
    {
      diff: Math.abs(
        movingRect.y +
          movingRect.height / 2 -
          (target.y + target.height / 2)
      ),
      y: target.y + target.height / 2 - movingRect.height / 2,
    },
  ];

  const best = candidates.sort((a, b) => a.diff - b.diff)[0];

  if (best.diff <= ALIGN_DISTANCE) {
    return round2(best.y);
  }

  return movingRect.y;
};

const getBestXAlignment = (movingRect: RectItem, target: RectItem) => {
  const candidates = [
    {
      diff: Math.abs(movingRect.x - target.x),
      x: target.x,
    },
    {
      diff: Math.abs(
        movingRect.x +
          movingRect.width -
          (target.x + target.width)
      ),
      x: target.x + target.width - movingRect.width,
    },
    {
      diff: Math.abs(
        movingRect.x +
          movingRect.width / 2 -
          (target.x + target.width / 2)
      ),
      x: target.x + target.width / 2 - movingRect.width / 2,
    },
  ];

  const best = candidates.sort((a, b) => a.diff - b.diff)[0];

  if (best.diff <= ALIGN_DISTANCE) {
    return round2(best.x);
  }

  return movingRect.x;
};

export const snapRectToOtherRects = (
  movingRect: RectItem,
  otherRects: RectItem[]
): RectItem => {
  let nextRect = { ...movingRect };

  for (const target of otherRects) {
    const movingLeft = nextRect.x;
    const movingRight = nextRect.x + nextRect.width;
    const movingTop = nextRect.y;
    const movingBottom = nextRect.y + nextRect.height;

    const targetLeft = target.x;
    const targetRight = target.x + target.width;
    const targetTop = target.y;
    const targetBottom = target.y + target.height;

    const verticalOverlap =
      movingBottom >= targetTop && movingTop <= targetBottom;

    const horizontalOverlap =
      movingRight >= targetLeft && movingLeft <= targetRight;

    if (
      verticalOverlap &&
      Math.abs(movingLeft - targetRight) <= SNAP_DISTANCE
    ) {
      nextRect = {
        ...nextRect,
        x: round2(targetRight),
        y: getBestYAlignment(nextRect, target),
      };
    }

    if (
      verticalOverlap &&
      Math.abs(movingRight - targetLeft) <= SNAP_DISTANCE
    ) {
      nextRect = {
        ...nextRect,
        x: round2(targetLeft - nextRect.width),
        y: getBestYAlignment(nextRect, target),
      };
    }

    if (
      horizontalOverlap &&
      Math.abs(movingTop - targetBottom) <= SNAP_DISTANCE
    ) {
      nextRect = {
        ...nextRect,
        y: round2(targetBottom),
        x: getBestXAlignment(nextRect, target),
      };
    }

    if (
      horizontalOverlap &&
      Math.abs(movingBottom - targetTop) <= SNAP_DISTANCE
    ) {
      nextRect = {
        ...nextRect,
        y: round2(targetTop - nextRect.height),
        x: getBestXAlignment(nextRect, target),
      };
    }
  }

  return nextRect;
};

const SIZE_SNAP_DISTANCE = 12;
const MIN_RECT_SIZE = 40;

export const snapRectSizeToOtherRects = (
  resizingRect: RectItem,
  otherRects: RectItem[]
): RectItem => {
  let nextWidth = resizingRect.width;
  let nextHeight = resizingRect.height;

  for (const target of otherRects) {
    if (Math.abs(nextWidth - target.width) <= SIZE_SNAP_DISTANCE) {
      nextWidth = target.width;
    }

    if (Math.abs(nextHeight - target.height) <= SIZE_SNAP_DISTANCE) {
      nextHeight = target.height;
    }

    if (Math.abs(nextWidth - target.height) <= SIZE_SNAP_DISTANCE) {
      nextWidth = target.height;
    }

    if (Math.abs(nextHeight - target.width) <= SIZE_SNAP_DISTANCE) {
      nextHeight = target.width;
    }
  }

  return {
    ...resizingRect,
    width: round2(Math.max(MIN_RECT_SIZE, nextWidth)),
    height: round2(Math.max(MIN_RECT_SIZE, nextHeight)),
  };
};