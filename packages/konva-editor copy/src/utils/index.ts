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

export function toRgba(color: string, alpha = 1): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 1, 1);

  // 设置任意颜色
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);

  // 读取像素颜色（rgba）
  const data = ctx.getImageData(0, 0, 1, 1).data;
  const r = data[0];
  const g = data[1];
  const b = data[2];

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
