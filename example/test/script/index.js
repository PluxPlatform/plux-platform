const createStage = () => {
  const stage = new Konva.Stage({
    container: "container",
    width: 500,
    height: 500,
  });

  const layer = new Konva.Layer();
  stage.add(layer);
  const path = new Konva.Path({
    stroke: "red",
    data: "M 100 100 L 200 200  L 300 300 L 400 400",
    strokeWidth: 4,
  });
  layer.add(path);
  pathCurveController(path, 1, {
    direction: "down",
  });
  layer.draw();
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
