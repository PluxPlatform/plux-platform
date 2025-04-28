import Konva from "konva";
import { defaultLineAnimate } from "./default";
import { flowLineAnimate } from "./flow";
import { getStage } from "../../../core";
import { dotAnimate } from "./dot";

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
  // 动画的颜色
  animColor?: string;
}) => {
  const targetLine = getStage()?.findOne(`#${opt.lineId}`) as Konva.Line;

  if (!targetLine) return;
  // 获取当前线的layer
  const layer = targetLine.getLayer();

  if (!layer) return;
  let animateLineGroup: Konva.Group | null = null;
  // 创建动画线
  if (opt.type === LineAnimateType.default) {
    animateLineGroup = defaultLineAnimate(targetLine, opt.speed, opt.animColor);
  }

  if (opt.type === LineAnimateType.flow) {
    // 水流动画
    flowLineAnimate(targetLine, opt.speed, opt.animColor);
  }
  if (opt.type === LineAnimateType.dot) {
    // 圆点动画
    dotAnimate(targetLine, opt.speed, opt.animColor);
  }
  animateLineGroup && layer.add(animateLineGroup);
};

// 删除线的动画
export const deleteAnimateLine = () => {};

// 停止线的动画
export const stopAnimateLine = () => {};
