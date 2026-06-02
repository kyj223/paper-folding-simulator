import type { EdgeConnection, RectItem } from "../types/geometry";
import { isCubeNetPattern } from "./cubeNetPatterns";

type ValidationResult = {
  valid: boolean;
  message: string;
};

const SIZE_EPSILON = 0.5;

const isSameSize = (a: RectItem, b: RectItem) => {
  return (
    Math.abs(a.width - b.width) <= SIZE_EPSILON &&
    Math.abs(a.height - b.height) <= SIZE_EPSILON
  );
};

const isConnectedGraph = (
  rects: RectItem[],
  connections: EdgeConnection[]
) => {
  if (rects.length === 0) return false;

  const graph = new Map<number, number[]>();

  rects.forEach((rect) => {
    graph.set(rect.id, []);
  });

  connections.forEach((connection) => {
    graph.get(connection.shapeAId)?.push(connection.shapeBId);
    graph.get(connection.shapeBId)?.push(connection.shapeAId);
  });

  const visited = new Set<number>();
  const stack = [rects[0].id];

  while (stack.length > 0) {
    const currentId = stack.pop();

    if (currentId === undefined || visited.has(currentId)) continue;

    visited.add(currentId);

    const neighbors = graph.get(currentId) ?? [];

    neighbors.forEach((neighborId) => {
      if (!visited.has(neighborId)) {
        stack.push(neighborId);
      }
    });
  }

  return visited.size === rects.length;
};

export const validateCubeNet = (
  rects: RectItem[],
  connections: EdgeConnection[]
): ValidationResult => {
  if (rects.length !== 6) {
    return {
      valid: false,
      message: `기본 연결성 검증 실패\n\n정육면체 후보 도면은 사각형 6개가 필요합니다.\n현재 도형 수: ${rects.length}개`,
    };
  }

  const base = rects[0];

  const hasDifferentSize = rects.some((rect) => !isSameSize(base, rect));

  if (hasDifferentSize) {
    return {
      valid: false,
      message:
        "기본 연결성 검증 실패\n\n정육면체 후보 도면은 모든 사각형의 크기가 같아야 합니다.",
    };
  }

  if (connections.length < 5) {
    return {
      valid: false,
      message: `기본 연결성 검증 실패\n\n도형들이 충분히 연결되어 있지 않습니다.\n현재 연결 수: ${connections.length}개\n필요 연결 수: 최소 5개`,
    };
  }

  if (!isConnectedGraph(rects, connections)) {
    return {
      valid: false,
      message:
        "기본 연결성 검증 실패\n\n모든 도형이 하나의 연결된 전개도 구조여야 합니다.",
    };
  }

  if (!isCubeNetPattern(rects)) {
    return {
      valid: false,
      message:
        "입체 도형이 될 수 없는 도면입니다.\n\n6개의 동일한 사각형이 연결되어 있지만, 정육면체로 접을 수 있는 전개도 형태가 아닙니다.\n\n예: 사각형 6개를 일렬로 붙인 형태는 정육면체가 될 수 없습니다.",
    };
  }

  return {
    valid: true,
    message:
      "정육면체 전개도 검증 통과\n\n현재 도면은 정육면체로 접을 수 있는 전개도 형태입니다.\n\n다음 단계에서 Three.js 3D 시뮬레이션을 연결합니다.",
  };
};