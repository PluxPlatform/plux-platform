import Konva from "konva";
import { createUUID, getCurrentComponent } from "../../utils";
import { Stage } from "konva/lib/Stage";
import { Group } from "konva/lib/Group";
import { Path } from "konva/lib/shapes/Path";

export interface PipelineConfig {
  id?: string;
  pipeColor?: string;
  pipeWidth?: number;
  lineCap?: string;
  showArrow?: boolean;
  arrowColor?: string;
  arrowSize?: number;
  flowAnimation?: boolean;
  flowSpeed?: number;
}

export const isPipLine = (node: Konva.Node) => {
  return node.getAttr("type") === "pipeline";
};

export class PipelineDrawer {
  private stage: Konva.Stage;
  private pipelineLayer!: Konva.Layer;
  private pipe: Konva.Group | null = null;
  private path: Konva.Path | null = null;
  private startPoint: { x: number; y: number } | null = null;
  private originalStageDraggable: boolean = false;
  private config: PipelineConfig;
  private isDrawing: boolean = false;
  private onEndCallback?: Function;
  private startNode!: Konva.Node | null;
  private endNode!: Konva.Node | null;

  constructor(config: PipelineConfig = {}, stage: Stage) {
    this.stage = stage;
    this.config = {
      pipeColor: "#3498db",
      pipeWidth: 8,
      lineCap: "round",
      showArrow: true,
      arrowColor: "#e74c3c",
      arrowSize: 10,
      flowAnimation: false,
      flowSpeed: 2,
      ...config,
    };
  }

  startDrawing(
    pipelineLayer: Konva.Layer,
    callback?: (e: Group) => void
  ): PipelineDrawer {
    if (this.isDrawing) return this;
    this.pipelineLayer = pipelineLayer;
    this.onEndCallback = callback;
    this.isDrawing = true;

    this.originalStageDraggable = this.stage.draggable();
    this.stage.draggable(false);

    this.stage.on("mousedown touchstart", this.handleMouseDown);
    this.stage.on("mousemove touchmove", this.handleMouseMove);
    this.stage.on("mouseup touchend", this.handleMouseUp);
    return this;
  }

  stopDrawing(): PipelineDrawer {
    if (!this.isDrawing) return this;
    this.stage.off("mousedown touchstart", this.handleMouseDown);
    this.stage.off("mousemove touchmove", this.handleMouseMove);
    this.stage.off("mouseup touchend", this.handleMouseUp);
    this.stage.draggable(this.originalStageDraggable);

    this.isDrawing = false;
    this.pipe = null;
    this.path = null;
    this.startPoint = null;

    return this;
  }

  private handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    this.startNode = getCurrentComponent(e.target) as Konva.Node;
    if (!this.startNode) return;
    this.startNode.setAttr("draggable", false);

    const pos = this.stage.getPointerPosition();
    if (!pos) return;
    const transform = this.stage.getAbsoluteTransform().copy().invert();
    const stagePos = transform.point(pos);

    this.startPoint = {
      x: stagePos.x,
      y: stagePos.y,
    };

    this.pipe = new Konva.Group({
      id: this.config.id || createUUID(),
      name: "pipeline-group",
      draggable: true,
      listening: true,
    });

    this.path = new Konva.Path({
      data: `M ${this.startPoint.x} ${this.startPoint.y} L ${this.startPoint.x} ${this.startPoint.y}`,
      stroke: this.config.pipeColor,
      strokeWidth: this.config.pipeWidth,
      name: "pipeline-line",
      draggable: false,
      listening: true,
      id: createUUID(),
      type: "pipeline",
    });

    this.pipe.add(this.path);
    this.pipelineLayer.add(this.pipe);
    this.pipelineLayer.draw();
  };

  private handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (!this.pipe || !this.path || !this.startPoint) return;

    const pos = this.stage.getPointerPosition();
    if (!pos) return;

    const transform = this.stage.getAbsoluteTransform().copy().invert();
    const stagePos = transform.point(pos);

    const newPathData = `M ${this.startPoint.x} ${this.startPoint.y} L ${stagePos.x} ${stagePos.y}`;
    this.path.data(newPathData);
  };

  private handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (!this.pipe || !this.path || !this.startPoint) return;

    this.endNode = getCurrentComponent(e.target) as Konva.Node;
    this.startNode!.setAttr("draggable", true);

    const pos = this.stage.getPointerPosition();
    if (!pos) return;
    const transform = this.stage.getAbsoluteTransform().copy().invert();
    const stagePos = transform.point(pos);

    const endPoint = {
      x: stagePos.x,
      y: stagePos.y,
    };

    const dx = endPoint.x - this.startPoint.x;
    const dy = endPoint.y - this.startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10 || !this.endNode) {
      this.pipe.destroy();
      this.stopDrawing();
      return;
    }

    const finalPath = `M ${this.startPoint.x} ${this.startPoint.y} L ${endPoint.x} ${endPoint.y}`;
    this.path.data(finalPath);
    this.path.draggable(true);

    const completedPipe = this.pipe;
    this.bindPipelineToNode();
    if (this.onEndCallback) this.onEndCallback(completedPipe);
    this.endNode = null;
    this.startNode = null;
    this.stopDrawing();
  };

  getPipelineIds(node: Konva.Node) {
    return (node.getAttr("pipelineIds") || []) as string[];
  }

  setNodePipeline(node: Konva.Node, path: Konva.Path) {
    const pipelineIds = this.getPipelineIds(node);
    pipelineIds.push(path.getAttr("id"));
    node.setAttr("pipelineIds", pipelineIds);
  }

  setPipelineNodes(
    path: Konva.Path,
    startNode: Konva.Node,
    endNode: Konva.Node
  ) {
    path.setAttr("startNodeId", startNode.getAttr("id"));
    path.setAttr("endNodeId", endNode.getAttr("id"));
  }

  bindPipelineToNode = () => {
    if (!this.path || !this.startNode || !this.endNode) return;
    this.setPipelineNodes(this.path, this.startNode, this.endNode);
    this.setNodePipeline(this.startNode, this.path);
    this.setNodePipeline(this.endNode, this.path);
  };

  static isPipeline(node: Konva.Node): boolean {
    return (
      node.hasName("pipeline-group") ||
      node.parent?.hasName("pipeline-group") ||
      node.hasName("pipeline-line")
    );
  }

  static getPipelineGroup(node: Konva.Node): Konva.Group | null {
    if (node.hasName("pipeline-group")) return node as Konva.Group;
    if (node.parent?.hasName("pipeline-group"))
      return node.parent as unknown as Konva.Group;
    return null;
  }
}
