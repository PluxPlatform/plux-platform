import Konva from "konva";
import { NodeConfig, Node } from "konva/lib/Node";
import { HoverAnimation } from "../../shape/shape";
import { shapeEventAnomate } from "./animate";

export const ShapeHover = (node: Node<NodeConfig>) => {
  const { x, y, width, height } = node.getClientRect();
  const hoverEvent = node.attrs.hoverEvent as keyof HoverAnimation;
  const attrs = node.attrs;
  node.on("mouseenter", (e) => {
    shapeEventAnomate(node, hoverEvent, true);
  });
  node.on("mouseleave", () => {
    shapeEventAnomate(node, hoverEvent, false);
  });
};
