// 定义接口和类型
interface Point {
  x: number;
  y: number;
}

interface Segment {
  start: Point;
  end: Point;
}

interface Intersection {
  point: Point;
  segmentIndex: number;
  segment: Segment;
}

interface KonvaPath {
  data(): string;
  data(pathData: string): void;
  zIndex(): number;
  id(): string;
}

interface KonvaLayer {
  find(selector: string): KonvaPath[];
}

// 获取两个路径的相交点
function getPathIntersections(
  pathA: KonvaPath,
  pathB: KonvaPath
): Intersection[] {
  const intersections: Intersection[] = [];

  // 获取路径的数据
  const dataA: string = pathA.data();
  const dataB: string = pathB.data();

  // 解析路径为线段
  const segmentsA: Segment[] = parsePathToSegments(dataA);
  const segmentsB: Segment[] = parsePathToSegments(dataB);

  segmentsA.forEach((segA: Segment, indexA: number) => {
    segmentsB.forEach((segB: Segment) => {
      const intersection: Point | null = getLineIntersection(segA, segB);
      if (intersection) {
        intersections.push({
          point: intersection,
          segmentIndex: indexA,
          segment: segA,
        });
      }
    });
  });

  return intersections;
}

// 解析路径数据为线段
function parsePathToSegments(pathData: string): Segment[] {
  const segments: Segment[] = [];

  if (typeof pathData === "string") {
    // 解析SVG路径格式
    const commands: string[] =
      pathData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
    let currentPoint: Point | null = null;

    commands.forEach((cmd: string) => {
      const type: string = cmd[0].toUpperCase();
      const coords: number[] = cmd
        .slice(1)
        .trim()
        .split(/[,\s]+/)
        .map(Number)
        .filter((n: number) => !isNaN(n));

      if (type === "M") {
        currentPoint = { x: coords[0], y: coords[1] };
      } else if (type === "L" && currentPoint) {
        const endPoint: Point = { x: coords[0], y: coords[1] };
        segments.push({
          start: { ...currentPoint },
          end: { ...endPoint },
        });
        currentPoint = endPoint;
      }
    });
  }

  return segments;
}

// 计算两条线段的交点
function getLineIntersection(seg1: Segment, seg2: Segment): Point | null {
  const { start: p1, end: p2 } = seg1;
  const { start: p3, end: p4 } = seg2;

  const denom: number =
    (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);

  if (Math.abs(denom) < 1e-10) {
    return null; // 平行线
  }

  const t: number =
    ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
  const u: number =
    -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y),
    };
  }

  return null;
}

// 确定哪个路径在上层
function getUpperPath(pathA: KonvaPath, pathB: KonvaPath): KonvaPath {
  const zIndexA: number = pathA.zIndex() || 0;
  const zIndexB: number = pathB.zIndex() || 0;

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
function createArcAtIntersection(
  path: KonvaPath,
  intersection: Intersection,
  radius: number
): void {
  const pathData: string = path.data();
  const segments: Segment[] = parsePathToSegments(pathData);

  // 找到包含相交点的线段
  const targetSegment: Segment = intersection.segment;
  const segmentIndex: number = intersection.segmentIndex;

  // 计算弧形的起点和终点
  const direction: Point = {
    x: targetSegment.end.x - targetSegment.start.x,
    y: targetSegment.end.y - targetSegment.start.y,
  };

  const length: number = Math.sqrt(
    direction.x * direction.x + direction.y * direction.y
  );
  const unitDir: Point = {
    x: direction.x / length,
    y: direction.y / length,
  };

  // 计算弧形的起点和终点（在相交点前后各radius距离）
  const arcStart: Point = {
    x: intersection.point.x - unitDir.x * radius,
    y: intersection.point.y - unitDir.y * radius,
  };

  const arcEnd: Point = {
    x: intersection.point.x + unitDir.x * radius,
    y: intersection.point.y + unitDir.y * radius,
  };

  // 计算弧形的控制点（垂直于线段方向）
  const perpDir: Point = {
    x: -unitDir.y,
    y: unitDir.x,
  };

  const arcControl: Point = {
    x: intersection.point.x + perpDir.x * radius * 0.5,
    y: intersection.point.y + perpDir.y * radius * 0.5,
  };

  // 重新构建路径数据，将直线段替换为弧形
  const newPathData: string = reconstructPathWithArc(
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
function reconstructPathWithArc(
  originalPathData: string,
  segmentIndex: number,
  arcStart: Point,
  arcControl: Point,
  arcEnd: Point
): string {
  if (typeof originalPathData !== "string") {
    return originalPathData;
  }

  const commands: string[] =
    originalPathData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
  let newPathData: string = "";
  let currentSegmentIndex: number = -1;

  commands.forEach((cmd: string, index: number) => {
    const type: string = cmd[0].toUpperCase();

    if (type === "M") {
      newPathData += cmd;
    } else if (type === "L") {
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

// 处理路径相交的主函数
export const handlePathIntersections = (
  layer: KonvaLayer,
  arcRadius: number = 10
): void => {
  // 获取layer中所有的Path对象
  const paths: KonvaPath[] = layer.find("Path");

  if (paths.length < 2) {
    return; // 少于2个路径时无需处理相交
  }

  // 检测路径相交并处理
  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      const pathA: KonvaPath = paths[i];
      const pathB: KonvaPath = paths[j];

      // 检查两个路径是否相交
      const intersections: Intersection[] = getPathIntersections(pathA, pathB);

      if (intersections.length > 0) {
        // 确定哪个路径在上层（z-index更高）
        const upperPath: KonvaPath = getUpperPath(pathA, pathB);

        // 为上层路径在相交点处创建弧形
        intersections.forEach((intersection: Intersection) => {
          createArcAtIntersection(upperPath, intersection, arcRadius);
        });
      }
    }
  }
};
