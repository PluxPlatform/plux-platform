import Konva from "konva";
import { EditorTheme } from "../theme";
import { bindMoveEvent, DeleteEvent, DropEvent, SelectEvent } from "./events";
import { Axis } from "./components/Axis";
import { WheelEvent } from "./events/Wheel";
import { testAnimateLine } from "../utils/animate/animateLine.test";

export enum LAYERNAME {
  BG = "bgLayer",
  MAIN = "mainLayer",
  HELPER = "helperLayer",
  GRID = "gridLayer",
  // 坐标轴
  AXIS = "axisLayer",
  // 管道
  PIPELINE = "pipelineLayer",
}

interface KonvaEditorConfig {
  container: string;
  onSelect?: (node: Konva.Node | null) => void;
}

// 全局唯一的编辑器实例
let currentKonvaEditor: KonvaEditor | null = null;
let Stage: Konva.Stage | null = null;

// 获取舞台
export const getStage = () => {
  return Stage;
};
// 获取舞台序列化数据
export const getStageData = () => {
  if (!Stage) return null;

  // 遍历所有图片节点，确保 imageSrc 属性存在
  console.log("images", Stage.find("Image"));
  Stage.find("Image").forEach((imgNode: any) => {
    // 如果节点有 image 对象且没有 imageSrc，则尝试从 image.src 获取
    if (imgNode.image() && !imgNode.attrs.imageSrc) {
      imgNode.attrs.imageSrc = imgNode.image().src || "";
    }
    // 移除 customSrc（base64），只保留 imageSrc
    if (imgNode.attrs.customSrc) {
      delete imgNode.attrs.customSrc;
    }
  });

  return Stage.toJSON();
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

export function getKonvaEditor() {
  return currentKonvaEditor;
}

export class KonvaEditor {
  theme: EditorTheme = "dark";
  config!: KonvaEditorConfig;
  stage!: Konva.Stage;
  axis!: Axis;
  constructor(container: KonvaEditorConfig) {
    this.config = container;
  }
  init(type: "editor" | "preview", data?: any) {
    const { container } = this.config;
    // 获取容器元素
    const dom = document.getElementById(container.replace("#", ""));
    if (!dom) return;
    // 创建stage
    const width = dom.offsetWidth;
    const height = dom.offsetHeight;
    if (data) {
      this.stage = loadStageFromData(data, container);
    } else {
      this.stage = new Konva.Stage({
        container,
        width,
        height,
        draggable: true,
      });
    }

    Stage = this.stage;
    // 创建图层
    this.createLayer();
    if (type === "editor") {
      this.initEditor(dom);
    } else {
      this.initPreview();
    }

    // 渲染舞台
    this.stage.draw();
    currentKonvaEditor = this;
  }
  mainLayer: Konva.Layer | null = null;
  pipelineLayer: Konva.Layer | null = null;
  createLayer() {
    // 创建图层时先判断是否存在
    // 背景图层
    let bgLayer, mainLayer, helperLayer, gridLayer, axisLayer;
    if (!this.stage.findOne(`.${LAYERNAME.BG}`)) {
      bgLayer = new Konva.Layer({
        name: LAYERNAME.BG,
        draggable: false, // 背景图层不可拖拽
        listening: false, // 背景图层不监听事件
      });
      this.stage.add(bgLayer);
    }

    // 主图层
    if (!this.stage.findOne(`.${LAYERNAME.MAIN}`)) {
      mainLayer = new Konva.Layer({
        name: LAYERNAME.MAIN,
      });
      this.mainLayer = mainLayer;
      this.stage.add(mainLayer);
    } else {
      this.mainLayer = this.stage.findOne(`.${LAYERNAME.MAIN}`) as Konva.Layer;
    }

    // 辅助图层
    if (!this.stage.findOne(`.${LAYERNAME.HELPER}`)) {
      helperLayer = new Konva.Layer({
        name: LAYERNAME.HELPER,
      });
      this.stage.add(helperLayer);
    }
    // 网格背景图层
    if (!this.stage.findOne(`.${LAYERNAME.GRID}`)) {
      gridLayer = new Konva.Layer({
        name: LAYERNAME.GRID,
      });
      this.stage.add(gridLayer);
    }

    // 坐标轴图层
    if (!this.stage.findOne(`.${LAYERNAME.AXIS}`)) {
      axisLayer = new Konva.Layer({
        name: LAYERNAME.AXIS,
        listening: false,
      });
      this.stage.add(axisLayer);
    }

    // 管道
    if (!this.stage.findOne(`.${LAYERNAME.PIPELINE}`)) {
      this.pipelineLayer = new Konva.Layer({
        name: LAYERNAME.PIPELINE,
      });
      this.stage.add(this.pipelineLayer);
    } else {
      this.pipelineLayer = this.stage.findOne(
        `.${LAYERNAME.PIPELINE}`
      ) as Konva.Layer;
    }
    // 渲染图层
    bgLayer?.draw();
    mainLayer?.draw();
    // 添加图层到舞台
  }
  // 清空舞台
  clear() {
    this.init("editor");
  }
  // 测试管道动画
  testAnimateLine = () => {
    this.clear();
    this.createLayer();
    testAnimateLine(this.pipelineLayer!);
  };

  // 初始化编辑器
  initEditor(dom: HTMLElement) {
    DropEvent(dom, this.stage);
    SelectEvent(this.stage, this.config.onSelect);
    WheelEvent(this.stage);
    DeleteEvent(this.stage);
    bindMoveEvent(this.mainLayer!);
    // this.createAxis();
  }

  // 创建坐标轴
  createAxis() {
    this.axis = new Axis(this.stage, {
      width: this.stage.width(),
      height: this.stage.height(),
      gridSize: 50,
      strokeColor: this.theme === "dark" ? "#aaa" : "#666",
      showLabels: true,
    });
  }

  // 切换坐标轴显示状态
  toggleAxis() {
    if (this.axis) {
      this.axis.toggle();
    }
  }

  // 更新坐标轴
  updateAxis(config: any) {
    if (this.axis) {
      this.axis.update(config);
    }
  }
  // 根据保存的数据加载
  load(data: any) {
    this.stage.clear();
  }
  // 初始化预览器
  initPreview() {
    // 禁止所有元素的拖拽
    this.stage.draggable(false);
    this.mainLayer?.children?.forEach((node) => {
      node.draggable(false);
    });
  }
}
