const setPathCurveAt = (path, index, options = {}) => {
  if (!path || typeof index !== "number") {
    console.warn("Invalid parameters: path and index are required");
    return;
  }

  // 默认配置参数
  const config = {
    radius: 30, // 前后两个点的距离（圆角半径）
    height: 15, // 拉高/拉低的距离
    direction: "up", // 方向：'up'(拉高), 'down'(拉低), 'auto'(自动)
    radiusRatio: 0.3, // 圆角半径相对于线段长度的比例
    ...options,
  };

  // 获取当前路径数据
  const currentData = path.data();

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

  // 生成新的SVG路径字符串
  const generatePathData = (points, curveIndex) => {
    if (points.length === 0) return "";

    let pathString = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      if (i === curveIndex && i > 0 && i < points.length - 1) {
        // 在指定拐角处创建可控制的圆滑曲线
        const prevPoint = points[i - 1];
        const currentPoint = points[i];
        const nextPoint = points[i + 1];

        // 计算拐角的角度和距离
        const vec1X = currentPoint.x - prevPoint.x;
        const vec1Y = currentPoint.y - prevPoint.y;
        const vec2X = nextPoint.x - currentPoint.x;
        const vec2Y = nextPoint.y - currentPoint.y;

        const len1 = Math.sqrt(vec1X * vec1X + vec1Y * vec1Y);
        const len2 = Math.sqrt(vec2X * vec2X + vec2Y * vec2Y);

        // 计算实际的圆角半径
        let actualRadius;
        if (config.radius > 0) {
          // 使用固定半径，但不超过线段长度的限制
          actualRadius = Math.min(
            config.radius,
            len1 * config.radiusRatio,
            len2 * config.radiusRatio
          );
        } else {
          // 使用相对半径
          actualRadius = Math.min(len1, len2) * config.radiusRatio;
        }

        // 在当前点两端创建新的点
        const ratio1 = actualRadius / len1;
        const ratio2 = actualRadius / len2;

        const newPoint1X = currentPoint.x - vec1X * ratio1;
        const newPoint1Y = currentPoint.y - vec1Y * ratio1;

        const newPoint2X = currentPoint.x + vec2X * ratio2;
        const newPoint2Y = currentPoint.y + vec2Y * ratio2;

        // 计算控制点位置
        let controlX, controlY;

        if (config.direction === "auto") {
          // 自动计算法向量方向
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
        } else if (config.direction === "up") {
          // 向上拉高
          controlX = currentPoint.x;
          controlY = currentPoint.y - Math.abs(config.height);
        } else if (config.direction === "down") {
          // 向下拉低
          controlX = currentPoint.x;
          controlY = currentPoint.y + Math.abs(config.height);
        } else if (config.direction === "left") {
          // 向左偏移
          controlX = currentPoint.x - Math.abs(config.height);
          controlY = currentPoint.y;
        } else if (config.direction === "right") {
          // 向右偏移
          controlX = currentPoint.x + Math.abs(config.height);
          controlY = currentPoint.y;
        } else {
          // 自定义方向 {x: offsetX, y: offsetY}
          if (typeof config.direction === "object") {
            controlX = currentPoint.x + (config.direction.x || 0);
            controlY = currentPoint.y + (config.direction.y || 0);
          } else {
            // 默认向上
            controlX = currentPoint.x;
            controlY = currentPoint.y - Math.abs(config.height);
          }
        }

        // 连接到第一个新点
        pathString += ` L ${newPoint1X} ${newPoint1Y}`;

        // 创建二次贝塞尔曲线到第二个新点
        pathString += ` Q ${controlX} ${controlY} ${newPoint2X} ${newPoint2Y}`;

        // 如果还有下一个点，继续连接
        if (i < points.length - 1) {
          pathString += ` L ${nextPoint.x} ${nextPoint.y}`;
          i++; // 跳过下一个点，因为已经连接了
        }
      } else {
        // 普通直线连接
        pathString += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    return pathString;
  };

  try {
    // 解析当前路径
    const points = parsePathData(currentData);

    if (index < 0 || index >= points.length) {
      console.warn(
        `Index ${index} is out of range. Path has ${points.length} points.`
      );
      return;
    }

    // 生成新的路径数据
    const newPathData = generatePathData(points, index);

    // 更新路径
    path.data(newPathData);

    // 重绘图层
    const layer = path.getLayer();
    if (layer) {
      layer.draw();
    }

    console.log(
      `Applied controllable curve to point at index ${index}`,
      config
    );
  } catch (error) {
    console.error("Error applying curve:", error);
  }
};
