import Konva from "konva";
import { getStage, LAYERNAME } from "../..";
import { createUUID } from "../../../utils";

export { PipelineEditor } from "./PipelineEditor";

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

export class PipelineDrawer {
  private stage: Konva.Stage;
  private pipelineLayer: Konva.Layer;
  private pipe: Konva.Group | null = null;
  private line: Konva.Line | null = null;
  private arrow: Konva.Arrow | null = null;
  private startPoint: { x: number; y: number } | null = null;
  private originalStageDraggable: boolean = false;
  private config: PipelineConfig;
  private isDrawing: boolean = false;
  private onEndCallback?: Function;

  constructor(config: PipelineConfig = {}) {
    this.stage = getStage()!;
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

    // 获取或创建管道图层
    let pipelineLayer = this.stage.findOne(
      `.${LAYERNAME.PIPELINE}`
    ) as Konva.Layer;
    if (!pipelineLayer) {
      pipelineLayer = new Konva.Layer({
        name: LAYERNAME.PIPELINE,
      });
      this.stage.add(pipelineLayer);
    }
    this.pipelineLayer = pipelineLayer;
  }

  /**
   * 开始绘制管道
   * @param callback 完成绘制回调
   * @returns 当前实例，支持链式调用
   */
  startDrawing(callback?: Function): PipelineDrawer {
    if (this.isDrawing) return this;

    this.onEndCallback = callback;
    this.isDrawing = true;

    // 保存舞台拖拽状态并禁用
    this.originalStageDraggable = this.stage.draggable();
    this.stage.draggable(false);

    // 绑定事件
    this.stage.on("mousedown touchstart", this.handleMouseDown);
    this.stage.on("mousemove touchmove", this.handleMouseMove);
    this.stage.on("mouseup touchend", this.handleMouseUp);

    return this;
  }

  /**
   * 停止绘制管道
   * @returns 当前实例，支持链式调用
   */
  stopDrawing(): PipelineDrawer {
    if (!this.isDrawing) return this;

    // 解绑事件
    this.stage.off("mousedown touchstart", this.handleMouseDown);
    this.stage.off("mousemove touchmove", this.handleMouseMove);
    this.stage.off("mouseup touchend", this.handleMouseUp);

    // 恢复舞台拖拽状态
    this.stage.draggable(this.originalStageDraggable);

    this.isDrawing = false;
    this.pipe = null;
    this.line = null;
    this.arrow = null;
    this.startPoint = null;

    return this;
  }

  // 私有方法：处理鼠标按下事件
  private handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // 阻止事件冒泡
    e.cancelBubble = true;

    // 获取鼠标在舞台上的位置，考虑舞台的缩放和平移
    const pos = this.stage.getPointerPosition();
    if (!pos) return;

    // 转换为舞台坐标系中的位置
    const transform = this.stage.getAbsoluteTransform().copy().invert();
    const stagePos = transform.point(pos);

    this.startPoint = {
      x: stagePos.x,
      y: stagePos.y,
    };

    // 创建管道组
    this.pipe = new Konva.Group({
      id: this.config.id || createUUID(),
      name: "pipeline-group",
      draggable: false, // 设置为可拖动
    });

    // 创建管道主体线条
    this.line = new Konva.Line({
      points: [
        this.startPoint.x,
        this.startPoint.y,
        this.startPoint.x,
        this.startPoint.y,
      ],
      type: "pipeline",
      stroke: this.config.pipeColor,
      strokeWidth: this.config.pipeWidth,
      lineCap: this.config.lineCap as any,
      name: "pipeline-line",
      draggable: false,
      tension: 0.01,
    });

    this.pipe.add(this.line);

    // 创建箭头
    if (this.config.showArrow) {
      this.arrow = new Konva.Arrow({
        points: [
          this.startPoint.x,
          this.startPoint.y,
          this.startPoint.x,
          this.startPoint.y,
        ],
        pointerLength: this.config.arrowSize,
        pointerWidth: this.config.arrowSize! * 0.8,
        fill: this.config.arrowColor,
        stroke: this.config.arrowColor,
        strokeWidth: 2,
        visible: false,
        name: "pipeline-arrow",
      });
      this.pipe.add(this.arrow);
    }

    this.pipelineLayer.add(this.pipe);
    this.pipelineLayer.draw();
  };

  // 私有方法：处理鼠标移动事件
  private handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // 阻止事件冒泡
    e.cancelBubble = true;

    if (!this.pipe || !this.line || !this.startPoint) return;

    // 获取鼠标在舞台上的位置，考虑舞台的缩放和平移
    const pos = this.stage.getPointerPosition();
    if (!pos) return;

    // 转换为舞台坐标系中的位置
    const transform = this.stage.getAbsoluteTransform().copy().invert();
    const stagePos = transform.point(pos);

    const newPoints = [
      this.startPoint.x,
      this.startPoint.y,
      stagePos.x,
      stagePos.y,
    ];
    this.line.points(newPoints);

    // 更新箭头位置
    if (this.arrow && this.config.showArrow) {
      // 计算箭头位置（放在线条中间）
      const midX = (this.startPoint.x + stagePos.x) / 2;
      const midY = (this.startPoint.y + stagePos.y) / 2;

      // 计算方向
      const dx = stagePos.x - this.startPoint.x;
      const dy = stagePos.y - this.startPoint.y;
      const angle = Math.atan2(dy, dx);

      // 设置箭头点
      const arrowLength = this.config.arrowSize! * 2;
      const arrowX = midX - (Math.cos(angle) * arrowLength) / 2;
      const arrowY = midY - (Math.sin(angle) * arrowLength) / 2;
      const arrowEndX = midX + (Math.cos(angle) * arrowLength) / 2;
      const arrowEndY = midY + (Math.sin(angle) * arrowLength) / 2;

      this.arrow.points([arrowX, arrowY, arrowEndX, arrowEndY]);
      this.arrow.visible(true);
    }

    this.pipelineLayer.draw();
  };

  // 私有方法：处理鼠标抬起事件
  private handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // 阻止事件冒泡
    e.cancelBubble = true;

    if (!this.pipe || !this.line || !this.startPoint) return;

    // 获取鼠标在舞台上的位置，考虑舞台的缩放和平移
    const pos = this.stage.getPointerPosition();
    if (!pos) return;

    // 转换为舞台坐标系中的位置
    const transform = this.stage.getAbsoluteTransform().copy().invert();
    const stagePos = transform.point(pos);

    const endPoint = {
      x: stagePos.x,
      y: stagePos.y,
    };

    // 如果起点和终点太近，则删除管道
    const dx = endPoint.x - this.startPoint.x;
    const dy = endPoint.y - this.startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
      this.pipe.destroy();
      this.pipelineLayer.draw();
      this.stopDrawing();
      return;
    }

    // 保存最终管道
    const finalPoints = [
      this.startPoint.x,
      this.startPoint.y,
      endPoint.x,
      endPoint.y,
    ];
    this.line.points(finalPoints);

    // 如果启用流动动画
    if (this.config.flowAnimation) {
      this.setFlowAnimation(this.pipe.id(), true);
    }

    this.pipelineLayer.draw();

    const completedPipe = this.pipe;

    // 完成一次绘制后自动退出绘制状态
    this.stopDrawing();

    if (this.onEndCallback) this.onEndCallback(completedPipe);
  };

  /**
   * 设置管道流动动画
   * @param pipeId 管道ID
   * @param enabled 是否启用动画
   * @param speed 流动速度
   */
  setFlowAnimation(
    pipeId: string,
    enabled: boolean,
    speed?: number
  ): PipelineDrawer {
    const pipe = this.pipelineLayer.findOne(`#${pipeId}`) as Konva.Group;
    if (!pipe) return this;

    const line = pipe.findOne(".pipeline-line") as Konva.Line;
    if (!line) return this;

    // 停止现有动画
    const animId = pipe.getAttr("animationId");
    if (animId) {
      window.cancelAnimationFrame(animId);
      pipe.setAttr("animationId", null);
    }

    if (enabled) {
      const dashArray = [10, 5];
      line.dash(dashArray);

      let dashOffset = 0;
      const flowSpeed = speed || this.config.flowSpeed || 2;

      const anim = new Konva.Animation((frame) => {
        if (!frame) return;
        dashOffset -= flowSpeed;
        line.dashOffset(dashOffset);
      }, this.pipelineLayer);

      anim.start();
      pipe.setAttr("animationId", anim.id);
    } else {
      line.dash([]);
      this.pipelineLayer.draw();
    }

    return this;
  }

  /**
   * 获取所有管道
   * @returns 管道数组
   */
  getAllPipelines(): Konva.Group[] {
    return this.pipelineLayer.find(".pipeline-group") as Konva.Group[];
  }

  /**
   * 判断节点是否为管道
   * @param node 要检查的节点
   * @returns 是否为管道
   */
  static isPipeline(node: Konva.Node): boolean {
    return (
      node.hasName("pipeline-group") ||
      node.parent?.hasName("pipeline-group") ||
      node.hasName("pipeline-line") ||
      node.hasName("pipeline-arrow")
    );
  }

  /**
   * 获取管道组
   * @param node 节点
   * @returns 管道组
   */
  static getPipelineGroup(node: Konva.Node): Konva.Group | null {
    if (node.hasName("pipeline-group")) {
      return node as Konva.Group;
    } else if (node.parent?.hasName("pipeline-group")) {
      return node.parent as unknown as Konva.Group;
    }
    return null;
  }
}

export default PipelineDrawer;
