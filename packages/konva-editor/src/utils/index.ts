import Konva from "konva";

export * from "./dropData";
export * from "./uuid";
export * from "./stageTofit";
export * from "./animate";

export const computedXY = (
  canvas: Konva.Stage,
  layerX: number,
  layerY: number
) => {
  const zoom = canvas.scaleX();
  if (canvas.attrs.x || canvas.attrs.y) {
    layerX = layerX - canvas.attrs.x;
    layerY = layerY - canvas.attrs.y;
  } else if (canvas._lastPos) {
    layerX = layerX - canvas._lastPos.x;
    layerY = layerY - canvas._lastPos.y;
  }
  return {
    x: layerX / zoom,
    y: layerY / zoom,
  };
};
