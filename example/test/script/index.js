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
    data: "M 50 50 L 50 100 L 50 200 L 50 250 L 50 300",
    stroke: "black",
    strokeWidth: 4,
  });
  const path2 = copyPathAndMoveDown(path, 50);

  const path3 = new Konva.Path({
    data: "M 26 492.5 L 66 466.5 L 161 461.5 L 234 491.5", // 二阶
    stroke: "blue",
    strokeWidth: 4,
  });
  const path4 = new Konva.Path({
    data: `
      M 26 492.5
      L 66 466.5
      Q 113.5 440, 161 461.5
      L 234 491.5
    `,
    stroke: "blue",
    strokeWidth: 4,
  });

  layer.add(path, path2, path3, path4);
  // 在第2个点（索引1）设置曲线，不会影响其他点
  pathCurveController(path, 2, {
    height: 30,
    direction: "up",
    curveLength: 25, // 曲线段长度
  });

  layer.draw();
  Event(stage);
  const btn = document.getElementById("btn");
  btn.onclick = () => {
    drawPath(stage);
  };
  const getPathsBtn = document.getElementById("getPaths");
  getPathsBtn.onclick = () => {
    const paths = getPath(stage);
    console.log(paths);
  };
};

createStage();
