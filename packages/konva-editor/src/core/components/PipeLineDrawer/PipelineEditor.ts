import Konva from "konva";
import { getStage, LAYERNAME } from "../../index";

// 管道编辑器入口
export const PipelineEditor = (pipeLine: Konva.Line) => {
  const stage = getStage();
  if (!stage) return;
  clearPipelineController(); // 先清除旧的控制器
  createPipelineController(pipeLine); // 创建新的控制器
  onPipelineClick(pipeLine); // 监听点击事件以添加点
};

/**
 * 在指定位置为特定线段创建一个控制点（锚点）
 * @param pipeLine 线段
 * @param pointIndex 点在 points 数组中的索引 (x 坐标的索引)
 * @returns 控制点 Konva.Circle
 */
export function createPipelineControllerPoint(
  pipeLine: Konva.Line,
  pointIndex: number
): Konva.Circle {
  const points = pipeLine.points();
  const anchor = new Konva.Circle({
    x: points[pointIndex],
    y: points[pointIndex + 1],
    radius: 6, // 稍微调小一点
    fill: "#fff",
    stroke: "#007bff", // 换个醒目的颜色
    strokeWidth: 2,
    draggable: true,
    name: "pipelineAnchor", // 统一命名
    _pointIndex: pointIndex, // 存储点索引，方便拖拽时更新
  });

  // 拖动锚点时更新对应点
  anchor.on("dragmove", (e) => {
    const targetAnchor = e.target as Konva.Circle;
    const idx = targetAnchor.getAttr("_pointIndex");
    const newPoints = pipeLine.points().slice();
    newPoints[idx] = targetAnchor.x();
    newPoints[idx + 1] = targetAnchor.y();
    pipeLine.points(newPoints);
    // 实时重绘 Layer
    pipeLine.getLayer()?.batchDraw();
  });

  // 鼠标样式
  anchor.on("mouseover", () => {
    document.body.style.cursor = "pointer";
    anchor.radius(8); // 悬停时放大
    pipeLine.getLayer()?.batchDraw();
  });
  anchor.on("mouseout", () => {
    document.body.style.cursor = "default";
    anchor.radius(6); // 恢复原大小
    pipeLine.getLayer()?.batchDraw();
  });

  // 双击删除锚点 (不允许删除起点和终点)
  anchor.on("dblclick", (e) => {
    const targetAnchor = e.target as Konva.Circle;
    const idx = targetAnchor.getAttr("_pointIndex");
    const currentPoints = pipeLine.points();

    // 检查是否为起点或终点
    if (idx === 0 || idx === currentPoints.length - 2) {
      console.log("Cannot delete start or end point.");
      return; // 不允许删除起点或终点
    }

    // 移除点 (x 和 y)
    const newPoints = currentPoints.slice();
    newPoints.splice(idx, 2); // 从 idx 开始移除 2 个元素 (x, y)

    // 更新管道的点
    pipeLine.points(newPoints);

    // 销毁当前锚点自身，避免干扰后续更新
    targetAnchor.destroy();

    // 更新控制器 (清除旧的，创建新的)
    clearPipelineController();
    createPipelineController(pipeLine);

    // 重绘 Layer
    pipeLine.getLayer()?.batchDraw();
  });

  return anchor;
}

/**
 * 当线被触发点击时触发的事件, 用于在线段上添加新点
 * @param pipeLine 管道
 */
export function onPipelineClick(pipeLine: Konva.Line) {
  // 先移除旧的监听器，防止重复添加
  pipeLine.off("click.addPoint");

  pipeLine.on("click.addPoint", (e) => {
    // 只响应左键点击，并且可能需要结合 Shift 或其他键，避免误操作
    if (e.evt.button !== 0) return;

    const stage = getStage();
    if (!stage) return;
    const mousePos = stage.getPointerPosition();
    if (!mousePos) return;

    const points = pipeLine.points();
    let minDist = Infinity;
    let insertIdx = -1; // 插入位置（数组索引）

    // 找到距离点击位置最近的线段
    for (let i = 0; i < points.length - 2; i += 2) {
      const x1 = points[i],
        y1 = points[i + 1];
      const x2 = points[i + 2],
        y2 = points[i + 3];
      const dist = pointToSegmentDistance(
        mousePos.x,
        mousePos.y,
        x1,
        y1,
        x2,
        y2
      );

      if (dist < minDist) {
        minDist = dist;
        // 记录应该在线段终点(i+2)之前插入
        insertIdx = i + 2;
      }
    }

    // 距离足够近才插入（例如小于 10 像素）
    if (insertIdx !== -1 && minDist < 10) {
      const newPoints = points.slice();
      newPoints.splice(insertIdx, 0, mousePos.x, mousePos.y);
      pipeLine.points(newPoints);

      // 更新控制器
      clearPipelineController();
      createPipelineController(pipeLine);
      pipeLine.getLayer()?.batchDraw();
    }
  });
}

/**
 * 根据线段给线段创建控制器（包含所有锚点）
 * @param pipeLine 线段
 */
export function createPipelineController(pipeLine: Konva.Line) {
  const stage = getStage();
  const layer = pipeLine.getLayer();
  if (!stage || !layer) return;

  const controlGroup = new Konva.Group({
    name: "pipelineController", // 控制器组的名称
  });

  const points = pipeLine.points();
  for (let i = 0; i < points.length; i += 2) {
    const anchor = createPipelineControllerPoint(pipeLine, i);
    controlGroup.add(anchor);
  }

  layer.add(controlGroup);
  layer.batchDraw(); // 添加后绘制
}

/**
 * 清除指定管道的控制器
 * @param pipeLine 管道线
 */
export function clearPipelineController() {
  const stage = getStage();
  if (!stage) return;

  // 获取名为 LAYERNAME.PIPELINE 的图层
  const pipelineLayer = stage.findOne(`.${LAYERNAME.PIPELINE}`) as Konva.Layer;
  if (!pipelineLayer) {
    console.warn(`Layer with name "${LAYERNAME.PIPELINE}" not found.`);
    return;
  }

  // 查找并销毁该图层中所有名为 "pipelineController" 的组
  const oldControllers = pipelineLayer.find(".pipelineController");
  if (oldControllers.length > 0) {
    oldControllers.forEach((group) => group.destroy());
    pipelineLayer.batchDraw(); // 清除后绘制
  }
}

// --- 辅助函数 ---
function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projectionX = x1 + t * (x2 - x1);
  const projectionY = y1 + t * (y2 - y1);
  return Math.sqrt(
    (px - projectionX) * (px - projectionX) +
      (py - projectionY) * (py - projectionY)
  );
}
