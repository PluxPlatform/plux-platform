// ==================== 配置和初始化 ====================
const CONFIG = {
  canvas: {
    width: window.innerWidth,
    height: window.innerHeight,
    container: "container"
  },
  anchor: {
    radius: 20,
    stroke: "#666",
    fill: "#ddd",
    strokeWidth: 2,
    hoverStrokeWidth: 4
  },
  curve: {
    stroke: "red",
    strokeWidth: 4
  },
  points: {
    start: { x: 60, y: 30 },
    control: { x: 240, y: 110 },
    end: { x: 80, y: 160 }
  }
};

// ==================== 舞台和图层初始化 ====================
const stage = new Konva.Stage({
  container: CONFIG.canvas.container,
  width: CONFIG.canvas.width,
  height: CONFIG.canvas.height,
});

const layer = new Konva.Layer();
stage.add(layer);

// ==================== 工具函数 ====================
/**
 * 创建可拖拽的锚点
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {Konva.Circle} 锚点对象
 */
function createAnchor(x, y) {
  const anchor = new Konva.Circle({
    x: x,
    y: y,
    radius: CONFIG.anchor.radius,
    stroke: CONFIG.anchor.stroke,
    fill: CONFIG.anchor.fill,
    strokeWidth: CONFIG.anchor.strokeWidth,
    draggable: true,
  });

  // 添加交互事件
  addAnchorEvents(anchor);
  
  return anchor;
}

/**
 * 为锚点添加交互事件
 * @param {Konva.Circle} anchor - 锚点对象
 */
function addAnchorEvents(anchor) {
  // 鼠标悬停效果
  anchor.on("mouseover", function () {
    document.body.style.cursor = "pointer";
    this.strokeWidth(CONFIG.anchor.hoverStrokeWidth);
  });

  anchor.on("mouseout", function () {
    document.body.style.cursor = "default";
    this.strokeWidth(CONFIG.anchor.strokeWidth);
  });

  // 拖拽时重绘曲线
  anchor.on("dragmove", function () {
    layer.draw();
  });
}

/**
 * 创建二次贝塞尔曲线
 * @param {Object} points - 包含起点、控制点、终点的对象
 * @returns {Konva.Path} 曲线对象
 */
function createQuadraticCurve(points) {
  return new Konva.Path({
    stroke: CONFIG.curve.stroke,
    strokeWidth: CONFIG.curve.strokeWidth,
    sceneFunc: (ctx, shape) => {
      ctx.beginPath();
      ctx.moveTo(points.start.x(), points.start.y());
      ctx.quadraticCurveTo(
        points.control.x(),
        points.control.y(),
        points.end.x(),
        points.end.y()
      );
      ctx.fillStrokeShape(shape);
    },
  });
}

// ==================== 主要对象创建 ====================
// 创建锚点
const anchors = {
  start: createAnchor(CONFIG.points.start.x, CONFIG.points.start.y),
  control: createAnchor(CONFIG.points.control.x, CONFIG.points.control.y),
  end: createAnchor(CONFIG.points.end.x, CONFIG.points.end.y)
};

// 创建曲线
const curve = createQuadraticCurve(anchors);

// ==================== 添加到图层并渲染 ====================
// 添加锚点到图层
Object.values(anchors).forEach(anchor => {
  layer.add(anchor);
});

// 添加曲线到图层
layer.add(curve);

// 初始渲染
layer.draw();
