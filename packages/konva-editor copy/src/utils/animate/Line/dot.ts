import Konva from "konva";
import { createUUID } from "../../uuid";

// 原点动画
export const dotAnimate = (
  targetLine: Konva.Line,
  speed: number = 1,
  animLineColor: string = "#007bff", // 动画线颜色，默认为蓝色
  animLineWidthRatio: number = 0.6 // 动画线宽度相对于底线的比例
) => {
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

  // 创建小球
  const ball = new Konva.Circle({
    x: points[0],
    y: points[1],
    radius: (targetLine.strokeWidth() * animLineWidthRatio) / 2,
    fill: animLineColor,
  });
  layer.add(ball);
  layer.batchDraw();

  // 2. 创建动画
  let segmentIndex = 0;
  let progress = 0;

  function moveBall() {
    if (points.length < 4) return; // 安全检查

    const x1 = points[segmentIndex * 2];
    const y1 = points[segmentIndex * 2 + 1];
    const x2 = points[(segmentIndex * 2 + 2) % points.length];
    const y2 = points[(segmentIndex * 2 + 3) % points.length];

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    progress += speed;

    if (progress > length) {
      progress = 0;
      segmentIndex++;
      if (segmentIndex >= points.length / 2 - 1) {
        // 走完了，回到第一段
        segmentIndex = 0;
      }
      moveBall();
      return;
    }

    const ratio = progress / length;
    const currentX = x1 + dx * ratio;
    const currentY = y1 + dy * ratio;

    ball.position({ x: currentX, y: currentY });

    layer!.batchDraw();
    requestAnimationFrame(moveBall);
  }

  moveBall();
};
