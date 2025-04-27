import Konva from "konva";
import { createUUID } from "../../../../../utils";
import { defaultLineAnimate } from "./default";
import { flowLineAnimate } from "./flow";
import { getStage } from "../../../..";

export enum LineAnimateType {
  "default", // 默认虚线流动
  "flow", // 水流
  "dot", // 圆点动画
}

// 创建动画
export const createAnimateLine = (opt: {
  lineId: string;
  speed: number;
  type: LineAnimateType;
}) => {
  const targetLine = getStage()?.findOne(`#${opt.lineId}`) as Konva.Line;
  // 获取当前线的layer
  const layer = targetLine.getLayer();
  if (!layer) return;
  // 获取当前线的points
  const points = targetLine.points();
  // 创建一个线的动画节点
  const animateLine = new Konva.Line({
    points,
    id: createUUID(),
  });

  // 给targetLine设置一下绑定的动画节点
  targetLine.setAttrs({
    animateLineId: animateLine.getAttr("id"),
  });

  if (opt.type === LineAnimateType.default) {
    defaultLineAnimate(targetLine, animateLine);
  }

  if (opt.type === LineAnimateType.flow) {
    // 水流动画
    flowLineAnimate();
  }
  if (opt.type === LineAnimateType.dot) {
    // 圆点动画
  }

  layer.add(animateLine);
};

// 删除线的动画
export const deleteAnimateLine = () => {};

// 停止线的动画
export const stopAnimateLine = () => {};
