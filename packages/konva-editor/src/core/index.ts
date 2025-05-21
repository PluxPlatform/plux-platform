import Konva from "konva";
// import { CanvasManager } from "./testCanvasM";
import { CanvasManager } from "./CanvasManager";
import { KonvaEditorConfig } from "./type";

export class Editor {
  canvasManager!: CanvasManager;
  constructor(opt: KonvaEditorConfig) {
    this.canvasManager = new CanvasManager(opt);
    this.init();
  }
  init() {
    this.canvasManager.init();
  }
  registerShape(name: string, shapeFactory: any) {}
  on(event: string, callback: Function) {}

  exportJSON() {
    return this.canvasManager.export();
  }
}
