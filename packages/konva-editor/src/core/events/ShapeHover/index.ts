import { NodeConfig, Node } from "konva/lib/Node";
import { HoverAnimation } from "../../shape/shape";
import { shapeEventAnimate } from "./animate";
import { OnHover } from "../..";
import { getSelectNode } from "../Select";

let currentNode: Node<NodeConfig> | null = null;
export const ShapeHover = (
  node: Node<NodeConfig>,
  callBack: OnHover | undefined
) => {
  const hoverEvent = node.attrs.hoverEvent as keyof HoverAnimation;
  node.on("mouseenter", (e) => {
    currentNode = getSelectNode(e.target as any);
    callBack &&
      callBack({
        node: currentNode,
        e,
        isHover: true,
      });
    shapeEventAnimate(node, hoverEvent, true);
    document.body.style.cursor = "pointer";
  });
  node.on("mouseleave", (e) => {
    callBack &&
      callBack({
        node: currentNode,
        e,
        isHover: false,
      });
    shapeEventAnimate(node, hoverEvent, false);
    document.body.style.cursor = "default";
    currentNode = null;
  });
};
