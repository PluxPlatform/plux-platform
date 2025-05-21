import Konva from "konva";
import { HoverAnimation } from "../../shape/shape";

export function centerScale(node: Konva.Node, scale: number) {
  const box = node.getClientRect({ relativeTo: node.getLayer() }); // 或 Stage，根据你的实际层级
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  const oldScale = node.scaleX(); // 假设等比缩放
  const scaleFactor = scale / oldScale;

  // 当前 position
  const pos = node.position();

  // 偏移位置补偿
  const newX = (pos.x - centerX) * scaleFactor + centerX;
  const newY = (pos.y - centerY) * scaleFactor + centerY;

  new Konva.Tween({
    node,
    scaleX: scale,
    scaleY: scale,
    x: newX,
    y: newY,
    duration: 0.3,
  }).play();
}

// 描边动画
export function strokeAnimate(node: Konva.Node) {
  node.setAttrs({
    stroke: "blue",
    strokeWidth: 2,
  });
}

// 旋转
export function rotateAnimate(node: Konva.Node, rotation: number) {
  // 1. 保存当前视觉状态
  const absolutePosition = node.getAbsolutePosition();
  const currentRotation = node.rotation();

  // 2. 设置旋转中心为元素中心
  const width = node.width();
  const height = node.height();
  node.offsetX(width / 2);
  node.offsetY(height / 2);

  // 3. 计算并设置新位置，保持视觉位置不变
  const newPos = node
    .getParent()
    .getAbsoluteTransform()
    .point({
      x: absolutePosition.x - (width * node.scaleX()) / 2,
      y: absolutePosition.y - (height * node.scaleY()) / 2,
    });

  node.position(newPos);

  // 4. 执行旋转动画
  new Konva.Tween({
    node,
    duration: 0.3,
    rotation,
    easing: Konva.Easings.EaseInOut,
  }).play();
}
let currentNodeAttrs: any;
export const shapeEventAnimate = (
  node: Konva.Node,
  hoverEvent: keyof HoverAnimation,
  start: boolean
) => {
  if (start) {
    currentNodeAttrs = JSON.parse(JSON.stringify(node.getAttrs()));
  }
  if (hoverEvent === "zoom" && start) {
    centerScale(node, 1.1);
  }
  if (hoverEvent === "zoom" && !start) {
    centerScale(node, 1);
  }

  if (hoverEvent === "stroke" && start) {
    strokeAnimate(node);
  }
  if (hoverEvent === "stroke" && !start) {
    node.setAttrs({
      stroke: currentNodeAttrs.stroke,
      strokeWidth: currentNodeAttrs.strokeWidth,
    });
  }

  if (hoverEvent === "rotation" && start) {
    rotateAnimate(node, 360);
  }

  if (hoverEvent === "rotation" && !start) {
    rotateAnimate(node, 0);
  }
};
