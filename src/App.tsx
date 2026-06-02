import { useState } from "react";
import "./App.css";
import DesignCanvas from "./components/DesignCanvas";
import ThreeViewport from "./components/ThreeViewport";
import Toolbar from "./components/Toolbar";
import type { DragState, RectItem } from "./types/geometry";
import { detectRectConnections } from "./utils/connections";
import { validateCubeNet } from "./utils/validator";
import type { SolidInfo } from "./types/solid";
import { analyzeSolidFromRects } from "./utils/solidAnalyzer";

function App() {
  const [rects, setRects] = useState<RectItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [solidInfo, setSolidInfo] = useState<SolidInfo | null>(null);

  const addRectangle = () => {
    const nextId = Date.now();

    setRects((prev) => [
      ...prev,
      {
        id: nextId,
        type: "rectangle",
        x: 120 + prev.length * 24,
        y: 120 + prev.length * 24,
        width: 120,
        height: 120,
      },
    ]);

    setSelectedId(nextId);
  };

  const resetAll = () => {
    setRects([]);
    setSelectedId(null);
    setDragState(null);
    setSolidInfo(null);
  };

  const updateSelectedRect = (patch: Partial<RectItem>) => {
    if (selectedId === null) return;

    setRects((prev) =>
      prev.map((rect) =>
        rect.id === selectedId
          ? {
              ...rect,
              ...patch,
            }
          : rect
      )
    );
  };

  const connections = detectRectConnections(rects);

  const buildSolid = () => {
    const result = validateCubeNet(rects, connections);

    alert(result.message);

    if (!result.valid) {
      setSolidInfo(null);
      return;
    }

    const analyzedSolid = analyzeSolidFromRects(rects);

    setSolidInfo(analyzedSolid);
  };

  return (
    <div className="app">
      <Toolbar
        onAddRectangle={addRectangle}
        onReset={resetAll}
        onBuildSolid={buildSolid}
      />

      <div className="main-layout">
        <DesignCanvas
          rects={rects}
          selectedId={selectedId}
          dragState={dragState}
          connections={connections}
          onSelect={setSelectedId}
          onChangeRects={setRects}
          onStartDrag={setDragState}
          onStopDrag={() => setDragState(null)}
          onUpdateSelectedRect={updateSelectedRect}
        />

        <ThreeViewport solidInfo={solidInfo} />
      </div>
    </div>
  );
}

export default App;