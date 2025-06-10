// 优化后的路径曲线控制器
const pathCurveController = (path, pointIndex, options = {}) => {
  // 默认配置
  const config = {
    height: 20, // 曲线高度（偏移距离）
    direction: "up", // 曲线方向：'up' 或 'down'
    curveType: "quadratic", // 曲线类型：'quadratic' 或 'cubic'
    type: "circle", // 直角 还是 圆弧right-angle or circle
    ...options,
  };

  // 获取Path数据
  const data = path.data();

  // 解析所有路径点
  const points = parsePathPoints(data);

  // 验证点索引（排除起始点和终点）
  if (pointIndex <= 0 || pointIndex >= points.length - 1) {
    console.error(
      `无法对起始点或终点设置曲线。可设置的点索引范围: 1 到 ${
        points.length - 2
      }`
    );
    return false;
  }

  // 创建带曲线的新路径（只修改目标点）
  const pathData = createLocalCurvedPath(points, pointIndex, config);

  // 更新Path
  path.data(pathData);

  // 重绘
  const layer = path.getLayer();
  if (layer) {
    layer.batchDraw();
  }

  return true;
};

// 根据两个点生成一个中点并添加偏移
function toQuadraticCurve(from, to, offsetY = -20) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + offsetY;
  return `Q ${cx} ${cy}, ${x2} ${y2}`;
}
// 创建局部曲线路径（只修改指定点）
const createLocalCurvedPath = (points, curvePointIndex, config) => {
  if (points.length < 3) {
    console.error("路径至少需要3个点才能创建曲线");
    return "";
  }

  // 获取目标点及其前后点
  const prevPoint = points[curvePointIndex - 1];
  const currentPoint = points[curvePointIndex];
  const nextPoint = points[curvePointIndex + 1];

  // 计算距离
  const distanceToPrev = calculateDistance(currentPoint, prevPoint);
  const distanceToNext = calculateDistance(currentPoint, nextPoint);
  const totalDistance = calculateDistance(prevPoint, nextPoint);

  // 计算当前点在前后两点之间的比例
  const ratioFromPrev = distanceToPrev / (distanceToPrev + distanceToNext);
  const ratioFromNext = distanceToNext / (distanceToPrev + distanceToNext);
  // 创建新的点数组，删除当前点
  const newPoints = [];

  for (let i = 0; i < points.length; i++) {
    if (i !== curvePointIndex) {
      newPoints.push(points[i]);
    }
  }
  // 半径
  const radius = 30;
  // 计算新的点位置
  let newPoint = getPointOnLine(
    prevPoint,
    currentPoint,
    totalDistance * ratioFromPrev
  );
  // 计算currentPoint到新的点的距离
  const distanceToNewPoint = calculateDistance(prevPoint, newPoint) - radius;
  // 计算新的点位置
  const newPoint1 = getPointOnLine(prevPoint, newPoint, distanceToNewPoint);
  const newPoint2 = getPointOnLine(newPoint, nextPoint, radius);

  // 直角
  if (config.type !== "circle") {
    newPoint = getPointWithHeight(
      prevPoint,
      nextPoint,
      newPoint,
      config.height
    );
    // 插入新的点
    newPoints.splice(curvePointIndex, 0, newPoint1, newPoint, newPoint2);
  } else {
  }

  // 构建基础路径（暂时不添加曲线）
  let pathData = `M ${newPoints[0].x} ${newPoints[0].y}`;
  for (let i = 1; i < newPoints.length; i++) {
    if (config.type !== "circle") {
      pathData += ` L ${newPoints[i].x} ${newPoints[i].y}`;
    } else {
      // 组装圆弧
    }
  }
  return pathData;
};

// 解析路径中的所有点
const parsePathPoints = (pathData) => {
  const points = [];

  if (typeof pathData === "string") {
    const commands = pathData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];

    commands.forEach((cmd) => {
      const type = cmd[0].toUpperCase();
      const coords = cmd
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => !isNaN(n));

      if (type === "M" || type === "L") {
        points.push({ x: coords[0], y: coords[1] });
      }
    });
  }

  return points;
};

// 计算两点间距离
const calculateDistance = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// 复制一个Path，新的path整体向下移动指定的距离
const copyPathAndMoveDown = (path, distance) => {
  const data = path.data();
  const points = parsePathPoints(data);
  // 移动所有点的y坐标
  const newPoints = points.map((point) => ({
    x: point.x + distance,
    y: point.y + distance,
  }));
  // 重新构建路径数据
  let pathData = `M ${newPoints[0].x} ${newPoints[0].y}`;
  for (let i = 1; i < newPoints.length; i++) {
    pathData += ` L ${newPoints[i].x} ${newPoints[i].y}`;
  }
  // 创建新的Path
  const newPath = new Konva.Path({
    data: pathData,
    stroke: path.stroke(),
    strokeWidth: path.strokeWidth(),
    fill: path.fill(),
    opacity: path.opacity(),
  });
  return newPath;
};

// 根据开始点、结束点和距离开始点的距离，计算线上新点的位置
const getPointOnLine = (startPoint, endPoint, distanceFromStart) => {
  // 计算两点间的总距离
  const totalDistance = calculateDistance(startPoint, endPoint);

  // 如果距离超出线段范围，返回null或边界点
  if (distanceFromStart < 0) {
    return startPoint;
  }
  if (distanceFromStart > totalDistance) {
    return endPoint;
  }

  // 计算在线段上的比例
  const ratio = distanceFromStart / totalDistance;

  // 使用线性插值计算新点位置
  const newPoint = {
    x: startPoint.x + (endPoint.x - startPoint.x) * ratio,
    y: startPoint.y + (endPoint.y - startPoint.y) * ratio,
  };

  return newPoint;
};

// 获取线段上某点垂直偏移指定高度后的新点
const getPointWithHeight = (
  startPoint,
  endPoint,
  pointOnLine,
  height,
  direction = "down"
) => {
  if (!pointOnLine) {
    return null;
  }

  // 计算线段的方向向量
  const lineVector = {
    x: endPoint.x - startPoint.x,
    y: endPoint.y - startPoint.y,
  };

  // 计算线段长度
  const lineLength = Math.sqrt(
    lineVector.x * lineVector.x + lineVector.y * lineVector.y
  );

  // 归一化线段方向向量
  const normalizedLine = {
    x: lineVector.x / lineLength,
    y: lineVector.y / lineLength,
  };

  // 计算垂直向量（逆时针旋转90度）
  const perpendicular = {
    x: -normalizedLine.y,
    y: normalizedLine.x,
  };

  // 根据方向调整垂直向量
  const directionMultiplier = direction === "down" ? -1 : 1;

  // 计算偏移后的新点
  const newPoint = {
    x: pointOnLine.x + perpendicular.x * height * directionMultiplier,
    y: pointOnLine.y + perpendicular.y * height * directionMultiplier,
  };

  return newPoint;
};
