const createStage = () => {
  const stage = new Konva.Stage({
    container: "body",
    width: 500,
    height: 500,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  // 创建有5个点的测试路径
  const path = new Konva.Path({
    data: "M 50 50 L 50 100 L 50 200 L 50 250L 50 300",
    stroke: "black",
    name: "pipLine",
    strokeWidth: 4,
  });

  layer.add(path);

  // 在第2个点（索引1）设置曲线，不会影响其他点
  pathCurveController(path, 1, {
    height: 30,
    direction: "up",
    curveLength: 25, // 曲线段长度
  });

  layer.draw();
};

createStage();
