import { Path } from "konva/lib/shapes/Path";
import { Stage } from "konva/lib/Stage";
import { createUUID } from "../../utils";
import { Vector2d } from "konva/lib/types";
import { LayersObj } from "../../core/type";

export enum PipeLineNameSpace {
  pathName = "pipeline",
  anchorName = "anchor",
  anchorGroup = "anchorGroup",
}

export const drawPath = (stage: Stage, layers: LayersObj, end: () => void) => {
  let isDrawing = false;
  let startPoint: Vector2d | null;
  let path: Path | null;

  stage.on("mousedown", (e) => {
    if (isDrawing) {
      return;
    }
    isDrawing = true;
    // 获取相对于 layer 的 pointer 坐标
    const pos = layers.pipelineLayer.getRelativePointerPosition()!;
    startPoint = pos;
    path = new Path({
      x: 0,
      y: 0,
      id: createUUID(),
      stroke: "blue",
      strokeWidth: 4,
      data: `M${pos.x},${pos.y} L${pos.x},${pos.y}`,
      isComponent: true,
      name: PipeLineNameSpace.pathName,
    });
    layers.pipelineLayer.add(path);
    stage.draw();
  });

  stage.on("mousemove", (e) => {
    if (!isDrawing || !path) {
      return;
    }
    // 获取相对于 layer 的 pointer 坐标
    const pos = layers.pipelineLayer.getRelativePointerPosition();
    const data = `M${startPoint?.x},${startPoint?.y} L${pos?.x},${pos?.y}`;
    path.data(data);
    stage.draw();
  });

  stage.on("mouseup", (e) => {
    end();
    stage.off("mousedown");
    stage.off("mouseup");
    stage.off("mousemove");
    if (!isDrawing) return;
    isDrawing = false;
    path = null;
    startPoint = null;
  });
};
