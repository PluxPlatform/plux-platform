import Konva from "konva";
import { NodeConfig, Node } from "konva/lib/Node";
import { HoverAnimation } from "../../shape/shape";
import { shapeEventAnimate } from "./animate";

export const ShapeHover = (node: Node<NodeConfig>) => {
  const hoverEvent = node.attrs.hoverEvent as keyof HoverAnimation;
  node.on("mouseenter", (e) => {
    shapeEventAnimate(node, hoverEvent, true);
  });
  node.on("mouseleave", () => {
    shapeEventAnimate(node, hoverEvent, false);
  });
};
