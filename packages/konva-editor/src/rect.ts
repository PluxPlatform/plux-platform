import Konva from 'konva';
import { omit } from 'lodash';
import Node from './node';
import type Group from './group';
import type { NodeType, NodeConfig } from './types';

class Rect extends Node {
  className: NodeType = 'Rect';
  imageGroup: Konva.Rect;

  highlight() {}

  constructor(config: NodeConfig) {
    super(config);
    this.minWidth = 1;
    this.minHeight = 1;
    const {
      x = 0,
      y = 0,
      width = 100,
      height = 100,
      stroke = '#d8d8d8',
      strokeWidth = 1,
      fill = '#d8d8d8',
      cornerRadius = 0,
    } = config.attrs;
    this.group = new Konva.Group({
      ...config.attrs,
      x,
      y,
      width,
      height,
    });
    (config.layer as Group).add(this);
    this.init();
    this.editing();
    this.imageGroup = new Konva.Rect({
      name: 'rect',
      x: 0,
      y: 0,
      width,
      height,
      stroke,
      strokeWidth,
      fill,
      cornerRadius,
    });
    this.group.add(this.imageGroup);
  }

  setTransformer() {
    this.editor.tr.transformer.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']);
    this.editor.tr.transformer.rotateEnabled(true);
  }

  setWidth(width: number, groupId?: string) {
    const oldValue = this.getWidth();
    const { nodeId } = this;
    const v = width >= this.getMinWidth() ? width : this.getMinWidth();
    this.group.skewX(0);
    this.group.skewY(0);
    this.group.width(v);
    this.imageGroup.width(v);
    this.editor.tr.update();
    this.dr.set(oldValue, v, groupId).then((step) => {
      this.editor.history.add({
        title: '修改矩形宽度',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setWidth(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setWidth(step.value);
        },
      });
    });
  }

  setHeight(height: number, groupId?: string) {
    const oldValue = this.getHeight();
    const { nodeId } = this;
    const v = height >= this.minHeight ? height : this.minHeight;
    this.group.skewX(0);
    this.group.skewY(0);
    this.group.height(v);
    this.imageGroup.height(v);
    this.editor.tr.update();
    this.dr.set(oldValue, v, groupId).then((step) => {
      this.editor.history.add({
        title: '修改矩形高度',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setHeight(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setHeight(step.value);
        },
      });
    });
  }

  getFill() {
    return this.imageGroup.fill() as string;
  }

  setFill(color: string, groupId?: string) {
    const oldValue = this.getFill();
    const { nodeId } = this;
    this.imageGroup.fill(color);
    this.dr.set(oldValue, color, groupId).then((step) => {
      this.editor.history.add({
        title: '修改矩形填充颜色',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setFill(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setFill(step.value);
        },
      });
    });
  }

  getStroke() {
    return this.imageGroup.stroke() as string;
  }

  setStroke(color: string, groupId?: string) {
    const oldValue = this.getStroke();
    const { nodeId } = this;
    this.imageGroup.stroke(color);
    this.dr.set(oldValue, color, groupId).then((step) => {
      this.editor.history.add({
        title: '修改矩形边框颜色',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setStroke(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setStroke(step.value);
        },
      });
    });
  }

  getStrokeWidth() {
    return this.imageGroup.strokeWidth();
  }

  setStrokeWidth(strokeWidth: number, groupId?: string) {
    const oldValue = this.getStrokeWidth();
    const { nodeId } = this;
    this.imageGroup.strokeWidth(strokeWidth);
    this.editor.tr.update();
    this.dr.set(oldValue, strokeWidth, groupId).then((step) => {
      this.editor.history.add({
        title: '修改矩形边框宽度',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setStrokeWidth(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setStrokeWidth(step.value);
        },
      });
    });
  }

  getCornerRadius() {
    return this.imageGroup.cornerRadius() as number;
  }

  setCornerRadius(cornerRadius: number, groupId?: string) {
    const oldValue = this.getCornerRadius();
    const { nodeId } = this;
    this.imageGroup.cornerRadius(cornerRadius);
    this.dr.set(oldValue, cornerRadius, groupId).then((step) => {
      this.editor.history.add({
        title: '修改矩形圆角',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setCornerRadius(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Rect;
          node?.setCornerRadius(step.value);
        },
      });
    });
  }

  getAttrs() {
    return omit(this.imageGroup.getAttrs(), ['x', 'y']);
  }
}

export default Rect;
