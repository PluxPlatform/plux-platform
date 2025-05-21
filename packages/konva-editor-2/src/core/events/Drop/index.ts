import Konva from "konva";
import { LAYERNAME } from "../..";
import { computedXY, getDropData } from "../../../utils";
import { createShape } from "../../../shapes/createShape";

export const DropEvent = (dom: HTMLElement, stage: Konva.Stage) => {
  const layer = stage
    .getLayers()
    .find((item) => item.attrs.name === LAYERNAME.MAIN) as Konva.Layer;
  dom.ondragenter = function (e) {
    e.preventDefault();
  };

  dom.ondragover = function (e) {
    e.preventDefault();
  };

  dom.ondragleave = function (e) {
    e.preventDefault();
  };
  dom.ondrop = (e) => {
    e.preventDefault();
    // 获取鼠标在页面上的坐标
    const x = e.offsetX;
    const y = e.offsetY;

    // 转换为 stage 上的坐标（如果有缩放/偏移需做变换）
    const pointerPosition = computedXY(stage, x, y);

    // 这里可以根据需要获取拖拽的数据
    const data = getDropData(e);

    data.attrs = {
      ...data.attrs,
      x: pointerPosition.x,
      y: pointerPosition.y,
      draggable: true,
    };
    createShape(data, stage);
  };
};
