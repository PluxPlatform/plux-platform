import Konva from "konva";
import { BaseConfig, ShapeConfig, shapeType } from "./shape";

// 基础图形类
abstract class BaseShape<T extends shapeType = shapeType> {
  config: ShapeConfig<T>;

  constructor(config: ShapeConfig<T>) {
    this.config = config;
    this.init();
  }

  static defaultFormConfig = [
    {
      name: "width",
      label: "宽度",
      type: "number",
    },
    {
      name: "height",
      label: "高度",
      type: "number",
    },
    {
      name: "fill",
      label: "填充颜色",
      type: "color",
    },
    {
      name: "stroke",
      label: "描边颜色",
      type: "color",
    },
    {
      name: "strokeWidth",
      label: "描边宽度",
      type: "number",
    },
    {
      name: "cornerRadius",
      label: "圆角半径",
      type: "number",
    },
    {
      name: "x",
      label: "x轴位置",
      type: "number",
    },
    {
      name: "y",
      label: "y轴位置",
      type: "number",
    },
  ];

  // 高级属性
  static advancedFormConfig = [
    {
      name: "device_id",
      label: "设备id",
      type: "number",
    },
  ];

  init() {
    // 基础初始化逻辑
  }

  // 子类render
  abstract render(layer: Konva.Layer): void;
  // 子类要重写的update
  update(config: Extract<BaseConfig, { type: T }>): void {}

  getFormConfig<T extends shapeType = shapeType>(type: T) {}
}

export { BaseShape };
