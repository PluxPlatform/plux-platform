import Konva from "konva";
import { computedXY } from "../../../utils";
import { getDropData } from "../../../utils/dropData";
import { LayersObj } from "../../type";
import { createShape } from "../../../shapes/createShape/index";

export const DropEvent = (stage: Konva.Stage, layers: LayersObj) => {
  const container = stage.container();

  // 阻止默认行为以允许 drop
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  container.addEventListener("drop", async (e) => {
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
  });
};
