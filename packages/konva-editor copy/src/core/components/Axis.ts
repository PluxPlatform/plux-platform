import Konva from "konva";
import { LAYERNAME } from "../index";

interface AxisConfig {
  width: number;
  height: number;
  gridSize?: number;
  strokeColor?: string;
  strokeWidth?: number;
  showLabels?: boolean;
  labelFontSize?: number;
  labelColor?: string;
}

export class Axis {
  private layer: Konva.Layer;
  private config: AxisConfig;
  private stage: Konva.Stage;

  constructor(stage: Konva.Stage, config: AxisConfig) {
    this.stage = stage;
    // 获取或创建坐标轴图层
    let axisLayer = stage.findOne(`.${LAYERNAME.AXIS}`) as Konva.Layer;
    if (!axisLayer) {
      axisLayer = new Konva.Layer({
        name: LAYERNAME.AXIS,
        listening: false,
      });
      stage.add(axisLayer);
    }

    this.layer = axisLayer;
    this.config = {
      gridSize: 50,
      strokeColor: "#666",
      strokeWidth: 1,
      showLabels: true,
      labelFontSize: 10,
      labelColor: "#666",
      ...config,
    };

    // 添加 stage 拖动事件监听
    this.stage.on("dragmove", () => {
      this.draw();
    });

    this.draw();
  }

  private draw(): void {
    const {
      width,
      height,
      gridSize,
      strokeColor,
      strokeWidth,
      showLabels,
      labelFontSize,
      labelColor,
    } = this.config;

    // 清空图层
    this.layer.destroyChildren();

    // 创建固定位置的坐标轴组
    const axisGroup = new Konva.Group({
      x: -this.stage.x(),
      y: -this.stage.y(),
    });

    // 创建 X 轴和 Y 轴（添加到组中）
    const xAxis = new Konva.Line({
      points: [0, 0, width, 0],
      stroke: strokeColor,
      strokeWidth: strokeWidth,
    });

    const yAxis = new Konva.Line({
      points: [0, 0, 0, height],
      stroke: strokeColor,
      strokeWidth: strokeWidth,
    });

    axisGroup.add(xAxis, yAxis);

    // 添加刻度和标签到组中
    if (gridSize) {
      // 计算可见区域的起始和结束坐标
      const startX = Math.floor(this.stage.x() / gridSize) * gridSize;
      const endX = startX + width + gridSize;
      const startY = Math.floor(this.stage.y() / gridSize) * gridSize;
      const endY = startY + height + gridSize;

      // X 轴刻度
      for (let x = startX; x < endX; x += gridSize) {
        if (x === 0) continue; // 跳过原点

        // 正方向刻度
        const xTick = new Konva.Line({
          points: [x, -5, x, 5],
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        });
        axisGroup.add(xTick);

        // 添加标签
        if (showLabels) {
          const label = new Konva.Text({
            x: x - 5,
            y: 10,
            text: x.toString(),
            fontSize: labelFontSize,
            fill: labelColor,
            padding: 2,
            background: "rgba(255,255,255,0.5)",
          });
          axisGroup.add(label);
        }
      }

      // Y 轴刻度
      for (let y = startY; y < endY; y += gridSize) {
        if (y === 0) continue; // 跳过原点

        // 正方向刻度
        const yTick = new Konva.Line({
          points: [-5, y, 5, y],
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        });
        axisGroup.add(yTick);

        // 添加标签
        if (showLabels) {
          const label = new Konva.Text({
            x: 10,
            y: y - 5,
            text: y.toString(),
            fontSize: labelFontSize,
            fill: labelColor,
            padding: 2,
            background: "rgba(255,255,255,0.5)",
          });
          axisGroup.add(label);
        }
      }
    }

    // 原点标签
    if (showLabels) {
      const originLabel = new Konva.Text({
        x: 10,
        y: 10,
        text: "O",
        fontSize: labelFontSize,
        fill: labelColor,
        padding: 2,
        background: "rgba(255,255,255,0.5)",
      });
      axisGroup.add(originLabel);
    }

    // 将组添加到图层
    this.layer.add(axisGroup);
    this.layer.draw();
  }

  // 更新坐标轴
  update(config: Partial<AxisConfig>): void {
    this.config = { ...this.config, ...config };
    this.draw();
  }

  // 显示坐标轴
  show(): void {
    this.layer.show();
    this.layer.draw();
  }

  // 隐藏坐标轴
  hide(): void {
    this.layer.hide();
    this.layer.draw();
  }

  // 切换坐标轴显示状态
  toggle(): void {
    if (this.layer.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }
}
