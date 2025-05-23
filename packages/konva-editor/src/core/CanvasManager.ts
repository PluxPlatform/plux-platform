import { Layer } from "konva/lib/Layer";
import { Stage } from "konva/lib/Stage";
import { KonvaEditorConfig, LayerName, LayersObj } from "./type";
import {
  Click,
  ZoomPanController,
  DropEvent,
  DeleteEvent,
  bindMoveEvent,
} from "./event";
import { DoubleClick } from "./event/DoubleClick";
import { PipelineDrawer } from "../plugins/PipeLineDrawer";
import { Line } from "konva/lib/shapes/Line";
import { Group } from "konva/lib/Group";
import Konva from "konva";

let windowStage: Stage;

export const getStage = () => {
  return windowStage;
};

function loadStageFromData(data: any, container: string) {
  const stage = Konva.Node.create(data, container);
  const dom = document.getElementById(container.replace("#", ""));
  if (!dom) return;
  // 获取dom元素的宽高
  const height = dom.offsetHeight;
  const width = dom.offsetWidth;
  stage.setAttrs({
    width,
    height,
  });
  // const width = dom.offsetWidth;
  stage.find("Image").forEach((imgNode: any) => {
    const imageSrc = imgNode.attrs.imageSrc;
    if (imageSrc) {
      const imageObj = new window.Image();
      imageObj.crossOrigin = "Anonymous"; // 支持跨域图片
      imageObj.onload = function () {
        imgNode.image(imageObj);
        stage.draw();
      };
      imageObj.src = imageSrc;
    }
  });

  return stage;
}

export class CanvasManager {
  stage!: Stage;
  layers: LayersObj = {} as LayersObj;
  domId!: string;
  PipelineDrawer!: PipelineDrawer;
  opt!: KonvaEditorConfig;
  constructor(opt: KonvaEditorConfig) {
    this.domId = opt.container.replace("#", "");
    const dom = document.getElementById(this.domId);
    if (!dom) return;
    // 创建stage
    const width = dom.offsetWidth;
    const height = dom.offsetHeight;
    if (opt.data) {
      this.stage = loadStageFromData(opt.data, opt.container);
    } else {
      const stage = new Stage({
        container: opt.container,
        width,
        height,
      });
      this.stage = stage;
    }
    windowStage = this.stage;
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
  drawPipLine() {
    // 解决line 无法点击问题
    this.PipelineDrawer.startDrawing(this.layers.pipelineLayer, (e) => {
      const group = new Group({
        ...e.attrs,
        draggable: false,
      });
      const line = e.getChildren()[0] as Line;
      const nLine = new Line({
        ...line.attrs,
        draggable: false,
      });
      e.destroy();
      group.add(nLine);
      this.layers.pipelineLayer.add(group);
    });
  }
  test() {
    const Gr = new Group({
      listening: true,
      draggable: false,
    });
    const line = new Line({
      points: [0, 0, 100, 100],
      fill: "red",
      stroke: "blue",
      strokeWidth: 8,
      listening: true,
      draggable: false,
    });
    Gr.add(line);
    this.layers.pipelineLayer.add(Gr);
  }

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

    // 元素拖动
    bindMoveEvent(this.layers.mainLayer);
    // 双击
    DoubleClick(this.stage);

    this.PipelineDrawer = new PipelineDrawer(
      {
        pipeColor: "#3498db",
        pipeWidth: 10,
        showArrow: false,
        arrowColor: "#e74c3c",
        flowAnimation: false,
        flowSpeed: 3,
      },
      this.stage
    );
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
