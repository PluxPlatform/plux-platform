// 默认配置
const DEFAULT_CURVE_CONFIG = {
  radius: 30,
  height: 15,
  direction: "up",
  radiusRatio: 0.3,
};

// 解析SVG路径字符串为点数组
const parsePathData = (pathData) => {
  const commands = pathData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
  const points = [];

  commands.forEach((command) => {
    const type = command[0].toUpperCase();
    const coords = command
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

    if (type === "M" || type === "L") {
      for (let i = 0; i < coords.length; i += 2) {
        points.push({ x: coords[i], y: coords[i + 1], type });
      }
    }
  });

  return points;
};

// 计算实际的圆角半径
const calculateActualRadius = (config, len1, len2) => {
  if (config.radius > 0) {
    return Math.min(
      config.radius,
      len1 * config.radiusRatio,
      len2 * config.radiusRatio
    );
  }
  return Math.min(len1, len2) * config.radiusRatio;
};

// 计算控制点位置
const calculateControlPoint = (currentPoint, vec1X, vec1Y, vec2X, vec2Y, len1, len2, config) => {
  let controlX, controlY;

  switch (config.direction) {
    case "auto":
      const normalX = -(vec1Y / len1 + vec2Y / len2) / 2;
      const normalY = (vec1X / len1 + vec2X / len2) / 2;
      const normalLen = Math.sqrt(normalX * normalX + normalY * normalY);

      if (normalLen > 0) {
        controlX = currentPoint.x + (normalX / normalLen) * config.height;
        controlY = currentPoint.y + (normalY / normalLen) * config.height;
      } else {
        controlX = currentPoint.x;
        controlY = currentPoint.y - config.height;
      }
      break;

    case "up":
      controlX = currentPoint.x;
      controlY = currentPoint.y - Math.abs(config.height);
      break;

    case "down":
      controlX = currentPoint.x;
      controlY = currentPoint.y + Math.abs(config.height);
      break;

    case "left":
      controlX = currentPoint.x - Math.abs(config.height);
      controlY = currentPoint.y;
      break;

    case "right":
      controlX = currentPoint.x + Math.abs(config.height);
      controlY = currentPoint.y;
      break;

    default:
      if (typeof config.direction === "object") {
        controlX = currentPoint.x + (config.direction.x || 0);
        controlY = currentPoint.y + (config.direction.y || 0);
      } else {
        controlX = currentPoint.x;
        controlY = currentPoint.y - Math.abs(config.height);
      }
  }

  return { x: controlX, y: controlY };
};

// 创建曲线段
const createCurveSegment = (points, curveIndex, config) => {
  const prevPoint = points[curveIndex - 1];
  const currentPoint = points[curveIndex];
  const nextPoint = points[curveIndex + 1];

  // 计算向量和距离
  const vec1X = currentPoint.x - prevPoint.x;
  const vec1Y = currentPoint.y - prevPoint.y;
  const vec2X = nextPoint.x - currentPoint.x;
  const vec2Y = nextPoint.y - currentPoint.y;

  const len1 = Math.sqrt(vec1X * vec1X + vec1Y * vec1Y);
  const len2 = Math.sqrt(vec2X * vec2X + vec2Y * vec2Y);

  // 计算实际半径
  const actualRadius = calculateActualRadius(config, len1, len2);

  // 计算新的端点
  const ratio1 = actualRadius / len1;
  const ratio2 = actualRadius / len2;

  const newPoint1 = {
    x: currentPoint.x - vec1X * ratio1,
    y: currentPoint.y - vec1Y * ratio1,
  };

  const newPoint2 = {
    x: currentPoint.x + vec2X * ratio2,
    y: currentPoint.y + vec2Y * ratio2,
  };

  // 计算控制点
  const controlPoint = calculateControlPoint(
    currentPoint,
    vec1X,
    vec1Y,
    vec2X,
    vec2Y,
    len1,
    len2,
    config
  );

  return {
    newPoint1,
    newPoint2,
    controlPoint,
    nextPoint,
  };
};

// 生成新的SVG路径字符串
const generatePathData = (points, curveIndex, config) => {
  if (points.length === 0) return "";

  let pathString = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    if (i === curveIndex && i > 0 && i < points.length - 1) {
      // 创建曲线段
      const curveData = createCurveSegment(points, i, config);
      
      // 连接到第一个新点
      pathString += ` L ${curveData.newPoint1.x} ${curveData.newPoint1.y}`;
      
      // 创建二次贝塞尔曲线到第二个新点
      pathString += ` Q ${curveData.controlPoint.x} ${curveData.controlPoint.y} ${curveData.newPoint2.x} ${curveData.newPoint2.y}`;
      
      // 如果还有下一个点，继续连接
      if (i < points.length - 1) {
        pathString += ` L ${curveData.nextPoint.x} ${curveData.nextPoint.y}`;
        i++; // 跳过下一个点，因为已经连接了
      }
    } else {
      // 普通直线连接
      pathString += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  return pathString;
};

// 验证输入参数
const validateInputs = (path, index, points) => {
  if (!path || typeof index !== "number") {
    console.warn("Invalid parameters: path and index are required");
    return false;
  }

  if (index < 0 || index >= points.length) {
    console.warn(
      `Index ${index} is out of range. Path has ${points.length} points.`
    );
    return false;
  }

  return true;
};

// 更新路径并重绘
const updatePathAndRedraw = (path, newPathData, index, config) => {
  path.data(newPathData);
  
  const layer = path.getLayer();
  if (layer) {
    layer.draw();
  }
  
  console.log(
    `Applied controllable curve to point at index ${index}`,
    config
  );
};

// 判断指定索引的点是否为曲线点
const isCurvePoint = (path, index) => {
  if (!path || typeof index !== "number") {
    console.warn("Invalid parameters: path and index are required");
    return false;
  }

  const currentData = path.data();
  const points = parsePathData(currentData);
  
  if (index < 0 || index >= points.length) {
    console.warn(`Index ${index} is out of range. Path has ${points.length} points.`);
    return false;
  }

  // 解析SVG路径命令，查找是否包含曲线命令
  const commands = currentData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
  
  let currentPointIndex = 0;
  let foundCurve = false;
  
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    const type = command[0].toUpperCase();
    const coords = command
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

    if (type === "M" || type === "L") {
      // 移动或直线命令
      for (let j = 0; j < coords.length; j += 2) {
        if (currentPointIndex === index) {
          // 检查下一个命令是否为曲线
          if (i + 1 < commands.length) {
            const nextCommand = commands[i + 1];
            const nextType = nextCommand[0].toUpperCase();
            if (nextType === "Q" || nextType === "C" || nextType === "S" || nextType === "T") {
              foundCurve = true;
            }
          }
          // 检查前一个命令是否为曲线且终点是当前点
          if (i > 0) {
            const prevCommand = commands[i - 1];
            const prevType = prevCommand[0].toUpperCase();
            if (prevType === "Q" || prevType === "C" || prevType === "S" || prevType === "T") {
              foundCurve = true;
            }
          }
        }
        currentPointIndex++;
      }
    } else if (type === "Q") {
      // 二次贝塞尔曲线
      if (currentPointIndex === index || currentPointIndex + 1 === index) {
        foundCurve = true;
      }
      currentPointIndex++; // Q命令只增加一个终点
    } else if (type === "C") {
      // 三次贝塞尔曲线
      if (currentPointIndex === index || currentPointIndex + 1 === index) {
        foundCurve = true;
      }
      currentPointIndex++; // C命令只增加一个终点
    }
  }
  
  return foundCurve;
};

// 将指定索引的曲线点恢复为默认直线点
const resetCurvePoint = (path, index) => {
  if (!path || typeof index !== "number") {
    console.warn("Invalid parameters: path and index are required");
    return false;
  }

  const currentData = path.data();
  const points = parsePathData(currentData);
  
  if (index < 0 || index >= points.length) {
    console.warn(`Index ${index} is out of range. Path has ${points.length} points.`);
    return false;
  }

  // 如果不是曲线点，直接返回
  if (!isCurvePoint(path, index)) {
    console.log(`Point at index ${index} is not a curve point.`);
    return true;
  }

  try {
    // 重新生成只包含直线的路径
    const newPathData = generateStraightPathData(points);
    
    // 更新路径
    path.data(newPathData);
    
    // 重绘图层
    const layer = path.getLayer();
    if (layer) {
      layer.draw();
    }
    
    console.log(`Reset curve point at index ${index} to straight line.`);
    return true;
  } catch (error) {
    console.error("Error resetting curve point:", error);
    return false;
  }
};

// 生成只包含直线的SVG路径字符串
const generateStraightPathData = (points) => {
  if (points.length === 0) return "";
  
  let pathString = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    pathString += ` L ${points[i].x} ${points[i].y}`;
  }
  
  return pathString;
};

// 批量重置所有曲线点为直线
const resetAllCurvePoints = (path) => {
  if (!path) {
    console.warn("Invalid parameter: path is required");
    return false;
  }

  try {
    const currentData = path.data();
    const points = parsePathData(currentData);
    
    // 生成只包含直线的路径
    const newPathData = generateStraightPathData(points);
    
    // 更新路径
    path.data(newPathData);
    
    // 重绘图层
    const layer = path.getLayer();
    if (layer) {
      layer.draw();
    }
    
    console.log("Reset all curve points to straight lines.");
    return true;
  } catch (error) {
    console.error("Error resetting all curve points:", error);
    return false;
  }
};

// 主函数：在指定索引处设置路径曲线
const setPathCurveAt = (path, index, options = {}) => {
  try {
    // 合并配置
    const config = { ...DEFAULT_CURVE_CONFIG, ...options };
    
    // 获取当前路径数据并解析
    const currentData = path.data();
    const points = parsePathData(currentData);
    
    // 验证输入参数
    if (!validateInputs(path, index, points)) {
      return;
    }
    
    // 如果当前点已经是曲线点，可以选择先重置
    if (isCurvePoint(path, index)) {
      console.log(`Point at index ${index} is already a curve point. Updating curve...`);
      // 可以选择先重置再设置新曲线，或者直接覆盖
      // resetCurvePoint(path, index);
    }
    
    // 生成新的路径数据
    const newPathData = generatePathData(points, index, config);
    
    // 更新路径并重绘
    updatePathAndRedraw(path, newPathData, index, config);
    
  } catch (error) {
    console.error("Error applying curve:", error);
  }
};
