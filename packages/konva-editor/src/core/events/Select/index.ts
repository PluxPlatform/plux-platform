import Konva from "konva";
import { LAYERNAME, OnSelect } from "../..";
import { PipelineEditor } from "../../components/PipeLineDrawer";
import { clearPipelineController } from "../../components/PipeLineDrawer/PipelineEditor";
import ShapeFactory from "../../shape";

export const getSelector = (stage: Konva.Stage) => {
  return stage.find("Transformer") as Konva.Transformer[];
};

export const getSelectNode = (target: Konva.Shape) => {
  if (!target.attrs.type) return target.parent;
  return target;
};

export const SelectEvent = (stage: Konva.Stage, onSelect?: OnSelect) => {
  const layer = stage
    .getLayers()
    .find((l) => l.attrs.name === LAYERNAME.MAIN) as Konva.Layer;
  stage.on("click tap", (e) => {
    let tr = getSelector(stage);
    if (tr && tr.length > 0) {
      tr.forEach((t) => {
        t.destroy();
      });
    }

    // 点击节点
    if (e.target.getType() !== "Stage" && e.target.attrs.type !== "pipeline") {
      const ntr = new Konva.Transformer();
      layer.add(ntr);
      let node = e.target as any;
      // 如果target 的父节点是group 则需要将target 改为父节点
      if (e.target.parent?.nodeType === "Group") {
        node = e.target.parent;
      }
      // 绑定t
      ntr.attachTo(node);
      const params = {
        target: getSelectNode(node as Konva.Shape) as any,
        attrs: ShapeFactory.getNodeAttrs(node as Konva.Shape),
      };
      onSelect && onSelect(params);
      layer.draw();
    }
    // 点击管道
    clearPipelineController();
    if (e.target.attrs.type === "pipeline") {
      setTimeout(() => {
        PipelineEditor(e.target as Konva.Line);
      }, 100);
    }

    // 点击空白处
    if (e.target === stage) {
      onSelect && onSelect({ target: null, attrs: null });
    }
  });
};
