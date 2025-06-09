import Konva from "konva";
import { BaseShape } from "../defautShape";
import { ShapeConfig } from "../shape";

// 多边形图形
class PolygonShape extends BaseShape<"polygon"> {
  render(layer: Konva.Layer): void {
    const {
      x,
      y,
      fill,
      stroke,
      strokeWidth,
      sides = 3,
      radius = 50,
    } = this.config.defaultProps;
    // 创建多边形图形
    const polygon = new Konva.RegularPolygon({
      id: this.config.id,
      type: "polygon",
      x,
      y,
      sides,
      radius,
      fill,
      stroke,
      strokeWidth,
      draggable: true,
    });

    layer.add(polygon);
  }
  static update(config: Partial<ShapeConfig<"polygon">>) {}
  static getFormConfig() {}
}

export default PolygonShape;
