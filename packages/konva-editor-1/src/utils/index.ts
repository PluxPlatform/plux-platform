import { KonvaEventObject } from "konva/lib/Node";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Stage } from "konva/lib/Stage";

export * from "./shape";

// 获取鼠标在画布上的位置
export function getTransformedPointer(stage: Stage): { x: number; y: number } {
  const pointer = stage.getPointerPosition();
  if (!pointer) return { x: 0, y: 0 };
  const transform = stage.getAbsoluteTransform().copy();
  transform.invert();
  return transform.point(pointer);
}

// 拖入画布时根据x，y计算出在画布上的位置
export const computedXY = (stage: Stage, layerX: number, layerY: number) => {
  const zoom = stage.scaleX();
  if (stage.attrs.x || stage.attrs.y) {
    layerX = layerX - stage.attrs.x;
    layerY = layerY - stage.attrs.y;
  } else if (stage._lastPos) {
    layerX = layerX - stage._lastPos.x;
    layerY = layerY - stage._lastPos.y;
  }
  return {
    x: layerX / zoom,
    y: layerY / zoom,
  };
};

// 生成唯一id
export const createUUID = () => {
  return "xxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
