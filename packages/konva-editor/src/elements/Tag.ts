import Konva from "konva";
import { omit } from "lodash";
import Node from "../node";
import type Group from "../group";
import type { NodeType, NodeConfig } from "../types";

export class Tag extends Node {
  className: NodeType = "Tag";
  name = "Tag";

  highlight() {}

  constructor(config: NodeConfig) {
    super(config);
  }

  setTransformer() {
    this.editor.tr.transformer.enabledAnchors([
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "middle-left",
      "middle-right",
      "top-center",
      "bottom-center",
    ]);
    this.editor.tr.transformer.rotateEnabled(true);
  }

  getCornerRadius() {}

  setCornerRadius(cornerRadius: number, groupId?: string) {}

  getAttrs() {
    return omit(this.imageGroup.getAttrs(), ["x", "y"]);
  }
}

export default Tag;
