import Konva from "konva";
import Node from "../node";
import type Group from "../group";
import type { NodeType, NodeConfig } from "../types";

export class Circle extends Node {
  className: NodeType = "Circle";
  name = "圆形";
  imageGroup: Konva.Circle;

  highlight() {}

  constructor(config: NodeConfig) {
    super(config);
    this.minWidth = 1;
    this.minHeight = 1;
    const {
      x = 0,
      y = 0,
      stroke = "#d8d8d8",
      strokeWidth = 1,
      fill = "#d8d8d8",
      radius = 50,
      width = 100,
      height = 100,
    } = config.attrs;
    this.group = new Konva.Group({
      ...config.attrs,
      x,
      y,
    });
    (config.layer as Group).add(this);
    this.init();
    this.editing();
    this.imageGroup = new Konva.Circle({
      name: "circle",
      x: 0,
      y: 0,
      width,
      height,
      radius,
      stroke,
      strokeWidth,
      fill,
    });
    this.group.add(this.imageGroup);
  }

  getRadius() {
    return this.imageGroup.radius();
  }

  setRadius(radius: number, groupId?: string) {
    const oldValue = this.getRadius();
    const { nodeId } = this;
    this.imageGroup.radius(radius);
    this.editor.tr.update();
    this.dr.set(oldValue, radius, groupId).then((step) => {
      this.editor.history.add({
        title: "修改圆形半径",
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Circle;
          node?.setRadius(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Circle;
          node?.setRadius(step.value);
        },
      });
    });
  }

  getAttrs() {
    return this.imageGroup.getAttrs();
  }
}

export default Circle;
