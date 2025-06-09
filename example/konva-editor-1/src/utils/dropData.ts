import { ShapeInfo } from "../shapes";

// 设置
export const setDropData = (event: any, data: any) => {
  // 设置拖拽数据
  event.dataTransfer.setData("component", JSON.stringify(data));
};

// 获取
export const getDropData = (event: DragEvent) => {
  // 获取拖拽数据
  const data = event.dataTransfer!.getData("component");
  return JSON.parse(data) as ShapeInfo;
};
