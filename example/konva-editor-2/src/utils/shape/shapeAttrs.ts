import { Shape, ShapeConfig } from "konva/lib/Shape";
import { AttrKeyMap, FormItem } from "../../shapes";
import { Group } from "konva/lib/Group";

type Attrs = Record<string, FormItem & { value: any }>;
// 获取选中的组件可编辑的属性
export const getComponentAttrs = (target: Shape<ShapeConfig>) => {
  const FormData: { name: string; attrs: Attrs }[] = [];

  // 递归处理节点
  function traverse(node: Shape<ShapeConfig>) {
    const { name } = node.attrs;
    const attrs: Attrs = {};
    Object.keys(node.attrs).forEach((key) => {
      const base = AttrKeyMap[key];
      if (!base) return;
      attrs[key] = {
        ...base,
        value: node.attrs[key],
      };
    });
    FormData.push({
      name,
      attrs,
    });

    if (node.hasChildren && node.hasChildren()) {
      (node as unknown as Group).getChildren().forEach((child: any) => {
        traverse(child);
      });
    }
  }

  traverse(target);
  console.log(FormData);
  return FormData;
};
