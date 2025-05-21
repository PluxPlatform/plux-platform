import { Stage } from "konva/lib/Stage";
import { LayersObj } from "../type";
import { getComponentAttrs, getCurrentComponent } from "../../utils";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Transformer } from "konva/lib/shapes/Transformer";
import { Layer } from "konva/lib/Layer";

export const getSelector = (stage: Stage) => {
  return stage.find("Transformer") as Transformer[];
};

// 创建选中图形
const createSelectStyle = (shape: Shape<ShapeConfig>, layer: Layer) => {
  const tr = new Transformer();
  layer.add(tr);
  tr.attachTo(shape);
};

const clearSelectStyle = (stage: Stage) => {
  const tr = stage.find("Transformer");
  tr.forEach((item) => {
    item.destroy();
  });
};

export const Click = (stage: Stage, layers: LayersObj) => {
  stage.on("click tap", (e) => {
    clearSelectStyle(stage);
    const target = getCurrentComponent(e.target);
    if (target) {
      createSelectStyle(target, layers["axisLayer"]);
      const attrs = getComponentAttrs(target);
    }
  });
};
