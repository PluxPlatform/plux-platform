import { Layer } from "konva/lib/Layer";
import { Path } from "konva/lib/shapes/Path";
import { Stage } from "konva/lib/Stage";
import { createUUID } from "../../utils";
import { Vector2d } from "konva/lib/types";
import { Group } from "konva/lib/Group";
import { Shape, ShapeConfig } from "konva/lib/Shape";

export const drawPath = (stage: Stage, layer: Layer, end: () => void) => {
  let isDrawing = false;
  let startPoint: Vector2d | null;
  let path: Path | null;

  stage.on("mousedown", (e) => {
    if (isDrawing) {
      end();
      return;
    }
    isDrawing = true;
    // 获取相对于 layer 的 pointer 坐标
    const pos = layer.getRelativePointerPosition()!;
    startPoint = pos;
    path = new Path({
      x: 0,
      y: 0,
      id: createUUID(),
      stroke: "blue",
      strokeWidth: 4,
      data: `M${pos.x},${pos.y} L${pos.x},${pos.y}`,
    });
    layer.add(path);
    stage.draw();
  });

  stage.on("mousemove", (e) => {
    if (!isDrawing || !path) {
      end();
      return;
    }
    // 获取相对于 layer 的 pointer 坐标
    const pos = layer.getRelativePointerPosition();
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
