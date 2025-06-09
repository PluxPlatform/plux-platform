const startPathAnimate = (path) => {
  if (!path) return;
  // 建议先设置虚线样式
  if (!path.dash() || path.dash().length === 0) {
    path.dash([20, 10]); // 默认虚线样式，可根据需要调整
  }
  let offset = 0;
  const anim = new window.Konva.Animation(() => {
    offset += 2; // 控制流动速度
    path.dashOffset(offset);
  }, path.getLayer());
  anim.start();
  pathAnimMap.set(path._id, anim);
};
