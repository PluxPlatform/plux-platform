import Konva from "konva";
import { createUUID } from "../../uuid";

// 默认虚线动画
export const defaultLineAnimate = (
  targetLine: Konva.Line,
  speed: number = 1,
  animLineColor: string = "#007bff", // 动画线颜色，默认为蓝色
  animLineWidthRatio: number = 0.6 // 动画线宽度相对于底线的比例
): Konva.Group | null => {
  // 返回类型可能为 null
  const layer = targetLine.getLayer();
  if (!layer) {
    console.error("目标线不在图层上，无法创建动画.");
    return null; // 如果目标线不在图层上，无法创建动画
  }

  const group = new Konva.Group({
    id: createUUID(), // 给组一个唯一ID
    listening: false, // 整个组通常不需要监听事件
  });
  const points = targetLine.points();
  const baseStrokeWidth = targetLine.strokeWidth();
  const baseStroke = targetLine.stroke();
  const tension = targetLine.tension();

  // 1. 创建底线 (遮挡原线)
  const baseLine = new Konva.Line({
    points: points,
    stroke: baseStroke, // 与原线颜色相同
    strokeWidth: baseStrokeWidth, // 与原线宽度相同
    tension: tension,
    listening: false, // 底线不监听事件
    globalCompositeOperation: "source-over", // 确保能覆盖
  });
  group.add(baseLine); // 先添加底线

  // 2. 创建动画线
  const animLineWidth = Math.max(1, baseStrokeWidth * animLineWidthRatio); // 计算动画线宽度，最小为1
  const animLine = new Konva.Line({
    points: points,
    stroke: animLineColor, // 使用指定的动画线颜色
    strokeWidth: animLineWidth, // 使用计算出的较小宽度
    tension: tension,
    dash: [10, 10], // 虚线样式
    lineCap: "round", // 设置线段端点为圆角
    listening: false, // 动画线不监听事件
    opacity: 0.9, // 可以稍微透明
    _animationType: "dash", // 标记类型
  });
  group.add(animLine); // 在底线之上添加动画线

  // 3. 创建动画
  let dashOffset = 0;
  const anim = new Konva.Animation((frame) => {
    if (!frame) return;
    dashOffset -= speed;
    if (dashOffset < -1000) {
      dashOffset = 0;
    }
    animLine.dashOffset(dashOffset);
  }, layer); // 动画需要绑定到图层

  // 将动画实例存储在组上，方便管理
  group.attrs._animationInstance = anim;
  group.attrs._targetLineId = targetLine.getAttr("id"); // 记录目标线的ID

  // 启动动画
  anim.start();

  layer.add(group); // 直接添加到图层

  // 隐藏原始线 (可选，因为底线已经覆盖了)
  // targetLine.visible(false);

  return group;
};
