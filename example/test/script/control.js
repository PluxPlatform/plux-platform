/**
 * 路径曲线控制器
 * 用于在指定的路径点创建曲线效果
 */

// ==================== 主要控制函数 ====================

/**
 * 路径曲线控制器 - 主入口函数
 * @param {Konva.Path} path - Konva路径对象
 * @param {number} pointIndex - 要设置曲线的点索引
 * @param {Object} options - 配置选项
 * @returns {boolean} 是否成功设置曲线
 */
const pathCurveController = (path, pointIndex, options = {}) => {
  // 默认配置
  const config = {
    height: 20, // 曲线高度（偏移距离）
    radius: 20, // 圆弧半径
    direction: "down", // 曲线方向：'up' 或 'down'
    type: "circle", // 转角类型：'right-angle' 或 'circle'
    ...options,
  };

  // 获取并解析路径数据
  const data = path.data();
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

  // 创建带曲线的新路径
  const pathData = createLocalCurvedPath(points, pointIndex, config);

  // 更新路径并重绘
  path.data(pathData);
  const layer = path.getLayer();
  if (layer) {
    layer.batchDraw();
  }
  return true;
};

// ==================== 路径处理函数 ====================

/**
 * 创建局部曲线路径（只修改指定点）
 * @param {Array} points - 路径点数组
 * @param {number} curvePointIndex - 曲线点索引
 * @param {Object} config - 配置对象
 * @returns {string} 新的路径数据字符串
 */
const createLocalCurvedPath = (points, curvePointIndex, config) => {
  if (points.length < 3) {
    console.error("路径至少需要3个点才能创建曲线");
    return "";
  }

  // 获取目标点及其前后点
  const prevPoint = points[curvePointIndex - 1];
  const currentPoint = points[curvePointIndex];
  const nextPoint = points[curvePointIndex + 1];

  // 计算各点间距离
  const distanceToPrev = calculateDistance(currentPoint, prevPoint);
  const distanceToNext = calculateDistance(currentPoint, nextPoint);
  const totalDistance = calculateDistance(prevPoint, nextPoint);

  // 计算当前点在前后两点之间的比例
  const ratioFromPrev = distanceToPrev / (distanceToPrev + distanceToNext);

  // 创建新的点数组，移除当前点
  const newPoints = points.filter((_, index) => index !== curvePointIndex);

  // 计算新的控制点位置
  let controlPoint = getPointOnLine(
    prevPoint,
    currentPoint,
    totalDistance * ratioFromPrev
  );

  const distanceToNewPoint =
    calculateDistance(prevPoint, controlPoint) - config.radius;
  const newPoint1 = getPointOnLine(prevPoint, controlPoint, distanceToNewPoint);
  const newPoint2 = getPointOnLine(controlPoint, nextPoint, config.radius);
  controlPoint = getPointWithHeight(
    prevPoint,
    nextPoint,
    controlPoint,
    config.height,
    config.direction
  );
  // 根据转角类型处理
  if (config.type !== "circle") {
    // 直角转角

    newPoints.splice(curvePointIndex, 0, newPoint1, newPoint, newPoint2);
  } else {
    // 圆弧转角
    newPoints.splice(curvePointIndex, 0, newPoint1, newPoint2);
  }

  // 构建路径数据
  return buildPathData(newPoints, config, newPoint1, controlPoint);
};

/**
 * 构建路径数据字符串
 * @param {Array} points - 点数组
 * @param {Object} config - 配置对象
 * @param {Object} newPoint1 - 第一个新点
 * @param {Object} 控制点 - 第二个新点
 * @returns {string} 路径数据字符串
 */
const buildPathData = (points, config, newPoint1, controlPoint) => {
  let pathData = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const currentPoint = points[i];

    if (config.type !== "circle") {
      // 直线连接
      pathData += ` L ${currentPoint.x} ${currentPoint.y}`;
    } else {
      // 处理圆弧
      if (newPoint1.x === currentPoint.x && newPoint1.y === currentPoint.y) {
        const nextPoint = points[i + 1];
        const selfPoint = ` L ${currentPoint.x} ${currentPoint.y}`;

        pathData +=
          selfPoint +
          ` Q ${controlPoint.x} ${controlPoint.y} ${nextPoint.x} ${nextPoint.y}`;
      } else {
        pathData += ` L ${currentPoint.x} ${currentPoint.y}`;
      }
    }
  }
  return pathData;
};

/**
 * 解析路径中的所有点
 * @param {string} pathData - SVG路径数据字符串
 * @returns {Array} 点坐标数组
 */
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

// ==================== 几何计算工具函数 ====================

/**
 * 计算两点间的欧几里得距离
 * @param {Object} point1 - 第一个点 {x, y}
 * @param {Object} point2 - 第二个点 {x, y}
 * @returns {number} 两点间距离
 */
const calculateDistance = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 根据起点、终点和距离起点的距离，计算线段上新点的位置
 * @param {Object} startPoint - 起点 {x, y}
 * @param {Object} endPoint - 终点 {x, y}
 * @param {number} distanceFromStart - 距离起点的距离
 * @returns {Object} 新点坐标 {x, y}
 */
const getPointOnLine = (startPoint, endPoint, distanceFromStart) => {
  const totalDistance = calculateDistance(startPoint, endPoint);

  // 边界检查
  if (distanceFromStart < 0) {
    return startPoint;
  }
  if (distanceFromStart > totalDistance) {
    return endPoint;
  }

  // 线性插值计算新点位置
  const ratio = distanceFromStart / totalDistance;
  const newPoint = {
    x: startPoint.x + (endPoint.x - startPoint.x) * ratio,
    y: startPoint.y + (endPoint.y - startPoint.y) * ratio,
  };

  return newPoint;
};

/**
 * 获取线段上某点垂直偏移指定高度后的新点
 * @param {Object} startPoint - 线段起点 {x, y}
 * @param {Object} endPoint - 线段终点 {x, y}
 * @param {Object} pointOnLine - 线段上的点 {x, y}
 * @param {number} height - 偏移高度
 * @param {string} direction - 偏移方向 'up' 或 'down'，默认为 'down'
 * @returns {Object|null} 偏移后的新点坐标
 */
const getPointWithHeight = (
  startPoint,
  endPoint,
  pointOnLine,
  height,
  direction = "up"
) => {
  if (!pointOnLine) {
    return null;
  }

  // 计算线段的方向向量
  const lineVector = {
    x: endPoint.x - startPoint.x,
    y: endPoint.y - startPoint.y,
  };

  // 计算并归一化线段方向向量
  const lineLength = Math.sqrt(
    lineVector.x * lineVector.x + lineVector.y * lineVector.y
  );
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
