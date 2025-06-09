const autoq = (layer, arcRadius = 10) => {
  // 获取layer中所有的Path对象
  const paths = layer.find('Path');
  
  if (paths.length < 2) {
    return; // 少于2个路径时无需处理相交
  }
  
  // 检测路径相交并处理
  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      const pathA = paths[i];
      const pathB = paths[j];
      
      // 检查两个路径是否相交
      const intersections = getPathIntersections(pathA, pathB);
      
      if (intersections.length > 0) {
        // 确定哪个路径在上层（z-index更高）
        const upperPath = getUpperPath(pathA, pathB);
        
        // 为上层路径在相交点处创建弧形
        intersections.forEach(intersection => {
          createArcAtIntersection(upperPath, intersection, arcRadius);
        });
      }
    }
  }
};

// 获取两个路径的相交点
function getPathIntersections(pathA, pathB) {
  const intersections = [];
  
  // 获取路径的数据
  const dataA = pathA.data();
  const dataB = pathB.data();
  
  // 解析路径为线段
  const segmentsA = parsePathToSegments(dataA);
  const segmentsB = parsePathToSegments(dataB);
  
  segmentsA.forEach((segA, indexA) => {
    segmentsB.forEach(segB => {
      const intersection = getLineIntersection(segA, segB);
      if (intersection) {
        intersections.push({
          point: intersection,
          segmentIndex: indexA,
          segment: segA
        });
      }
    });
  });
  
  return intersections;
}

// 解析路径数据为线段
function parsePathToSegments(pathData) {
  const segments = [];
  
  if (typeof pathData === 'string') {
    // 解析SVG路径格式
    const commands = pathData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
    let currentPoint = null;
    
    commands.forEach(cmd => {
      const type = cmd[0].toUpperCase();
      const coords = cmd.slice(1).trim().split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
      
      if (type === 'M') {
        currentPoint = { x: coords[0], y: coords[1] };
      } else if (type === 'L' && currentPoint) {
        const endPoint = { x: coords[0], y: coords[1] };
        segments.push({
          start: { ...currentPoint },
          end: { ...endPoint }
        });
        currentPoint = endPoint;
      }
    });
  }
  
  return segments;
}

// 计算两条线段的交点
function getLineIntersection(seg1, seg2) {
  const { start: p1, end: p2 } = seg1;
  const { start: p3, end: p4 } = seg2;
  
  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  
  if (Math.abs(denom) < 1e-10) {
    return null; // 平行线
  }
  
  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
  const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;
  
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y)
    };
  }
  
  return null;
}

// 确定哪个路径在上层
function getUpperPath(pathA, pathB) {
  const zIndexA = pathA.zIndex() || 0;
  const zIndexB = pathB.zIndex() || 0;
  
  if (zIndexA > zIndexB) {
    return pathA;
  } else if (zIndexB > zIndexA) {
    return pathB;
  } else {
    // 如果z-index相同，根据创建顺序或其他规则决定
    return pathA.id() > pathB.id() ? pathA : pathB;
  }
}

// 在相交点处为路径创建弧形
function createArcAtIntersection(path, intersection, radius) {
  const pathData = path.data();
  const segments = parsePathToSegments(pathData);
  
  // 找到包含相交点的线段
  const targetSegment = intersection.segment;
  const segmentIndex = intersection.segmentIndex;
  
  // 计算弧形的起点和终点
  const direction = {
    x: targetSegment.end.x - targetSegment.start.x,
    y: targetSegment.end.y - targetSegment.start.y
  };
  
  const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
  const unitDir = {
    x: direction.x / length,
    y: direction.y / length
  };
  
  // 计算弧形的起点和终点（在相交点前后各radius距离）
  const arcStart = {
    x: intersection.point.x - unitDir.x * radius,
    y: intersection.point.y - unitDir.y * radius
  };
  
  const arcEnd = {
    x: intersection.point.x + unitDir.x * radius,
    y: intersection.point.y + unitDir.y * radius
  };
  
  // 计算弧形的控制点（垂直于线段方向）
  const perpDir = {
    x: -unitDir.y,
    y: unitDir.x
  };
  
  const arcControl = {
    x: intersection.point.x + perpDir.x * radius * 0.5,
    y: intersection.point.y + perpDir.y * radius * 0.5
  };
  
  // 重新构建路径数据，将直线段替换为弧形
  const newPathData = reconstructPathWithArc(
    pathData, 
    segmentIndex, 
    arcStart, 
    arcControl, 
    arcEnd
  );
  
  // 更新路径数据
  path.data(newPathData);
}

// 重新构建包含弧形的路径数据
function reconstructPathWithArc(originalPathData, segmentIndex, arcStart, arcControl, arcEnd) {
  if (typeof originalPathData !== 'string') {
    return originalPathData;
  }
  
  const commands = originalPathData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
  let newPathData = '';
  let currentSegmentIndex = -1;
  
  commands.forEach((cmd, index) => {
    const type = cmd[0].toUpperCase();
    
    if (type === 'M') {
      newPathData += cmd;
    } else if (type === 'L') {
      currentSegmentIndex++;
      
      if (currentSegmentIndex === segmentIndex) {
        // 替换这个线段为弧形
        newPathData += ` L${arcStart.x},${arcStart.y}`;
        newPathData += ` Q${arcControl.x},${arcControl.y} ${arcEnd.x},${arcEnd.y}`;
      } else {
        newPathData += cmd;
      }
    } else {
      newPathData += cmd;
    }
  });
  
  return newPathData;
}