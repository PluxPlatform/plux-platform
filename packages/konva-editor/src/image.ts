import Konva from 'konva';
import { createImage } from './createImage';
import Node from './node';
import type Group from './group';
import type { NodeAttrs, NodeType, NodeConfig } from './types';

class Image extends Node {
  className: NodeType = 'Image';
  name = '图片';
  attrs: NodeAttrs;

  highlight() {}

  constructor(config: NodeConfig) {
    super(config);
    this.attrs = {
      src: config.attrs.src,
    };
    const {
      src = '/micro-assets/platform-web/close.png',
      x = 0,
      y = 0,
    } = config.attrs;
    this.group = new Konva.Group({
      ...config.attrs,
      x,
      y,
    });
    (config.layer as Group).add(this);
    this.init();
    this.editing();
    createImage(src, {
      width: config.attrs.width,
      height: config.attrs.height,
    }, this.group).then((image) => {
      this.imageGroup = image;
      this.group.add(image);
      const width = image.width();
      const height = image.height();
      this.group.setAttrs({
        width,
        height,
      });
    });
  }

  setTransformer() {
    const anchors = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    const { flipX, flipY } = this.group.getAttrs();
    if (!flipX) {
      anchors.push('middle-right', 'middle-left');
    }
    if (!flipY) {
      anchors.push('bottom-center', 'top-center');
    }
    this.editor.tr.transformer.enabledAnchors(anchors);
    this.editor.tr.transformer.rotateEnabled(true);
  }

  setWidth(width: number, groupId?: string) {
    const oldValue = this.getWidth();
    const { nodeId } = this;
    const v = width >= this.getMinWidth() ? width : this.getMinWidth();
    if (this.group.getAttr('flipX')) {
      this.group.x(this.group.x() - v + this.group.width());
      this.imageGroup?.offsetX(v);
    }
    this.group.width(v);
    this.group.skewX(0);
    this.group.skewY(0);
    this.imageGroup?.width(v);
    this.editor.tr.update();
    this.dr.set(oldValue, v, groupId).then((step) => {
      this.editor.history.add({
        title: '修改图片宽度',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Image;
          node?.setWidth(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Image;
          node?.setWidth(step.value);
        },
      });
    });
  }

  setHeight(height: number, groupId?: string) {
    const oldValue = this.getHeight();
    const { nodeId } = this;
    const v = height >= this.getMinHeight() ? height : this.getMinHeight();
    if (this.group.getAttr('flipY')) {
      this.group.y(this.group.y() - v + this.group.height());
      this.imageGroup?.offsetY(v);
    }
    this.group.height(v);
    this.group.skewX(0);
    this.group.skewY(0);
    this.imageGroup?.height(v);
    this.editor.tr.update();
    this.dr.set(oldValue, v, groupId).then((step) => {
      this.editor.history.add({
        title: '修改图片高度',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Image;
          node?.setHeight(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Image;
          node?.setHeight(step.value);
        },
      });
    });
  }

  getAttrs() {
    return this.attrs;
  }
}

export default Image;
