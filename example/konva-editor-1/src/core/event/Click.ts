import { Stage } from "konva/lib/Stage";
import { LayersObj, OnClick } from "../type";
import { getComponentAttrs, getCurrentComponent } from "../../utils";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Transformer } from "konva/lib/shapes/Transformer";
import { Layer } from "konva/lib/Layer";
import { editPath, isPipeLine } from "../../plugins/PipeLineDrawer";
import Konva from "konva";

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
    console.log("target", e.target);
    // @ts-ignore
    // 递归向上查找到第一个isComponent为true的节点
    // 点击的是组件
    const target = getCurrentComponent(e.target);
    if (target) {
      createSelectStyle(target, layers["axisLayer"]);
      if (isPipeLine(target)) {
        editPath(stage, target as Konva.Path);
      }
      const attrs = getComponentAttrs(target);
      callBack &&
        callBack({
          data: attrs,
          e,
        });
    }
  });
};
