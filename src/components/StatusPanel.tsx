import type { RectItem } from "../types/geometry";

type EditableRectKey = "x" | "y" | "width" | "height";

type StatusPanelProps = {
  selectedRect: RectItem | undefined;
  onUpdateSelectedRect: (patch: Partial<RectItem>) => void;
};

const MIN_RECT_SIZE = 40;

function StatusPanel({
  selectedRect,
  onUpdateSelectedRect,
}: StatusPanelProps) {
  const updateNumber = (key: EditableRectKey, value: string) => {
    if (!selectedRect) return;

    const nextValue = Number(value);

    if (Number.isNaN(nextValue)) return;

    if (key === "width" || key === "height") {
      onUpdateSelectedRect({
        [key]: Math.max(MIN_RECT_SIZE, Math.round(nextValue * 100) / 100),
      });
      return;
    }

    onUpdateSelectedRect({
      [key]: Math.round(nextValue * 100) / 100,
    });
  };

  return (
    <div className="status-panel">
      {selectedRect ? (
        <>
          <strong>선택 도형</strong>

          <label>
            X
            <input
              type="number"
              step="0.01"
              value={selectedRect.x}
              onChange={(event) => updateNumber("x", event.target.value)}
            />
          </label>

          <label>
            Y
            <input
              type="number"
              step="0.01"
              value={selectedRect.y}
              onChange={(event) => updateNumber("y", event.target.value)}
            />
          </label>

          <label>
            W
            <input
              type="number"
              step="0.01"
              min={MIN_RECT_SIZE}
              value={selectedRect.width}
              onChange={(event) => updateNumber("width", event.target.value)}
            />
          </label>

          <label>
            H
            <input
              type="number"
              step="0.01"
              min={MIN_RECT_SIZE}
              value={selectedRect.height}
              onChange={(event) => updateNumber("height", event.target.value)}
            />
          </label>
        </>
      ) : (
        <span>도형을 선택하세요.</span>
      )}
    </div>
  );
}

export default StatusPanel;