// 优化后的路径曲线控制器
const pathCurveController = (path, pointIndex, options = {}) => {
  // 默认配置
  const config = {
    height: 20, // 曲线高度（偏移距离）
    direction: "up", // 曲线方向：'up' 或 'down'
    curveType: "quadratic", // 曲线类型：'quadratic' 或 'cubic'
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

  // 构建基础路径（暂时不添加曲线）
  let pathData = `M ${newPoints[0].x} ${newPoints[0].y}`;
  for (let i = 1; i < newPoints.length; i++) {
    pathData += ` L ${newPoints[i].x} ${newPoints[i].y}`;
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

// 计算高度点（曲线的顶点）
const calculateHeightPoint = (prevPoint, currentPoint, nextPoint, config) => {
  // 计算前后两点连线的中点
  const midX = (prevPoint.x + nextPoint.x) / 2;
  const midY = (prevPoint.y + nextPoint.y) / 2;

  // 计算垂直方向
  const dx = nextPoint.x - prevPoint.x;
  const dy = nextPoint.y - prevPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // 垂直单位向量
  let perpX = -dy / length;
  let perpY = dx / length;

  // 根据方向调整
  if (config.direction === "down") {
    perpX = -perpX;
    perpY = -perpY;
  }

  // 返回高度点
  return {
    x: midX + perpX * config.height,
    y: midY + perpY * config.height,
  };
};

// 计算三次贝塞尔曲线的控制点
const calculateCubicControlPoints = (
  startPoint,
  heightPoint,
  endPoint,
  config
) => {
  // 第一个控制点：从起点向高度点方向的1/3处
  const cp1 = {
    x: startPoint.x + (heightPoint.x - startPoint.x) * 0.33,
    y: startPoint.y + (heightPoint.y - startPoint.y) * 0.33,
  };

  // 第二个控制点：从终点向高度点方向的1/3处
  const cp2 = {
    x: endPoint.x + (heightPoint.x - endPoint.x) * 0.33,
    y: endPoint.y + (heightPoint.y - endPoint.y) * 0.33,
  };

  return { cp1, cp2 };
};

// 计算两点间距离
const calculateDistance = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// 获取路径点数量
const getPathPointCount = (path) => {
  const data = path.data();
  return parsePathPoints(data).length;
};

// 获取可设置曲线的点索引范围
const getCurveablePointRange = (path) => {
  const pointCount = getPathPointCount(path);
  return {
    min: 1,
    max: pointCount - 2,
    total: pointCount,
  };
};

// 重置指定点的曲线（恢复为直线）
const resetPointCurve = (path, pointIndex) => {
  const data = path.data();
  const points = parsePathPoints(data);

  // 重新构建为纯直线路径
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }

  path.data(pathData);

  const layer = path.getLayer();
  if (layer) {
    layer.batchDraw();
  }

  return true;
};
