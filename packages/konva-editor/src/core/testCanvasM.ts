import { Layer } from "konva/lib/Layer";
import { Stage } from "konva/lib/Stage";
import { KonvaEditorConfig, LayerName, LayersObj } from "./type";
import Konva from "konva";
import { Rect } from "konva/lib/shapes/Rect";

export class CanvasManager {
  layer!: Layer;
  domId!: string;
  constructor(opt: KonvaEditorConfig) {
    this.domId = opt.container.replace("#", "");
    const dom = document.getElementById(this.domId);
    if (!dom) return;
    // 创建stage
    const width = dom.offsetWidth;
    const height = dom.offsetHeight;
    const stage = new Stage({
      container: opt.container,
      width: 800,
      height: 800,
    });
    const layer = new Layer({
      name: "main",
    });
    const rect = new Rect({
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      fill: "reds",
    });
    const img = new Image();
    img.src =
      "http://39.107.113.96:9090/file/jpg/thumb_20250402195634drii0vqust.png";
    img.onload = () => {
      const Img = new Konva.Image({
        image: img,
      });
      layer.add(Img);
    };
    layer.add(rect);
    stage.add(layer);
    stage.on("click", (e) => {
      console.log(e.target);
    });
  }

  initLayers() {
    const layer = new Layer({
      name: "main",
    });
    this.layer = layer;
  }

  test() {}

  init() {}

  export() {}
}
