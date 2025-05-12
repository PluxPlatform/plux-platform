import Konva from "konva";
import { BaseShape } from "../defautShape";
import { BaseConfig, ShapeConfig } from "../shape";
import { getStage } from "../..";

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
  static update(config: Extract<BaseConfig, { type: "button" }>) {
    const { x, y, width, height, text } = config;
    const { id } = config;
    const stage = getStage();
    const node = stage?.findOne(`#${id}`) as Konva.Group;
    const textNode = node?.findOne(`Text`) as Konva.Text;
    const Rect = node?.findOne(`Rect`) as Konva.Rect;

    textNode &&
      textNode.setAttrs({
        text,
        fill: config.textFill,
        width,
        height,
        x: 0,
        y: 0,
        align: "center",
        verticalAlign: "middle",
      });
    node &&
      node.setAttrs({
        x,
        y,
      });
    Rect &&
      Rect.setAttrs({
        fill: config.fill,
        stroke: config.stroke,
        width,
        height,
      });

    node?.draw();
  }
  static getFormConfig() {
    return [
      [
        {
          label: "x轴",
          name: "x",
          type: "number",
        },
        {
          label: "y轴",
          name: "y",
          type: "number",
        },
        {
          label: "宽",
          name: "width",
          type: "number",
        },
        {
          label: "高",
          name: "height",
          type: "number",
        },
        {
          label: "填充色",
          name: "fill",
          type: "color",
        },
        {
          label: "文本",
          name: "text",
          type: "text",
        },
        {
          label: "文本颜色",
          name: "textFill",
          type: "color",
        },
      ],
    ];
  }
  static getNodeAttrs(node: Konva.Group) {
    const rectAttrs = node.findOne("Rect")?.attrs;
    const textAttrs = node.findOne("Text")?.attrs;
    return {
      text: textAttrs?.text,
      x: node.attrs.x,
      y: node.attrs.y,
      width: rectAttrs?.width,
      height: rectAttrs?.height,
      fill: rectAttrs?.fill,
      textFill: textAttrs?.fill,
      type: "button",
      id: node.attrs.id,
    };
  }
}

export default ButtonShape;
