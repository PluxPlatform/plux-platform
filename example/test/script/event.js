// 创建唯一id
const createId = () => {
  return Math.random().toString(36).substring(2, 15);
};
function getTransformedPointerPosition(stage) {
  const pos = stage.getPointerPosition();
  const scale = stage.scale();
  const position = stage.position();
  return {
    x: (pos.x - position.x) / scale.x,
    y: (pos.y - position.y) / scale.y,
  };
}
const drawPath = (stage) => {
  let isDrawing = false;
  let startPoint = null;
  let path = null;
  let prevDraggable = [];

  stage.on("mousedown", (e) => {
    if (isDrawing) return;
    isDrawing = true;
    // 禁止其他元素拖动
    prevDraggable = [];
    stage
      .findOne("Layer")
      .getChildren()
      .forEach((node) => {
        if (node !== path && node.draggable()) {
          prevDraggable.push(node);
          node.draggable(false);
        }
      });
    const pos = getTransformedPointerPosition(stage);
    startPoint = pos;
    path = new Konva.Path({
      x: 0,
      y: 0,
      id: createId(),
      stroke: "blue",
      strokeWidth: 4,
      name: "pipLine",
      data: `M${pos.x},${pos.y} L${pos.x},${pos.y}`,
    });
    stage.findOne("Layer").add(path);
    stage.draw();
  });

  stage.on("mousemove", (e) => {
    if (!isDrawing || !path) return;
    const pos = getTransformedPointerPosition(stage);
    const data = `M${startPoint.x},${startPoint.y} L${pos.x},${pos.y}`;
    path.data(data);
    stage.draw();
  });

  stage.on("mouseup", (e) => {
    stage.off("mousedown");
    stage.off("mouseup");
    if (!isDrawing) return;
    isDrawing = false;
    // 恢复其他元素可拖动
    prevDraggable.forEach((node) => node.draggable(true));
    prevDraggable = [];
    path = null;
    startPoint = null;
  });
};

const Event = (stage) => {
  stage.on("click", (e) => {
    const target = e.target;
    clearEditPath(stage);
    if (target.className === "Path") {
      editPath(stage, target);
    }
  });
};

const getPath = (stage) => {
  const layer = stage.findOne("Layer");
  const paths = layer.find(".pipLine");
  return paths;
};

function getClosestSegmentIndex(commands, mousePos) {
  let minDist = Infinity;
  let index = -1;
  for (let i = 1; i < commands.length; i++) {
    const prev = commands[i - 1];
    const curr = commands[i];
    if (
      (prev.cmd === "M" || prev.cmd === "L") &&
      (curr.cmd === "L" || curr.cmd === "M")
    ) {
      const x1 = prev.nums[0];
      const y1 = prev.nums[1];
      const x2 = curr.nums[0];
      const y2 = curr.nums[1];
      const dist = pointToSegmentDistance(
        mousePos,
        { x: x1, y: y1 },
        { x: x2, y: y2 }
      );
      if (dist < minDist) {
        minDist = dist;
        index = i;
      }
    }
  }
  return index;
}

// 点到线段距离
function pointToSegmentDistance(p, a, b) {
  const A = p.x - a.x;
  const B = p.y - a.y;
  const C = b.x - a.x;
  const D = b.y - a.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = dot / lenSq;
  if (param < 0) param = 0;
  else if (param > 1) param = 1;

  const xx = a.x + param * C;
  const yy = a.y + param * D;
  const dx = p.x - xx;
  const dy = p.y - yy;

  return Math.sqrt(dx * dx + dy * dy);
}
// 当点击的元素是Path时，对Path进行编辑
const editPath = (stage, path) => {
  const layer = stage.findOne("Layer");
  let data = path.data();
  // 清空之前的锚点
  const Group = new Konva.Group({
    pathId: path.getAttr("id"),
    name: "anchorGroup",
  });
  // 简单解析SVG路径字符串，提取命令和点
  const parsePath = (d) => {
    const regex = /([MLC])([^MLC]*)/g;
    let match,
      result = [];
    while ((match = regex.exec(d))) {
      const cmd = match[1];
      const nums = match[2]
        .trim()
        .split(/[ ,]+/)
        .map(Number)
        .filter((v) => !isNaN(v));
      result.push({ cmd, nums });
    }
    return result;
  };
  let commands = parsePath(data);
  // 创建锚点
  const anchors = [];
  commands.forEach((item, idx) => {
    let points = [];
    if (item.cmd === "M" || item.cmd === "L") {
      points = [item.nums];
    } else if (item.cmd === "C") {
      points = [
        [item.nums[0], item.nums[1]],
        [item.nums[2], item.nums[3]],
        [item.nums[4], item.nums[5]],
      ];
    }
    points.forEach((pt, i) => {
      const anchor = new Konva.Circle({
        x: pt[0],
        y: pt[1],
        radius: 7,
        fill: i === points.length - 1 ? "red" : "orange",
        draggable: true,
        stroke: "white",
        name: "anchor",
        strokeWidth: 2,
      });
      Group.add(anchor);
      anchor.on("dragmove", () => {
        if (item.cmd === "M" || item.cmd === "L") {
          item.nums[0] = anchor.x();
          item.nums[1] = anchor.y();
        } else if (item.cmd === "C") {
          item.nums[i * 2] = anchor.x();
          item.nums[i * 2 + 1] = anchor.y();
        }
        // 重新拼接data
        let newData = commands
          .map((c) => c.cmd + " " + c.nums.join(" "))
          .join(" ");
        path.data(newData);
        layer.batchDraw();
      });
      anchors.push(anchor);
    });
  });
  layer.add(Group);

  // Path点击插入新锚点（以L为例）
  path.on("mousedown.add", (e) => {
    const mousePos = getTransformedPointerPosition(stage);
    const insertIndex = getClosestSegmentIndex(commands, mousePos);
    const newCmd = { cmd: "L", nums: [mousePos.x, mousePos.y] };

    if (insertIndex >= 0) {
      commands.splice(insertIndex, 0, newCmd);
    } else {
      commands.push(newCmd); // fallback，找不到就放最后
    }

    const newData = commands
      .map((c) => c.cmd + " " + c.nums.join(" "))
      .join(" ");
    path.data(newData);

    if (Group) {
      // 添加锚点
      const anchor = new Konva.Circle({
        x: mousePos.x,
        y: mousePos.y,
        radius: 7,
        fill: "red",
        draggable: true,
        stroke: "white",
        strokeWidth: 2,
        name: "anchor",
      });

      anchor.on("dragmove", () => {
        newCmd.nums[0] = anchor.x();
        newCmd.nums[1] = anchor.y();
        const newData = commands
          .map((c) => c.cmd + " " + c.nums.join(" "))
          .join(" ");
        path.data(newData);
        layer.batchDraw();
      });
      Group.add(anchor);
      anchors.push(anchor);
    }
    layer.batchDraw();
  });
};

const clearEditPath = (stage) => {
  const layer = stage.findOne("Layer");
  // 移除所有锚点
  const anchorGroup = layer.findOne(".anchorGroup");
  if (anchorGroup) {
    const path = layer.findOne(`#${anchorGroup.getAttr("pathId")}`);
    path.off(`mousedown.add`);
    anchorGroup.destroy();
  }

  // 解绑路径上的 click 事件（只解绑 editPath 绑定的）
  layer.batchDraw();
};
