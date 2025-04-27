import Konva from "konva";

export const stageTofit = (
  stage: Konva.Stage,
  padding: number = 10,
  duration = 0.3
) => {
  const contentRect = stage.getClientRect({ skipTransform: true });

  // --- 添加检查 ---
  // 如果内容宽度或高度无效（小于或等于0），则无法进行有效缩放
  if (contentRect.width <= 0 || contentRect.height <= 0) {
    console.warn(
      "Stage content has invalid dimensions (<= 0). Resetting view."
    );
    // 选择一种处理方式：
    // 方式一：重置视图到初始状态 (scale=1, position=padding)
    const targetScale = 1;
    const targetX = padding;
    const targetY = padding;

    // 方式二：不执行任何操作 (如果希望如此，注释掉下面的 Tween 代码并取消注释 return)
    // return;

    // 执行重置动画 (如果选择方式一)
    const tween = new Konva.Tween({
      node: stage,
      duration: duration,
      scaleX: targetScale,
      scaleY: targetScale,
      x: targetX,
      y: targetY,
      easing: Konva.Easings.EaseInOut,
      onFinish: () => {
        stage.batchDraw();
      },
    });
    tween.play();
    return; // 处理完毕，退出函数
  }
  // --- 检查结束 ---

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
