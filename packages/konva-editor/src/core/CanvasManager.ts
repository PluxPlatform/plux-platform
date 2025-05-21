import { Layer } from "konva/lib/Layer";
import { Stage } from "konva/lib/Stage";
import { KonvaEditorConfig, LayerName, LayersObj } from "./type";
import { Click, ZoomPanController, DropEvent, DeleteEvent } from "./event";

let windowStage: Stage;

export const getStage = () => {
  return windowStage;
};
export class CanvasManager {
  stage!: Stage;
  layers: LayersObj = {} as LayersObj;
  domId!: string;
  opt!: KonvaEditorConfig;
  constructor(opt: KonvaEditorConfig) {
    this.domId = opt.container.replace("#", "");
    const dom = document.getElementById(this.domId);
    if (!dom) return;
    // 创建stage
    const width = dom.offsetWidth;
    const height = dom.offsetHeight;
    const stage = new Stage({
      container: opt.container,
      width,
      height,
    });
    this.stage = stage;
    windowStage = stage;
    this.initLayers();
  }
  initLayers() {
    this.layers = {} as LayersObj;
    const layerNames = Object.values(LayerName);
    for (const name of layerNames) {
      const layer = new Layer({
        name,
      });
      this.layers[name] = layer;
      this.stage.add(layer);
      layer.draw();
    }
  }

  test() {}

  init() {
    // 拖入画布
    DropEvent(this.stage, this.layers);

    // 调整舞台大小以适应容器
    this.resizeStage();

    // 添加窗口大小变化的监听器
    window.addEventListener("resize", this.resizeStage.bind(this));

    // 初始化zoomPanController
    new ZoomPanController({
      stage: this.stage,
    });

    this.stage.draw();

    // 触发画布点击事件
    Click(this.stage, this.layers);

    // 删除元素
    DeleteEvent(this.stage);
  }

  // 调整舞台大小的辅助方法
  private resizeStage() {
    const container = document.getElementById(this.domId);
    if (container instanceof HTMLElement) {
      // 获取容器的尺寸
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      // 更新舞台尺寸
      this.stage.width(width);
      this.stage.height(height);
    }
  }

  // 获取指定名称的图层
  getLayer(name: LayerName): Layer {
    return this.layers[name];
  }

  export() {
    return this.stage.toJSON();
  }
}
