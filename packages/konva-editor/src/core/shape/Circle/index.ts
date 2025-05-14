import Konva from "konva";
import { BaseShape } from "../defautShape";
import { ShapeConfig } from "../shape";
import { getStage } from "../..";

// 圆形图形
class CircleShape extends BaseShape<"circle"> {
  render(layer: Konva.Layer): void {
    const { x, y, fill, stroke, radius, strokeWidth } =
      this.config.defaultProps;
    // 创建矩形图形
    const Circle = new Konva.Circle({
      id: this.config.id,
      type: "circle",
      x,
      y,
      fill,
      stroke,
      radius,
      strokeWidth,
      draggable: true,
    });
    // 添加到图层
    layer.add(Circle);
  }
  static update(config: Partial<ShapeConfig<"circle">>) {
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
    return [
      [
        {
          name: "radius",
          label: "半径",
          type: "number",
        },
        ...this.deleteProperty(["width", "height"]),
      ],
      [...this.advancedFormConfig],
    ];
  }
}

export default CircleShape;
