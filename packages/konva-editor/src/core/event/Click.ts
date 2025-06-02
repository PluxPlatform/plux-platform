import { Stage } from "konva/lib/Stage";
import { LayersObj, OnClick } from "../type";
import { getComponentAttrs, getCurrentComponent } from "../../utils";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Transformer } from "konva/lib/shapes/Transformer";
import { Layer } from "konva/lib/Layer";
import {
  clearPipelineController,
  isCurrentPipeline,
  isPipLine,
  PipelineEditor,
} from "../../plugins/PipeLineDrawer";
import { Line } from "konva/lib/shapes/Line";

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

export const Click = (stage: Stage, layers: LayersObj, callBack?: OnClick) => {
  stage.on("click tap", (e) => {
    clearSelectStyle(stage);
    if (isPipLine(e.target as Line)) {
      PipelineEditor(e.target as Line, stage);
    }
    const target = getCurrentComponent(e.target);
    if (target) {
      createSelectStyle(target, layers["axisLayer"]);
      const attrs = getComponentAttrs(target);
      callBack &&
        callBack({
          data: attrs,
          e,
        });
    }
  });
};
