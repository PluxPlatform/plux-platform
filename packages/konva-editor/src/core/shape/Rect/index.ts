import Konva from "konva";
import { BaseShape } from "../defautShape";
import { ShapeSetting } from "../shape";
import { getStage } from "../..";

// 矩形图形
class RectShape extends BaseShape<"rect"> {
  render(layer: Konva.Layer): void {
    const { x, y, width, height, fill, stroke, strokeWidth } =
      this.config.defaultProps;
    // 创建矩形图形
    const rect = new Konva.Rect({
      type: "rect",
      id: this.config.id,
      x,
      y,
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      draggable: true,
    });
    // 添加到图层
    layer.add(rect);
  }
  static update(config: ShapeSetting<"rect">): void {
    const { id } = config;
    const stage = getStage();
    const node = stage?.findOne(`#${id}`) as Konva.Rect;
    config &&
      node.setAttrs({
        ...config,
      });
    node?.draw();
  }
  static getFormConfig() {
    return [this.defaultFormConfig, [...this.advancedFormConfig]];
  }
}

export default RectShape;
