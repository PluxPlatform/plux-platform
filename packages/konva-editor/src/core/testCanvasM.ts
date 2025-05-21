import { Layer } from "konva/lib/Layer";
import { Stage } from "konva/lib/Stage";
import { KonvaEditorConfig, LayerName, LayersObj } from "./type";
import Konva from "konva";
import { Rect } from "konva/lib/shapes/Rect";
import { Group } from "konva/lib/Group";
import { Line } from "konva/lib/shapes/Line";

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
    layer.add(Gr);
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
