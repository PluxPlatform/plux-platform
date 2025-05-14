import Konva from "konva";
import { HoverAnimation } from "../../shape/shape";
import { LAYERNAME } from "../..";

export function centerScale(node: Konva.Node, scale: number) {
  // 获取当前的绝对位置
  const absPos = node.getAbsolutePosition();

  // 设置 offset 为自身中心
  const width = node.width();
  const height = node.height();
  
  // 获取元素的offset
  const offset = node.offset();
  if (!offset.x) {
    node.offsetX(width / 2);
    node.offsetY(height / 2);
    node.x(absPos.x + width / 2);
    node.y(absPos.y + height / 2);
  }

  // 使用动画效果进行缩放
  new Konva.Tween({
    node,
    duration: 0.3,
    scaleX: scale,
    scaleY: scale,
  }).play();
}

// 描边动画
export function strokeAnimate(node: Konva.Node) {
  const helperLayer = node
    .getStage()!
    .findOne(`.${LAYERNAME.HELPER}`)! as Konva.Layer;

  // 确保辅助层可见
  helperLayer.visible(true);

  const { x, y, width, height } = node.getClientRect();
  const rect = new Konva.Rect({
    x: x - 1,
    y: y - 1,
    width: width + 2,
    height: height + 2,
    stroke: "blue",
    strokeWidth: 2,
    opacity: 0.5,
    name: "strokeRect",
    listening: false,
  });
  helperLayer.add(rect);
  helperLayer.batchDraw();
}

// 旋转
export function rotateAnimate(node: Konva.Node, rotation: number) {
  // 获取当前的绝对位置
  const absPos = node.getAbsolutePosition();

  // 设置 offset 为自身中心
  const width = node.width();
  const height = node.height();
  // 获取元素的offset
  const offset = node.offset();
  if (!offset.x) {
    node.offsetX(width / 2);
    node.offsetY(height / 2);
    node.x(absPos.x + width / 2);
    node.y(absPos.y + height / 2);
  }

  // 恢复绝对位置，防止 offset 改变位置

  // 使用动画效果进行旋转
  new Konva.Tween({
    node,
    duration: 0.3,
    rotation,
  }).play();
}

export const shapeEventAnomate = (
  node: Konva.Node,
  hoverEvent: keyof HoverAnimation,
  start: boolean
) => {
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
    const helperLayer = node
      .getStage()!
      .findOne(`.${LAYERNAME.HELPER}`)! as Konva.Layer;
    const rect = helperLayer.findOne(".strokeRect") as Konva.Rect;
    if (rect) {
      rect.destroy();
      helperLayer.batchDraw();
    }
  }

  if (hoverEvent === "rotation" && start) {
    rotateAnimate(node, 360);
  }

  if (hoverEvent === "rotation" && !start) {
    rotateAnimate(node, 0);
  }
};
