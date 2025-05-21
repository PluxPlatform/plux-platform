import Konva from "konva";
import ShapeFactory from "../../shape";

// 用于存储拖动过程中的偏移量 Map<nodeId, Map<pipelineId, { dx: number; dy: number }>>
const dragOffsets = new Map<string, Map<string, { dx: number; dy: number }>>();

// 给图层绑定移动事件
export const bindMoveEvent = (layer: Konva.Layer) => {
  // --- 拖动开始：记录偏移量 ---
  layer.on("dragstart.updatePipelines", (e) => {
    const node = ShapeFactory.isCustomShape(e.target);
    if (!node) return;
    const pipelineNodes = ShapeFactory.getPipelineNodes(node);
    if (!pipelineNodes || pipelineNodes.length === 0) return;

    const nodeAbsPos = node.absolutePosition();
    const nodeOffsets = new Map<string, { dx: number; dy: number }>();

    pipelineNodes.forEach((itemLine) => {
      const { endNode: endNodeId, startNode: startNodeId } =
        ShapeFactory.getPipelineBindNodes(itemLine);
      const points = itemLine.points();
      const pipelineParent = itemLine.getParent();
      if (!pipelineParent) return;

      // 获取将管道相对坐标转为绝对坐标的变换
      const parentTransform = pipelineParent.getAbsoluteTransform();
      let endpointAbsPos: { x: number; y: number } | null = null;

      // 计算端点的绝对位置
      if (startNodeId === node.id()) {
        endpointAbsPos = parentTransform.point({ x: points[0], y: points[1] });
      } else if (endNodeId === node.id()) {
        endpointAbsPos = parentTransform.point({
          x: points[points.length - 2],
          y: points[points.length - 1],
        });
      }

      // 计算并存储偏移量 (端点绝对位置 - 节点绝对位置)
      if (endpointAbsPos) {
        const offset = {
          dx: endpointAbsPos.x - nodeAbsPos.x,
          dy: endpointAbsPos.y - nodeAbsPos.y,
        };
        nodeOffsets.set(itemLine.id(), offset); // 使用管道 ID 作为 key
      }
    });

    // 将当前节点的偏移量存储到全局 Map 中
    if (nodeOffsets.size > 0) {
      dragOffsets.set(node.id(), nodeOffsets);
    }
  });

  // --- 拖动过程：应用偏移量更新管道 ---
  layer.on("dragmove.updatePipelines", (e) => {
    const node = ShapeFactory.isCustomShape(e.target);
    if (!node) return;

    const nodeCurrentAbsPos = node.absolutePosition();
    // 获取当前拖动节点的偏移量 Map
    const offsets = dragOffsets.get(node.id());
    if (!offsets) return; // 如果没有记录偏移量，则不处理

    // 重新获取连接的管道（或从 dragstart 传递，但重新获取更安全）
    const pipelineNodes = ShapeFactory.getPipelineNodes(node);
    if (!pipelineNodes || pipelineNodes.length === 0) return;

    pipelineNodes.forEach((itemLine) => {
      // 获取该管道对应的偏移量
      const offset = offsets.get(itemLine.id());
      if (!offset) return; // 没有该管道的偏移量记录

      const pipelineParent = itemLine.getParent();
      if (!pipelineParent) return;

      // 计算端点的新绝对位置 = 当前节点绝对位置 + 偏移量
      const newEndpointAbsPos = {
        x: nodeCurrentAbsPos.x + offset.dx,
        y: nodeCurrentAbsPos.y + offset.dy,
      };

      // 将新的绝对位置转换回管道父容器的相对坐标
      const parentInverseTransform = pipelineParent
        .getAbsoluteTransform()
        .copy()
        .invert();
      const newEndpointRelativePos =
        parentInverseTransform.point(newEndpointAbsPos);

      const points = itemLine.points().slice();
      let pointsUpdated = false;
      const { endNode: endNodeId, startNode: startNodeId } =
        ShapeFactory.getPipelineBindNodes(itemLine); // 需要再次获取绑定信息

      // 更新对应的端点坐标
      if (startNodeId === node.id()) {
        points[0] = newEndpointRelativePos.x;
        points[1] = newEndpointRelativePos.y;
        pointsUpdated = true;
      } else if (endNodeId === node.id()) {
        points[points.length - 2] = newEndpointRelativePos.x;
        points[points.length - 1] = newEndpointRelativePos.y;
        pointsUpdated = true;
      }

      // 应用更新
      if (pointsUpdated) {
        itemLine.points(points);
      }
    });

    layer.batchDraw(); // 批量绘制
  });

  // --- 拖动结束：清除偏移量 ---
  layer.on("dragend.updatePipelines", (e) => {
    const node = ShapeFactory.isCustomShape(e.target);
    if (!node) return;
    // 从全局 Map 中删除当前节点的偏移量记录
    dragOffsets.delete(node.id());
  });
};

/**
 * 解绑移动相关事件
 * @param layer 图层
 */
export const unbindMoveEvent = (layer: Konva.Layer) => {
  layer.off("dragstart.updatePipelines");
  layer.off("dragmove.updatePipelines");
  layer.off("dragend.updatePipelines");
};
