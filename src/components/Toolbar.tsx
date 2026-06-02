type ToolbarProps = {
  onAddRectangle: () => void;
  onReset: () => void;
  onBuildSolid: () => void;
};

function Toolbar({ onAddRectangle, onReset, onBuildSolid }: ToolbarProps) {
  return (
    <div className="top-toolbar">
      <strong>AI 종이접기 시뮬레이터</strong>

      <button onClick={onAddRectangle}>사각형 추가</button>
      <button onClick={onReset}>초기화</button>
      <button onClick={onBuildSolid}>입체도형 만들기</button>
    </div>
  );
}

export default Toolbar;