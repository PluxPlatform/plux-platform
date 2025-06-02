import { Group } from "konva/lib/Group";
import { Layer } from "konva/lib/Layer";
import { Circle } from "konva/lib/shapes/Circle";
import { Line } from "konva/lib/shapes/Line";
import { Stage } from "konva/lib/Stage";
import { getStage } from "../../core/CanvasManager";
import { LayerName } from "../../core/type";

// 是否是当前编辑的线
let currentEditorLine = "";
export const isCurrentPipeline = (pipeline: Line) => {
  console.log("id-c", currentEditorLine);
  // const id = pipeline.id();
  // const layer = pipeline.getLayer()!;

  // const isCurrent = id === currentEditorLineId;
  // if (isCurrent) {
  //   clearPipelineController(layer);
  //   createPipelineController(pipeline, layer);
  // }
  // return isCurrent;
};

export const PipelineEditor = (line: Line, stage: Stage) => {
  const layer = line.getLayer()!;
  if (!layer) return;

  clearPipelineController(layer);
  createPipelineController(line, layer);
  onPipelineClick(line, layer);
};

export function createPipelineControllerPoint(
  pipeLine: Line,
  pointIndex: number,
  layer: Layer
): Circle {
  const points = pipeLine.points();
  const anchor = new Circle({
    x: points[pointIndex],
    y: points[pointIndex + 1],
    radius: 6, // 稍微调小一点
    fill: "#fff",
    stroke: "#007bff", // 换个醒目的颜色
    strokeWidth: 2,
    pipLineId: pipeLine.id(), // 关联的管道线 ID
    draggable: true,
    type: "pipControllerItem",
    name: "pipelineAnchor", // 统一命名
    _pointIndex: pointIndex, // 存储点索引，方便拖拽时更新
    isComponent: true,
  });

  // 拖动锚点时更新对应点
  anchor.on("dragmove", (e) => {
    const targetAnchor = e.target as Circle;
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
    const targetAnchor = e.target as Circle;
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
    clearPipelineController(layer);
    createPipelineController(pipeLine, layer);

    // 重绘 Layer
    pipeLine.getLayer()?.batchDraw();
  });

  return anchor;
}

export function createPipelineController(pipeLine: Line, layer: Layer) {
  if (!layer) return;
  const controlGroup = new Group({
    name: "pipelineController", // 控制器组的名称
    pipeLineId: pipeLine.id(), // 关联的管道线 ID
  });

  const points = pipeLine.points();
  for (let i = 0; i < points.length; i += 2) {
    const anchor = createPipelineControllerPoint(pipeLine, i, layer);
    controlGroup.add(anchor);
  }

  layer.add(controlGroup);
  layer.batchDraw(); // 添加后绘制
}

export function onPipelineClick(pipeLine: Line, layer: Layer) {
  // 先移除旧的监听器，防止重复添加
  pipeLine?.off("click.addPoint");

  pipeLine!.on("click.addPoint", (e) => {
    // 只响应左键点击，并且可能需要结合 Shift 或其他键，避免误操作
    if (e.evt.button !== 0) return;
    console.log("e", e.evt);
    const stage = getStage();
    if (!stage) return;
    const mousePos = stage.getPointerPosition();
    if (!mousePos) return;

    const points = pipeLine!.points();
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
      pipeLine!.points(newPoints);
      // 更新控制器
      clearPipelineController(layer);
      createPipelineController(pipeLine!, layer);
      pipeLine!.getLayer()?.batchDraw();
    }
  });
}

export function clearPipelineController(pipelineLayer: Layer) {
  if (!pipelineLayer) {
    console.warn(`Layer with name "${LayerName.PIPELINE}" not found.`);
    return;
  }
  // 清除旧的控制器
  // 查找并销毁该图层中所有名为 "pipelineController" 的组
  const oldControllers = pipelineLayer.find(".pipelineController");
  const oldCont = oldControllers[0] as Group;
  if (oldCont) {
    const pipeLineId = oldCont.getAttr("pipeLineId");
    const pipeLine = pipelineLayer.findOne(`#${pipeLineId}`) as Line;
    if (pipeLine) {
      pipeLine.off("click.addPoint"); // 移除旧的点击事件监听器
    }
  }

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

// 更新线段点的配置
export function updatePipelinePointsConfig(config: any) {
  const { qPoint, id } = config;
  console.log("qPoint", id);
}

export function getPiplineAttrs(node: Circle) {
  return {
    qPoint: node.attrs.qPoint || false,
  };
}
// 获取线段点的配置
export function getPipelinePointsConfig() {
  return [
    [
      {
        name: "qPoint",
        label: "桥点",
        type: "switch",
      },
    ],
  ];
}
