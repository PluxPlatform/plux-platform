// shape HoverAnimation
export type HoverAnimation = {
  zoom;
  stroke;
  rotation;
};

// 基础通用配置
export interface CommonConfig {
  name: string;
  id: string;
  x?: number;
  y?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
  shadowBlur?: number;
  width?: number;
  height?: number;
}

// 每个形状的特定配置
interface RectConfig extends CommonConfig {
  type: "rect";
  width?: number;
  height?: number;
}

interface CircleConfig extends CommonConfig {
  type: "circle";
  radius?: number;
}

interface PolygonConfig extends CommonConfig {
  type: "polygon";
  points?: number[];
}

interface TextConfig extends CommonConfig {
  type: "text";
  text: string;
  fontSize?: number;
  fontFamily?: string;
}

interface ImageConfig extends CommonConfig {
  type: "image";
  src: string;
}

// 多边形
interface PolygonConfig extends CommonConfig {
  type: "polygon";
  // 边数
  sides?: number;
  // 半径
  radius?: number;
}

// 多角形
interface StarConfig extends CommonConfig {
  type: "star";
  // 角数
  points: number;
  // 内半径
  innerRadius: number;
  // 外半径
  outerRadius: number;
}
// 按钮
interface ButtonConfig extends CommonConfig {
  type: "button";
  // 按钮文本
  text: string;
  // 文本颜色
  textFill?: number;
  // 矩形圆角
  cornerRadius?: number;
}

// html
interface HtmlConfig extends CommonConfig {
  type: "html";
  // 按钮文本
  html: string;
}

// 使用联合类型
type BaseConfig =
  | RectConfig
  | CircleConfig
  | PolygonConfig
  | ButtonConfig
  | TextConfig
  | StarConfig
  | HtmlConfig
  | ImageConfig;
export type shapeType = BaseConfig["type"];

export type ShapeSetting<T extends shapeType = shapeType> = Extract<
  BaseConfig,
  { type: T }
>;

export interface ShapeConfig<T extends shapeType = shapeType> {
  id?: string;
  type: T;
  defaultProps: Extract<BaseConfig, { type: T }>;
}
