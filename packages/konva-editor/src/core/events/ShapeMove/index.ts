import Konva from "konva";
import ShapeFactory from "../../shape";

// 给图层邦定移动事件
export const bindMoveEvent = (layer: Konva.Layer) => {
  layer.on("dragmove", (e) => {
    const node = ShapeFactory.isCustomShape(e.target);
    const pipelineNodes = ShapeFactory.getPipelineNodes(e.target);
    if (!node || pipelineNodes.length <= 0) return;
    // 当前元素的位置
    const { x, y } = e.target.getClientRect();
    // 获取当前元素绑定的管道
    for (const itemLine of pipelineNodes) {
      const { endNode, startNode } =
        ShapeFactory.getPipelineBindNodes(itemLine);
      const startNodeId = startNode?.id();
      const endNodeId = endNode?.id();

      if (startNodeId === node.getAttr("id")) {
      } else if (endNodeId === node.getAttr("id")) {
      } else {
        // 其他情况不处理
      }
    }
  });
};
