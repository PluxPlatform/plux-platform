import { ShapeInfo } from "../defaultShaps";
import { Rect } from "konva/lib/shapes/Rect";
import { Circle } from "konva/lib/shapes/Circle";
import { Text } from "konva/lib/shapes/Text";
import { createUUID } from "../../utils";
import { Group } from "konva/lib/Group";
import { createImage } from "./createImage";
import { Stage } from "konva/lib/Stage";
import { Layer } from "konva/lib/Layer";
import { Image } from "konva/lib/shapes/Image";

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
        const img = (await createImage(attrs)) as any;
        node = new Image({
          ...attrs,
          name: "图片",
          image: img,
        });
        break;
      default:
        throw new Error(`未知的图形类型: ${type}`);
    }
  }

  return node;
}

export const createShape = async (info: ShapeInfo, stage: Stage) => {
  info.attrs.isComponent = true;
  const shape = await createNode(info);
  // 默认添加到主图层
  const layer = stage.findOne(".mainLayer") as Layer;
  layer.add(shape);

  return shape;
};
