import Konva from "konva";
import { BaseShape } from "../defautShape";
import { ShapeConfig } from "../shape";

// 按钮图形
class ButtonShape extends BaseShape<"button"> {
  render(layer: Konva.Layer): void {
    const { x, y, width, height, fill, stroke, strokeWidth, cornerRadius } =
      this.config.defaultProps;
    // 创建按钮图形
    const group = new Konva.Group({
      id: this.config.id,
      type: "button",
      x,
      y,
      width,
      height,
      draggable: true,
    });
    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      cornerRadius,
    });

    const text = new Konva.Text({
      listening: false,
      x: 0,
      y: 0,
      text: "按钮",
      fontSize: 14,
      fill: "#fff",
    });
    // 强制计算 text 的尺寸
    const textSize = text.getClientRect();

    // 重新设置 position，让它居中
    text.position({
      x: (width! - textSize.width) / 2,
      y: (height! - textSize.height) / 2,
    });
    group.add(rect, text);
    layer.add(group);
  }
  static update(config: Partial<ShapeConfig<"button">>) {}
  static getFormConfig() {}
}

export default ButtonShape;
