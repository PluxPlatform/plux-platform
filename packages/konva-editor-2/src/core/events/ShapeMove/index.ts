import Konva from "konva";

// 用于存储拖动过程中的偏移量 Map<nodeId, Map<pipelineId, { dx: number; dy: number }>>
const dragOffsets = new Map<string, Map<string, { dx: number; dy: number }>>();

// 给图层绑定移动事件
export const bindMoveEvent = (layer: Konva.Layer) => {};

/**
 * 解绑移动相关事件
 * @param layer 图层
 */
export const unbindMoveEvent = (layer: Konva.Layer) => {
  layer.off("dragstart.updatePipelines");
  layer.off("dragmove.updatePipelines");
  layer.off("dragend.updatePipelines");
};
