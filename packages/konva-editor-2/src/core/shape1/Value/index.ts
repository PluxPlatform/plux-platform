import Konva from "konva";
import { BaseShape } from "../defautShape";
import { BaseConfig } from "../shape";
import { getStage } from "../..";
import { toRgba } from "../../../utils";

// 设备属性值图形
export class ValueShape extends BaseShape<"value"> {
  render(layer: Konva.Layer): void {
    const { x, y } = this.config.defaultProps;
    const groupFill = toRgba("red", 0.3);
    const Group = new Konva.Group({
      x,
      y,
      type: "value",
      draggable: true,
      id: this.config.id,
    });
    const Rect = new Konva.Rect({
      width: 100,
      height: 30,
      fill: groupFill,
      stroke: "red",
      groupFill: "red",
      strokeWidth: 1,
      cornerRadius: 5,
    });
    const Text = new Konva.Text({
      text: "100",
      fontSize: 16,
      fontFamily: "Calibri",
      fill: "#fff",
      width: 100,
      height: 30,
      name: "value",
      align: "center",
      verticalAlign: "middle",
    });
    const UnitText = new Konva.Text({
      text: "%",
      fontSize: 16,
      fill: "#000",
      x: 105,
      y: 0,
      width: 60,
      height: 30,
      align: "left",
      name: "unit",
      verticalAlign: "middle",
    });
    Group.add(Rect, Text, UnitText);
    // 添加到图层
    layer.add(Group);
  }
  static update(config: Extract<BaseConfig, { type: "value" }>): void {
    const { id, text, unit, unitColor, valueColor, groupFill } = config;
    const stage = getStage();
    const node = stage?.findOne(`#${id}`) as Konva.Group;
    const rect = node.findOne("Rect");
    const value = node.findOne(".value");
    const unitText = node.findOne(".unit");
    const groupFillColor = toRgba(groupFill, 0.3);

    node.setAttrs({
      x: config.x,
      y: config.y,
    });
    rect?.setAttrs({
      fill: groupFillColor,
      stroke: groupFill,
      groupFill,
    });
    value?.setAttrs({
      text,
      fill: valueColor,
    });
    unitText?.setAttrs({
      text: unit,
      fill: unitColor,
    });
    node?.draw();
  }
  static getFormConfig() {
    return [
      [
        ...this.deleteProperty([
          "width",
          "height",
          "stroke",
          "strokeWidth",
          "fill",
        ]),
        {
          label: "属性值",
          name: "text",
          type: "text",
        },
        {
          label: "属性值颜色",
          name: "valueColor",
          type: "color",
        },
        {
          label: "属性值背景色",
          name: "groupFill",
          type: "color",
        },
        {
          label: "单位",
          name: "unit",
          type: "text",
        },
        {
          label: "单位颜色",
          name: "unitColor",
          type: "color",
        },
      ],
    ];
  }

  static getNodeAttrs(node: Konva.Group) {
    const rectAttrs = node.findOne("Rect")?.attrs;
    const value = node.findOne(".value")?.attrs;
    const unit = node.findOne(".unit")?.attrs;
    return {
      text: value?.text,
      valueColor: value?.fill,
      x: node.attrs.x,
      y: node.attrs.y,
      width: rectAttrs?.width,
      height: rectAttrs?.height,
      groupFill: rectAttrs?.fill,
      unit: unit?.text,
      unitColor: unit?.fill,
      type: "value",
      id: node.attrs.id,
    };
  }
}

export default ValueShape;
