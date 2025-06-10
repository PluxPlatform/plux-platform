// ==================== 配置和初始化 ====================
const CONFIG = {
  canvas: {
    width: window.innerWidth,
    height: window.innerHeight,
    container: "container",
  },
  anchor: {
    radius: 20,
    stroke: "#666",
    fill: "#ddd",
    strokeWidth: 2,
    hoverStrokeWidth: 4,
  },
  curve: {
    stroke: "red",
    strokeWidth: 4,
  },
  points: {
    start: { x: 60, y: 30 },
    control: { x: 240, y: 110 },
    end: { x: 80, y: 160 },
  },
};

// ==================== 舞台和图层初始化 ====================
const stage = new Konva.Stage({
  container: CONFIG.canvas.container,
  width: CONFIG.canvas.width,
  height: CONFIG.canvas.height,
});

const layer = new Konva.Layer();
stage.add(layer);

const controlPoint = new Konva.Circle({
  x: 100,
  y: 20,
  radius: 3,
  fill: "red",
  stroke: "black",
  strokeWidth: 2,
});

const path = new Konva.Path({
  stroke: "red",
  data: "M 100 100 L 200 100 Q 250 20 300 100 L 300 100 L 400 100",
  strokeWidth: 4,
});
layer.add(path, controlPoint);
console.log("path: ", path);
layer.draw();
