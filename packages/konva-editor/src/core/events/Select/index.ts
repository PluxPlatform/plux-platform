import Konva from "konva";
import { LAYERNAME } from "../..";
import { PipelineEditor } from "../../components/PipeLineDrawer";

export const getSelector = (stage: Konva.Stage) => {
  return stage.find("Transformer") as Konva.Transformer[];
};

export const getSelectNode = (target: Konva.Shape) => {
  if (!target.attrs.type) return target.parent;
  return target;
};

export const SelectEvent = (
  stage: Konva.Stage,
  onSelect?: (node: Konva.Shape | null) => void
) => {
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
    if (e.target !== stage && e.target.attrs.type !== "pipeline") {
      const ntr = new Konva.Transformer();
      layer.add(ntr);
      let node = e.target as any;
      // 如果target 的父节点是group 则需要将target 改为父节点
      if (e.target.parent?.nodeType === "Group") {
        node = e.target.parent;
      }
      ntr.attachTo(node);
      onSelect &&
        onSelect(getSelectNode(e.target as Konva.Shape) as Konva.Shape);
      layer.draw();
    }
    // 点击管道
    if (e.target.attrs.type === "pipeline") {
      PipelineEditor(e.target as Konva.Line);
    }

    // 点击空白处
    if (e.target === stage) {
      onSelect && onSelect(null);
    }
  });
};
