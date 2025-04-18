import Konva from "konva";
import { BaseShape } from "../defautShape";
import { ShapeConfig } from "../shape";

// 多角星型图形
class StarShape extends BaseShape<"star"> {
  render(layer: Konva.Layer): void {
    const {
      x,
      y,
      fill,
      stroke,
      strokeWidth,
      outerRadius,
      innerRadius,
      points,
    } = this.config.defaultProps;
    // 创建多角星型图形
    const star = new Konva.Star({
      type: "star",
      id: this.config.id,
      x,
      y,
      fill,
      stroke,
      strokeWidth,
      outerRadius,
      innerRadius,
      numPoints: points,
      draggable: true,
    });
    // 添加到图层
    layer.add(star);
  }
  static update(config: Partial<ShapeConfig<"star">>) {}
  static getFormConfig() {
    return [
      this.defaultFormConfig,
      [
        {
          label: "外半径",
          key: "outerRadius",
          type: "number",
        },
        {
          label: "内半径",
          key: "innerRadius",
          type: "number",
        },
        {
          label: "角点数量",
          key: "numPoints",
          type: "number",
        },
      ],
    ];
  }
}

export default StarShape;
