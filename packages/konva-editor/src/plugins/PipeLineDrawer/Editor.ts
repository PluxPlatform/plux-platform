import Konva from "konva";
import { Path } from "konva/lib/shapes/Path";
import { Stage } from "konva/lib/Stage";
import { LayerName } from "../../core/type";
import { Vector2d } from "konva/lib/types";
import { PipeLineNameSpace } from "./Draw";

function getClosestSegmentIndex(
  commands: {
    cmd: string;
    nums: number[];
  }[],
  mousePos: Vector2d
) {
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
function pointToSegmentDistance(
  p: Vector2d,
  a: { x: number; y: number },
  b: { x: number; y: number }
) {
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

const createPoint = (x: number, y: number) => {
  return new Konva.Circle({
    x,
    y,
    radius: 7,
    fill: "white",
    draggable: true,
    stroke: "blue",
    name: PipeLineNameSpace.anchorName,
    strokeWidth: 2,
    isComponent: true,
  });
};

// 简单解析SVG路径字符串，提取命令和点
const parsePath = (d: string) => {
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
// 当点击的元素是Path时，对Path进行编辑
export const editPath = (stage: Stage, path: Path) => {
  const layer = stage.findOne(`.${LayerName.PIPELINE}`) as Konva.Layer;
  let data = path.data();
  // 清空之前的锚点
  const Group = new Konva.Group({
    pathId: path.getAttr("id"),
    name: PipeLineNameSpace.anchorGroup,
  });

  let commands = parsePath(data);
  // 创建锚点
  const anchors = [];
  commands.forEach((item, idx) => {
    let points: number[][] = [];
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
      const anchor = createPoint(pt[0], pt[1]);

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
    // 获取相对于 layer 的 pointer 坐标
    const mousePos = layer.getRelativePointerPosition()!;
    const insertIndex = getClosestSegmentIndex(commands, mousePos);
    const newCmd = { cmd: "L", nums: [mousePos.x, mousePos.y] };
    console.log("points", layer);
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
      const anchor = createPoint(mousePos.x, mousePos.y);

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

export const clearEditPath = (stage: Stage) => {
  const layer = stage.findOne(`.${LayerName.PIPELINE}`) as Konva.Layer;
  // 移除所有锚点
  const anchorGroup = layer.findOne(PipeLineNameSpace.anchorGroup);
  if (anchorGroup) {
    const path = layer.findOne(`#${anchorGroup.getAttr("pathId")}`);
    path.off(`mousedown.add`);
    anchorGroup.destroy();
  }

  // 解绑路径上的 click 事件（只解绑 editPath 绑定的）
  layer.batchDraw();
};
