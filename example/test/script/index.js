const createStage = () => {
  const stage = new Konva.Stage({
    container: "body",
    width: 500,
    height: 500,
  });

  const layer = new Konva.Layer();
  stage.add(layer);
  // path
  const path = new Konva.Path({
    data: "M 100 100 L 150 100 200 100 300 100 400 100",
    stroke: "black",
    strokeWidth: 4,
  });
  // add the shape to the layer
  layer.add(path);
  layer.draw();
  // get the points

  setTimeout(() => {
    // startPathAnimate(path);
    setPathCurveAt(path, 1);
  }, 200);
};

createStage();
