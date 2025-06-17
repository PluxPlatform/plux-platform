import Konva from "konva";
import Node from "../node";
import type Group from "../group";
import type { NodeAttrs, NodeConfig, NodeType } from "../types";

export class Button extends Node {
  className: NodeType = "Button";
  name = "按钮";
  attrs: NodeAttrs;
  highlight() {}

  buttonRect: Konva.Rect;
  buttonText: Konva.Text;

  constructor(config: NodeConfig) {
    super(config);
    const {
      width = 58,
      height = 30,
      text = "按钮",
      type = "primary",
      borderRadius = 4,
      fontSize = 14,
      backgroundColor = "",
      color = "",
      padding = [8, 15],
    } = config.attrs;
    this.attrs = {
      text,
      type,
      borderRadius,
      fontSize,
      backgroundColor,
      color,
      padding,
    };
    this.minWidth = () => this.buttonText.width() + this.attrs.padding[1] * 2;
    this.minHeight = () => this.buttonText.height() + this.attrs.padding[0] * 2;
    this.group = new Konva.Group({
      ...config.attrs,
      width,
      height,
    });
    (config.layer as Group).add(this);
    this.init();
    this.editing();
    this.imageGroup = new Konva.Group();
    this.group.add(this.imageGroup);
    this.buttonRect = new Konva.Rect({
      name: "button",
      width,
      height,
      fill: this.getBackgroundColor(),
      cornerRadius: borderRadius,
    });
    this.buttonText = new Konva.Text({
      name: "button",
      text: this.attrs.text,
      fontSize,
      fill: this.getTextColor(),
    });
    this.buttonText.x(width / 2 - this.buttonText.width() / 2);
    this.buttonText.y(height / 2 - this.buttonText.height() / 2 + 1);
    this.imageGroup.add(this.buttonRect, this.buttonText);
  }

  getBackgroundColor() {
    const { backgroundColor, type } = this.attrs;
    if (backgroundColor) {
      return backgroundColor;
    }
    if (type === "primary") {
      return "#409EFF";
    }
    if (type === "success") {
      return "#67C23A";
    }
    if (type === "danger") {
      return "#F56C6C";
    }
    if (type === "warning") {
      return "#E6A23C";
    }
    if (type === "info") {
      return "#909399";
    }
    return "";
  }

  getTextColor() {
    const { color, type } = this.attrs;
    if (color) {
      return color;
    }
    if (type === "default" || !type) {
      return "#606266";
    }
    return "#ffffff";
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

  getText() {
    return this.attrs.text;
  }

  setText(text: string, groupId?: string) {
    const oldValue = this.getText();
    const { nodeId } = this;
    this.attrs.text = text;
    this.buttonText.text(text);
    const newRectWidth = this.buttonText.width() + this.attrs.padding[1] * 2;
    if (this.buttonRect.width() < newRectWidth) {
      this.group.width(newRectWidth);
      this.buttonRect.width(newRectWidth);
    } else {
      this.buttonText.x(
        this.buttonRect.width() / 2 - this.buttonText.width() / 2
      );
    }
    this.editor.tr.update();
    this.dr.set(oldValue, text, groupId).then((step) => {
      this.editor.history.add({
        title: "修改按钮文字",
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Button;
          node?.setText(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Button;
          node?.setText(step.value);
        },
      });
    });
  }

  afterSetWidth(width: number) {
    this.buttonRect.width(width);
    this.buttonText.x(width / 2 - this.buttonText.width() / 2);
  }

  afterSetHeight(height: number) {
    this.buttonRect.height(height);
    this.buttonText.y(height / 2 - this.buttonText.height() / 2 + 1);
  }

  getType() {
    return this.attrs.type;
  }

  setType(type: string, groupId?: string) {
    const oldValue = this.getType();
    const { nodeId } = this;
    this.attrs.type = type;
    this.buttonRect.fill(this.getBackgroundColor());
    this.buttonText.fill(this.getTextColor());
    this.dr.set(oldValue, type, groupId).then((step) => {
      this.editor.history.add({
        title: "修改按钮类型",
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Button;
          node?.setType(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Button;
          node?.setType(step.value);
        },
      });
    });
  }
}

export default Button;
