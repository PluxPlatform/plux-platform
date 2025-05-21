import { Layer } from "konva/lib/Layer";
import { Stage } from "konva/lib/Stage";
import { KonvaEditorConfig, LayerName, LayersObj } from "./type";
import { Click, ZoomPanController, DropEvent } from "./event";
import Konva from "konva";

export class CanvasManager {
  stage!: Stage;
  layers!: LayersObj;
  domId!: string;
  constructor(opt: KonvaEditorConfig) {
    this.domId = opt.container.replace("#", "");
    const dom = document.getElementById(this.domId);
    if (!dom) return;
    // 创建stage
    const width = dom.offsetWidth;
    const height = dom.offsetHeight;
    this.stage = new Stage({
      container: opt.container,
      width,
      height,
    });

    // 初始化 layers 对象
    this.layers = {} as LayersObj;
  }

  init() {
    // 为每个 LayerName 创建对应的图层
    const layerNames = Object.values(LayerName);

    layerNames.forEach((layerName) => {
      // 创建新图层
      const layer = new Layer({
        name: layerName,
      });

      // 将图层添加到 stage
      this.stage.add(layer);

      // 保存图层引用
      this.layers[layerName] = layer;
    });

    // 调整舞台大小以适应容器
    this.resizeStage();

    // 添加窗口大小变化的监听器
    window.addEventListener("resize", this.resizeStage.bind(this));

    // 初始化zoomPanController
    new ZoomPanController({
      stage: this.stage,
    });
    // 触发画布点击事件
    Click(this.stage, this.layers);

    // 拖入画布
    DropEvent(this.stage, this.layers);
    setTimeout(() => {
      this.test();
    }, 1000);
  }

  test() {
    // 创建两个可以拖动的图片

    const rect = new Konva.Rect({
      width: 100,
      height: 100,
      x: 200,
      fill: "rgba(0,0,0,1)",
      draggable: true,
      listening: true, // 默认开启监听
    });
    // group.add(imageNode1, rect);
    // 将图片添加到图层中
    this.layers[LayerName.MAIN].add(rect);
    this.layers[LayerName.MAIN].draw();
    const image1 = new Image();
    image1.crossOrigin = "anonymous";
    image1.src =
      "http://39.107.113.96:9090/file/jpg/thumb_20250402195634drii0vqust.png";

    image1.onload = () => {
      // const imageNode1 = new Konva.Image({
      //   image: image1,
      //   width: 100,
      //   height: 100,
      //   draggable: false,
      //   listening: false, // 默认开启监听
      // });
      const rect = new Konva.Rect({
        width: 100,
        height: 100,
        x: 100,
        fill: "rgba(0,0,0,1)",
        draggable: true,
        listening: true, // 默认开启监听
      });
      // group.add(imageNode1, rect);
      // 将图片添加到图层中
      this.layers[LayerName.MAIN].add(rect);
      this.layers[LayerName.MAIN].draw();
    };
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
