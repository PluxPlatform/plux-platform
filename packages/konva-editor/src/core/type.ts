import { Layer } from "konva/lib/Layer";
import { KonvaEventObject, Node, NodeConfig } from "konva/lib/Node";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Stage } from "konva/lib/Stage";

// 所有图层
export enum LayerName {
  BG = "bgLayer",
  MAIN = "mainLayer",
  HELPER = "helperLayer",
  GRID = "gridLayer",
  // 坐标轴
  AXIS = "axisLayer",
  // 管道
  PIPELINE = "pipelineLayer",
}

export type LayersObj = Record<LayerName, Layer>;

//
export interface ZoomPanOptions {
  stage: Stage;
  minScale?: number;
  maxScale?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
}

// stage 的hover事件
export type OnHover = (opt: {
  node: Node<NodeConfig> | null;
  isHover: boolean;
  e: KonvaEventObject<MouseEvent>;
}) => void;
// stage 的click事件
export type OnClick = (opt: {
  node: Node<NodeConfig> | null;
  e: KonvaEventObject<MouseEvent>;
}) => void;
export interface KonvaEditorConfig {
  container: string;
  onClick?: OnClick;
  onHover?: OnHover;
}
