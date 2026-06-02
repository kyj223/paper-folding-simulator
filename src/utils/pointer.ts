export const getSvgPoint = (
  event: React.PointerEvent,
  svg: SVGSVGElement | null
) => {
  if (!svg) {
    return { x: 0, y: 0 };
  }

  const rect = svg.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};