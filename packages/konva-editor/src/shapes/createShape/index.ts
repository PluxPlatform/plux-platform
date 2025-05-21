import { ShapeInfo } from "../defaultShaps";
import { Rect } from "konva/lib/shapes/Rect";
import { Circle } from "konva/lib/shapes/Circle";
import { Text } from "konva/lib/shapes/Text";
import { createUUID } from "../../utils";
import { LayersObj } from "../../core/type";
import { Group } from "konva/lib/Group";
import { createImage } from "./createImage";

// 递归创建图形，支持group坐标偏移
async function createNode(info: ShapeInfo) {
  const { type, name, attrs, children } = info;

  const nAttrs = {
    ...attrs,
    type,
    id: createUUID(),
    name,
    listening: true, // 默认开启监听
  };

  let node: any;

  if (children && children.length > 0) {
    node = new Group(nAttrs);
    for (const child of children) {
      const childNode = await createNode(child);
      node.add(childNode);
    }
  } else {
    switch (type) {
      case "Rect":
        node = new Rect(nAttrs);
        break;
      case "Circle":
        node = new Circle(nAttrs);
        break;
      case "Text":
        node = new Text(nAttrs);
        break;
      case "Image":
        node = await createImage(attrs);
        console.log("图片节点创建完成");
        break;
      default:
        throw new Error(`未知的图形类型: ${type}`);
    }
  }

  return node;
}

export const createShape = async (info: ShapeInfo, layers: LayersObj) => {
  info.attrs.isComponent = true;
  const shape = await createNode(info);
  console.log("aaa");
  // 默认添加到主图层
  layers.mainLayer.add(shape);
  layers.mainLayer.batchDraw();
};
