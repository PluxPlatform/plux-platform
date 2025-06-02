import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Stage } from "konva/lib/Stage";

// 获取组件
export const getCurrentComponent = (
  target: Stage | Shape<ShapeConfig>
): Shape<ShapeConfig> | false => {
  const nodeType = target.nodeType;

  if (nodeType === "Stage") return false;
  if (nodeType === "pipeline") return false;
  console.log(target);
  // @ts-ignore
  // 递归向上查找到第一个isComponent为true的节点
  if (target.attrs.isComponent) {
    return target as Shape<ShapeConfig>;
  } else {
    const parent = target.parent as unknown as Stage | Shape<ShapeConfig>;
    return getCurrentComponent(parent);
  }
};
