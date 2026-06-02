import { useRef } from "react";
import type { DragState, EdgeConnection, RectItem } from "../types/geometry";
import { getSvgPoint } from "../utils/pointer";
import StatusPanel from "./StatusPanel";
import { snapRectSizeToOtherRects, snapRectToOtherRects } from "../utils/snap";
import { getConnectionLines } from "../utils/connectionLines";

type DesignCanvasProps = {
  rects: RectItem[];
  selectedId: number | null;
  dragState: DragState | null;
  connections: EdgeConnection[];
  onSelect: (id: number | null) => void;
  onChangeRects: React.Dispatch<React.SetStateAction<RectItem[]>>;
  onStartDrag: (dragState: DragState) => void;
  onStopDrag: () => void;
  onUpdateSelectedRect: (patch: Partial<RectItem>) => void;
};

const MIN_RECT_SIZE = 40;

function DesignCanvas({
  rects,
  selectedId,
  dragState,
  connections,
  onSelect,
  onChangeRects,
  onStartDrag,
  onStopDrag,
  onUpdateSelectedRect,
}: DesignCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const startMove = (
    event: React.PointerEvent<SVGGElement>,
    rect: RectItem
  ) => {
    event.stopPropagation();

    const point = getSvgPoint(event, svgRef.current);

    onSelect(rect.id);
    onStartDrag({
      mode: "move",
      rectId: rect.id,
      startMouseX: point.x,
      startMouseY: point.y,
      startRectX: rect.x,
      startRectY: rect.y,
      startWidth: rect.width,
      startHeight: rect.height,
    });
  };

  const startResize = (
    event: React.PointerEvent<SVGRectElement>,
    rect: RectItem
  ) => {
    event.stopPropagation();

    const point = getSvgPoint(event, svgRef.current);

    onSelect(rect.id);
    onStartDrag({
      mode: "resize",
      rectId: rect.id,
      startMouseX: point.x,
      startMouseY: point.y,
      startRectX: rect.x,
      startRectY: rect.y,
      startWidth: rect.width,
      startHeight: rect.height,
    });
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragState) return;

    const point = getSvgPoint(event, svgRef.current);

    const dx = point.x - dragState.startMouseX;
    const dy = point.y - dragState.startMouseY;

    onChangeRects((prev) =>
      prev.map((rect) => {
        if (rect.id !== dragState.rectId) return rect;

        if (dragState.mode === "move") {
          const movedRect = {
            ...rect,
            x: Math.round((dragState.startRectX + dx) * 100) / 100,
            y: Math.round((dragState.startRectY + dy) * 100) / 100,
          };

          return snapRectToOtherRects(
            movedRect,
            prev.filter((item) => item.id !== rect.id)
          );
        }

        const resizedRect = {
            ...rect,
            width:
                Math.round(Math.max(MIN_RECT_SIZE, dragState.startWidth + dx) * 100) /
                100,
            height:
                Math.round(Math.max(MIN_RECT_SIZE, dragState.startHeight + dy) * 100) /
                100,
            };

            return snapRectSizeToOtherRects(
            resizedRect,
            prev.filter((item) => item.id !== rect.id)
            );
      })
    );
  };

  const selectedRect = rects.find((rect) => rect.id === selectedId);

  const connectionLines = getConnectionLines(rects, connections);

  return (
    <section className="panel panel-2d">
      <div className="panel-header">
        <h2>2D 전개도 작업영역</h2>
        <span>
          {rects.length}개 도형 · {connections.length}개 연결
        </span>
      </div>

      <svg
        ref={svgRef}
        className="design-canvas"
        width="100%"
        height="100%"
        onPointerMove={handlePointerMove}
        onPointerUp={onStopDrag}
        onPointerLeave={onStopDrag}
        onPointerDown={() => onSelect(null)}
      >
        {connectionLines.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            className="connection-line"
          />
        ))}

        {rects.map((rect) => (
          <g
            key={rect.id}
            className="paper-shape-group"
            onPointerDown={(event) => startMove(event, rect)}
          >
            <rect
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              className={
                selectedId === rect.id
                  ? "paper-rect paper-rect-selected"
                  : "paper-rect"
              }
            />

            <text
              x={rect.x + rect.width / 2}
              y={rect.y + rect.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="rect-label"
            >
              {rect.width.toFixed(2)} × {rect.height.toFixed(2)}
            </text>

            {selectedId === rect.id && (
              <rect
                x={rect.x + rect.width - 6}
                y={rect.y + rect.height - 6}
                width={12}
                height={12}
                className="resize-handle"
                onPointerDown={(event) => startResize(event, rect)}
              />
            )}
          </g>
        ))}
      </svg>

      <StatusPanel
        selectedRect={selectedRect}
        onUpdateSelectedRect={onUpdateSelectedRect}
      />
    </section>
  );
}

export default DesignCanvas;