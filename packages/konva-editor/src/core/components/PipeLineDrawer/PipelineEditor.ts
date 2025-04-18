import Konva from "konva";
import { getStage } from "../../index";

// 管道编辑器
export const PipelineEditor = (pipeLine: Konva.Line) => {
  const stage = getStage()!;
  const parent = pipeLine.parent!;
  const pipeLineLayer = pipeLine.getLayer()!;
  // 先移除已有锚点
  const anchors = stage.find(".anchor");
  if (parent) {
    anchors.forEach((anchor) => anchor.destroy());
  } else if (pipeLineLayer) {
    anchors.forEach((anchor) => anchor.destroy());
  }

  const points = pipeLine.points();
  if (points.length < 4) return;

  // 创建起点锚点
  const startAnchor = new Konva.Circle({
    x: points[0],
    y: points[1],
    radius: 8,
    fill: "#fff",
    stroke: "#666",
    strokeWidth: 2,
    draggable: true,
    name: "anchor",
  });

  // 创建终点锚点
  const endAnchor = new Konva.Circle({
    x: points[2],
    y: points[3],
    radius: 8,
    fill: "#fff",
    stroke: "#666",
    strokeWidth: 2,
    draggable: true,
    name: "anchor",
  });

  // 拖动锚点时更新线
  startAnchor.on("dragmove", (e) => {
    const anchor = e.target as Konva.Circle;
    const newPoints = [
      anchor.x(),
      anchor.y(),
      pipeLine.points()[2],
      pipeLine.points()[3],
    ];
    pipeLine.points(newPoints);
    stage.batchDraw();
  });

  endAnchor.on("dragmove", (e) => {
    const anchor = e.target as Konva.Circle;
    const newPoints = [
      pipeLine.points()[0],
      pipeLine.points()[1],
      anchor.x(),
      anchor.y(),
    ];
    pipeLine.points(newPoints);
    stage.batchDraw();
  });

  // 鼠标样式
  [startAnchor, endAnchor].forEach((anchor) => {
    anchor.on("mouseover", () => {
      document.body.style.cursor = "pointer";
    });
    anchor.on("mouseout", () => {
      document.body.style.cursor = "default";
    });
  });

  // 添加锚点到 group 或 layer
  if (parent && parent.className === "Group") {
    parent.add(startAnchor);
    parent.add(endAnchor);
    parent.getLayer()?.draw();
  } else if (pipeLine.getLayer()) {
    pipeLineLayer.add(startAnchor);
    pipeLineLayer.add(endAnchor);
    pipeLineLayer.draw();
  }
};
