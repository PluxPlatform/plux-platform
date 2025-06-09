export interface ShapeInfoBase {
  name: string;
  type: string;
  attrs: {
    x: number;
    y: number;
    src?: string;
    isComponent?: boolean; // 是否为组件
    stroke?: string;
    strokeWidth?: number;
    rotation?: number; // 旋转角度
    zoom?: number;
    hidden?: boolean; // 是否隐藏
    opacity?: number;
    shadowBlur?: number; // 阴影模糊度
    width?: number;
    height?: number;
    radius?: number; // 半径
    visible?: boolean; // 是否可见
    fontSize?: number; // 字体大小
    fontFamily?: string; // 字体
    text?: string; // 文字内容
    draggable?: boolean; // 是否可拖拽
    data_id?: string; // 数据 id
    hoverEvent?: string; // 鼠标 hover 事件
    qPoint?: boolean; // 管道控制器属性，是否为桥点
    fill?: string; // 填充色
    cornerRadius?: number; // 圆角半径
    align?: "center" | "left" | "right";
    verticalAlign?: "middle" | "top" | "bottom";
    listening?: boolean; // 是否监听事件
  };
  children?: ShapeInfo[];
}

// 矩形
export interface RectInfo extends ShapeInfoBase {
  type: "Rect";
}

// 圆形
export interface CircleInfo extends ShapeInfoBase {
  type: "Circle";
}
// 文字
export interface TextInfo extends ShapeInfoBase {
  type: "Text";
}

// 图片
export interface ImageInfo extends ShapeInfoBase {
  type: "Image";
}

// Group
export interface GroupInfo extends ShapeInfoBase {
  type: "Group";
}

// 所有 shape 的联合类型
export type shapeInfo =
  | RectInfo
  | CircleInfo
  | TextInfo
  | GroupInfo
  | ImageInfo;
// 所有 shape 的 name 的联合类型
export type shapeType = shapeInfo["type"];

export type ShapeInfo<T extends shapeType = shapeType> = Extract<
  shapeInfo,
  { type: T }
>;
export type FormItemType = "number" | "text" | "color" | "select" | "switch";
export interface FormItem {
  label: string;
  type: FormItemType;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}
// attr key 对应的属性中文
export const AttrKeyMap: Record<string, FormItem> = {
  width: {
    label: "宽度",
    type: "number",
  },
  height: {
    label: "高度",
    type: "number",
  },
  radius: {
    label: "半径",
    type: "number",
  },
  stroke: {
    label: "边框颜色",
    type: "color",
  },
  strokeWidth: {
    label: "边框宽度",
    type: "number",
  },
  fill: {
    label: "填充颜色",
    type: "color",
  },
  fontSize: {
    label: "字体大小",
    type: "number",
  },
  fontFamily: {
    label: "字体",
    type: "text",
  },
  text: {
    label: "文字内容",
    type: "text",
  },
  align: {
    label: "对齐方式",
    type: "select",
    options: ["left", "center", "right"],
  },
  verticalAlign: {
    label: "垂直对齐方式",
    type: "select",
    options: ["top", "middle", "bottom"],
  },
  rotation: {
    label: "旋转角度",
    type: "number",
  },
  x: {
    label: "x 坐标",
    type: "number",
  },
  y: {
    label: "y 坐标",
    type: "number",
  },
  shadowBlur: {
    label: "阴影模糊度",
    type: "number",
  },
  draggable: {
    label: "是否可拖拽",
    type: "switch",
  },
};

export const defaultShapes: shapeInfo[] = [
  {
    name: "矩形",
    type: "Rect",
    attrs: {
      width: 100,
      height: 100,
      fill: "#fff",
      stroke: "#ccc",
      x: 0,
      y: 0,
    },
  },
  {
    name: "圆形",
    type: "Circle",
    attrs: {
      radius: 50,
      fill: "#fff",
      stroke: "#ccc",
      x: 0,
      y: 0,
    },
  },
  {
    name: "文字",
    type: "Text",
    attrs: {
      text: "Hello World",
      fontSize: 20,
      fill: "#000",
      x: 0,
      y: 0,
    },
  },
  {
    name: "按钮",
    type: "Group",
    attrs: {
      x: 0,
      y: 0,
      draggable: true,
    },
    children: [
      {
        name: "按钮背景",
        type: "Rect",
        attrs: {
          width: 120,
          height: 40,
          x: 0,
          y: 0,
          fill: "#3498db",
          stroke: "#2980b9",
          strokeWidth: 1,
          cornerRadius: 5,
        },
      },
      {
        name: "按钮文字",
        type: "Text",
        attrs: {
          text: "Click Me",
          fontSize: 20,
          fill: "white",
          width: 120,
          height: 40,
          align: "center",
          verticalAlign: "middle",
          x: 0,
          y: 0,
        },
      },
    ],
  },
  {
    name: "数值组件",
    type: "Group",
    attrs: {
      x: 0,
      y: 0,
      draggable: true,
    },
    children: [
      {
        name: "数值背景",
        type: "Rect",
        attrs: {
          width: 120,
          height: 40,
          x: 0,
          y: 0,
          fill: "rgba(0,0,0,0.5)",
          stroke: "rgba(0,0,0,1)",
          strokeWidth: 1,
          cornerRadius: 5,
        },
      },
      {
        name: "数值",
        type: "Text",
        attrs: {
          text: "0",
          fontSize: 20,
          fill: "white",
          width: 120,
          height: 40,
          align: "center",
          verticalAlign: "middle",
          listening: false,
          x: 0,
          y: 0,
        },
      },
      {
        name: "单位",
        type: "Text",
        attrs: {
          text: "个",
          fontSize: 16,
          fill: "#000",
          height: 40,
          verticalAlign: "middle",
          x: 125,
          y: 0,
          listening: false,
        },
      },
    ],
  },
  {
    name: "图片",
    type: "Image",
    attrs: {
      x: 0,
      y: 0,
      src: "http://39.107.113.96:9090/file/jpg/thumb_20250402195634drii0vqust.png",
    },
  },
  {
    name: "图文组件",
    type: "Group",
    attrs: {
      x: 0,
      y: 0,
      draggable: true,
    },
    children: [
      {
        name: "图片",
        type: "Image",
        attrs: {
          x: 0,
          y: 0,
          src: "http://39.107.113.96:9090/file/jpg/thumb_20250402195634drii0vqust.png",
        },
      },
      {
        name: "设备名称",
        type: "Text",
        attrs: {
          text: "设备名称: 播放按钮",
          fontSize: 20,
          fill: "#000",
          height: 40,
          x: 0,
          y: 0,
        },
      },
    ],
  },
];
