// shape 类型定义
export interface ShapeComponent {
  type: string;
  label: string;
  icon: string;
  defaultProps: Record<string, string | number | number[]>;
}

export interface ShapeGroup {
  name: string;
  title: string;
  components: ShapeComponent[];
}

const shapes: ShapeGroup[] = [
  {
    name: "basic",
    title: "基础图形",
    components: [
      {
        type: "rect",
        label: "矩形",
        icon: "el-icon-picture-outline",
        defaultProps: {
          width: 100,
          height: 100,
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 1,
        },
      },
      {
        type: "circle",
        label: "圆形",
        icon: "el-icon-refresh",
        defaultProps: {
          radius: 50,
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 1,
        },
      },
      {
        type: "text",
        label: "文本",
        icon: "el-icon-edit",
        defaultProps: {
          text: "文本",
          fontSize: 16,
          fill: "#000000",
          width: 100,
          height: 20,
        },
      },
      {
        type: "polygon",
        label: "多边形",
        icon: "el-icon-star-off",
        defaultProps: {
          radius: 50,
          sides: 5,
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 1,
        },
      },
      {
        type: "star",
        label: "多角星",
        icon: "el-icon-star-on",
        defaultProps: {
          radius: 50,
          points: 5,
          innerRadius: 30,
          outerRadius: 70,
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 1,
        },
      },
      {
        type: "line",
        label: "直线",
        icon: "el-icon-minus",
        defaultProps: {
          points: [0, 0, 100, 0],
          stroke: "#000000",
          strokeWidth: 2,
        },
      },
      {
        type: "arrow",
        label: "箭头",
        icon: "el-icon-right",
        defaultProps: {
          points: [0, 0, 100, 0],
          stroke: "#000000",
          strokeWidth: 2,
          pointerLength: 10,
          pointerWidth: 10,
        },
      },
    ],
  },
  {
    name: "custome",
    title: "自定义组件",
    components: [
      {
        type: "button",
        label: "按钮",
        icon: "el-icon-s-grid",
        defaultProps: {
          width: 120,
          height: 40,
          text: "按钮文字",
          fontSize: 14,
          fontFamily: "Arial",
          fill: "#3498db",
          stroke: "#2980b9",
          strokeWidth: 1,
          cornerRadius: 5,
          textFill: "#ffffff",
          padding: 10,
        },
      },
      {
        type: "html",
        label: "按钮",
        icon: "el-icon-s-grid",
        defaultProps: {
          width: 100,
          height: 100,
          html: "<button>按钮</button>",
        },
      },
      {
        type: "html",
        label: "div",
        icon: "el-icon-s-grid",
        defaultProps: {
          width: 100,
          height: 100,
          html: "<div>我是div标签</div>",
        },
      },
    ],
  },
  {
    name: "images",
    title: "图片",
    components: [
      {
        type: "image",
        label: "图片",
        icon: "el-icon-picture",
        defaultProps: {
          width: 100,
          height: 100,
          src: "http://39.107.113.96:9090/file/jpg/20250402195634drii0vqust.png",
        },
      },
    ],
  },
  {
    name: "devices",
    title: "设备",
    components: [
      {
        type: "device",
        label: "温度传感器",
        icon: "el-icon-cpu",
        defaultProps: {
          width: 50,
          height: 50,
          deviceType: "temperature",
          deviceId: "",
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 1,
        },
      },
      {
        type: "device",
        label: "湿度传感器",
        icon: "el-icon-cpu",
        defaultProps: {
          width: 50,
          height: 50,
          deviceType: "humidity",
          deviceId: "",
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 1,
        },
      },
      {
        type: "device",
        label: "电表",
        icon: "el-icon-cpu",
        defaultProps: {
          width: 50,
          height: 50,
          deviceType: "electricity",
          deviceId: "",
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 1,
        },
      },
    ],
  },
];

export default shapes;
