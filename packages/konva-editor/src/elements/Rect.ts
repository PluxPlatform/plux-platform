import Konva from "konva";
import { omit } from "lodash";
import Node from "../node";
import type Group from "../group";
import type { NodeType, NodeConfig } from "../types";

export class Rect extends Node {
  className: NodeType = "Rect";
  name = "矩形";
  imageGroup: Konva.Rect;

  highlight() {}

  constructor(config: NodeConfig) {
    super(config);
    this.minWidth = 1;
    this.minHeight = 1;
    const {
      x = 0,
      y = 0,
      width = 100,
      height = 100,
      stroke = "#d8d8d8",
      strokeWidth = 1,
      fill = "#d8d8d8",
      cornerRadius = 0,
    } = config.attrs;
    this.group = new Konva.Group({
      ...config.attrs,
      x,
      y,
      width,
      height,
    });
    (config.layer as Group).add(this);
    this.init();
    this.editing();
    this.imageGroup = new Konva.Rect({
      name: "rect",
      x: 0,
      y: 0,
      width,
      height,
      stroke,
      strokeWidth,
      fill,
      cornerRadius,
    });
    this.group.add(this.imageGroup);
  }

  setTransformer() {
    this.editor.tr.transformer.enabledAnchors([
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "middle-left",
      "middle-right",
      "top-center",
      "bottom-center",
    ]);
    this.editor.tr.transformer.rotateEnabled(true);
  }

  getCornerRadius() {
    return this.imageGroup.cornerRadius() as number;
  }

  setCornerRadius(cornerRadius: number, groupId?: string) {
    const oldValue = this.getCornerRadius();
    const { nodeId } = this;
    this.imageGroup.cornerRadius(cornerRadius);
    this.dr.set(oldValue, cornerRadius, groupId).then((step) => {
      this.editor.history.add({
        title: "修改矩形圆角",
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setCornerRadius(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setCornerRadius(step.value);
        },
      });
    });
  }

  getAttrs() {
    return omit(this.imageGroup.getAttrs(), ["x", "y"]);
  }
}

export default Rect;
