import Konva from "konva";
import { BaseShape } from "../defautShape";
import { BaseConfig, ShapeConfig } from "../shape";
import { getStage } from "../..";

// 文本图形
class TextShape extends BaseShape<"text"> {
  render(layer: Konva.Layer): void {
    const { x, y, text, fontSize, fontFamily, fill, stroke, strokeWidth } =
      this.config.defaultProps;
    // 创建文本图形
    const textNode = new Konva.Text({
      type: "text",
      id: this.config.id,
      x,
      y,
      text,
      fontSize,
      fontFamily: fontFamily || "Arial",
      fill,
      stroke,
      strokeWidth,
      draggable: true,
    });
    // 添加到图层
    layer.add(textNode);
  }
  static update(config: Extract<BaseConfig, { type: "text" }>): void {
    const { id } = config;
    const stage = getStage();
    const node = stage?.findOne(`#${id}`) as Konva.Text;
    node.setAttrs(config);
    node.setText(config.text || "");
    node?.draw();
  }
  static getFormConfig() {
    return [
      [
        {
          label: "文本内容",
          name: "text",
          type: "text",
        },
        {
          label: "字体大小",
          name: "fontSize",
          type: "number",
        },
        {
          label: "字体",
          name: "fontFamily",
          type: "text",
        },
        {
          label: "文字颜色",
          name: "fill",
          type: "color",
        },
      ],
    ];
  }
}

export default TextShape;
