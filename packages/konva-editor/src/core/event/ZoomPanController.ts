import Konva from "konva";
import { ZoomPanOptions } from "../type";

export class ZoomPanController {
  private stage: Konva.Stage;
  private minScale: number;
  private maxScale: number;
  private enableZoom: boolean;

  constructor(options: ZoomPanOptions) {
    this.stage = options.stage;
    this.minScale = options.minScale ?? 0.2;
    this.maxScale = options.maxScale ?? 5;
    this.enableZoom = options.enableZoom ?? true;

    this.init();
  }

  private init() {
    const container = this.stage.container();
    this.stage.draggable(true);
    // 鼠标滚轮缩放
    container.addEventListener("wheel", this.onWheel, { passive: false });
  }

  private onWheel = (e: WheelEvent) => {
    if (!this.enableZoom) return;
    e.preventDefault();
    const oldScale = this.stage.scaleX();
    const pointer = this.stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.01;
    const direction = e.deltaY > 0 ? 1 : -1;
    const newScale = this.clampScale(
      oldScale * (direction > 0 ? 1 / scaleBy : scaleBy)
    );

    // 缩放中心保持鼠标指针位置不变
    const mousePointTo = {
      x: (pointer.x - this.stage.x()) / oldScale,
      y: (pointer.y - this.stage.y()) / oldScale,
    };

    this.stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    this.stage.position(newPos);
    this.stage.batchDraw();
  };

  private clampScale(scale: number) {
    return Math.min(this.maxScale, Math.max(this.minScale, scale));
  }

  destroy() {
    const container = this.stage.container();
    container.removeEventListener("wheel", this.onWheel);
  }

  setZoomEnabled(enabled: boolean) {
    this.enableZoom = enabled;
  }

  setPanEnabled(enabled: boolean) {}

  reset() {
    this.stage.scale({ x: 1, y: 1 });
    this.stage.position({ x: 0, y: 0 });
    this.stage.batchDraw();
  }
}
