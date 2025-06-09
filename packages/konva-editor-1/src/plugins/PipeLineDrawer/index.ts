import Konva from "konva";
import { PipeLineNameSpace } from "./Draw";

export * from "./Draw";
export * from "./Editor";

export const isPipeLine = (node: Konva.Node) => {
  const name = node.getAttr("name");
  return name === PipeLineNameSpace.pathName;
};
