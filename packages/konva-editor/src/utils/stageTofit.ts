import Konva from "konva";
import { LAYERNAME } from "../core";

export const stageTofit = (
  stage: Konva.Stage,
  padding: number = 20,
  duration = 0.3
) => {
  const contentRect = stage.getClientRect({ skipTransform: true });

  const containerWidth = stage.width();
  const containerHeight = stage.height();

  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;

  const scaleX = availableWidth / contentRect.width;
  const scaleY = availableHeight / contentRect.height;
  const scale = Math.min(scaleX, scaleY);

  const targetX =
    -contentRect.x * scale +
    padding +
    (availableWidth - contentRect.width * scale) / 2;
  const targetY =
    -contentRect.y * scale +
    padding +
    (availableHeight - contentRect.height * scale) / 2;

  const startScale = stage.scaleX(); // 当前缩放
  const startX = stage.x(); // 当前偏移
  const startY = stage.y();

  const deltaScale = scale - startScale;
  const deltaX = targetX - startX;
  const deltaY = targetY - startY;

  const tween = new Konva.Tween({
    node: stage,
    duration: duration,
    scaleX: scale,
    scaleY: scale,
    x: targetX,
    y: targetY,
    easing: Konva.Easings.EaseInOut,
    onFinish: () => {
      stage.batchDraw();
    },
  });

  tween.play();
};
