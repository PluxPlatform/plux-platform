import Konva from 'konva';
import _ from 'lodash';
import { uuid } from './uuid';
import Port from './port';

import type {
  NodeType,
  NodeId,
  Value,
  NodeAttrs,
  ExportObject,
} from './types';
import type Editor from './editor';
import type Group from './group';
import type Line from './line';
import { DebounceRecord } from './util';

type Start = {
  startScaleX: number;
  startScaleY: number;
  activeAnchor: string;
} | null;

abstract class Node {
  abstract className: NodeType;
  nodeId: NodeId = uuid();
  isNode: boolean = false;
  layer: Group;
  group!: Konva.Group;
  imageGroup?: Konva.Group | Konva.Image;
  editor: Editor;
  selected: boolean = false;
  minWidth: number | (() => number) = 10;
  minHeight: number = 10;
  portsGroup?: Konva.Group;
  ports?: Port[];
  events: Record<string, ((node: Node, mechanical?: boolean) => void)[]>;
  dr: DebounceRecord;
  
  constructor(attrs: NodeConfig) {
    this.editor = attrs.editor;
    this.layer = attrs.layer;
    this.events = {
      move: [],
    };
    this.dr = new DebounceRecord();
  }

  bindEvent(
    type: string,
    event: Konva.KonvaEventObject<MouseEvent>,
    dontSelect: Value | boolean = false,
  ) {
    if (this.editor) {
      this.editor.onClick({
        type,
        event,
        nodeId: this.nodeId,
      });
      if (this.editor.options.isEdit && dontSelect !== true) {
        const { mode } = this.editor.options;
        if (mode === 'A') {
          this.editor.tr.checkSelected(this, event.evt).then(() => {
            this.layer.click(this, event);
          });
        } else if (mode === 'R') {
          if (this.className === 'Rect') {
            this.select(event.evt);
          }
        } else if (mode === 'T') {
          if (this.className === 'Text') {
            this.select(event.evt);
          }
        }
      }
    }
  }

  init() {
    this.group.on('click tap', (event) => this.bindEvent('thingImage', event));
    this.portsGroup = new Konva.Group({
      ...this.group.getAttrs(),
      x: 0,
      y: 0,
      name: 'portsGroup',
    });
    this.group.add(this.portsGroup);
    this.portsGroup.moveToTop();
  }

  getGroupSize() {
    return this.editor.getGroupSize(this.group);
  }

  on(eventName: string, callback: (node: Node, mechanical?: boolean) => void) {
    this.events[eventName].push(callback);
  }

  trigger(eventName: string, mechanical?: boolean) {
    if (this.events[eventName]) {
      _.each(this.events[eventName], (callback) => {
        callback(this, mechanical);
      });
    }
  }

  getX() {
    return this.getGroupSize().minX;
  }

  setX(val: number, groupId?: string, mechanical?: boolean) {
    const oldValue = this.getX();
    const { nodeId } = this;
    this.group.x(this.group.x() - oldValue + val);
    this.trigger('move', mechanical);
    this.dr.set(oldValue, val, groupId).then((step) => {
      this.editor.history.add({
        title: '修改横坐标',
        groupId: step.groupId,
        undo: () => {
          this.editor.findNode(nodeId)?.setX(step.oldValue);
        },
        redo: () => {
          this.editor.findNode(nodeId)?.setX(step.value);
        },
      });
    });
  }

  getY() {
    return this.getGroupSize().minY;
  }

  setY(val: number, groupId?: string, mechanical?: boolean) {
    const oldValue = this.getY();
    const { nodeId } = this;
    this.group.y(this.group.y() - oldValue + val);
    this.trigger('move', mechanical);
    this.dr.set(oldValue, val, groupId).then((step) => {
      this.editor.history.add({
        title: '修改纵坐标',
        groupId: step.groupId,
        undo: () => {
          this.editor.findNode(nodeId)?.setY(step.oldValue);
        },
        redo: () => {
          this.editor.findNode(nodeId)?.setY(step.value);
        },
      });
    });
  }

  getRotation() {
    return this.group.rotation();
  }

  setRotation(val: number, groupId?: string) {
    const oldValue = this.getRotation();
    const { nodeId } = this;
    const v = val || 0;
    this.group.rotation(v);
    this.trigger('move');
    this.dr.set(oldValue, val, groupId).then((step) => {
      this.editor.history.add({
        title: '修改角度',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Node;
          node?.setRotation(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Node;
          node?.setRotation(step.value);
        },
      });
    });
  }

  getScale() {
    const scale = this.group.scaleX();
    return Math.abs(scale * 100);
  }

  setScale(val: number, groupId?: string) {
    const oldValue = this.getScale();
    const { nodeId } = this;
    const v = val || 100;
    const x = this.group.scaleX();
    const y = this.group.scaleY();
    this.group.scaleX(v / (x < 0 ? -100 : 100));
    this.group.scaleY(v / (y < 0 ? -100 : 100));
    this.trigger('move');
    this.dr.set(oldValue, val, groupId).then((step) => {
      this.editor.history.add({
        title: '修改缩放比例',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Node;
          node?.setScale(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Node;
          node?.setScale(step.value);
        },
      });
    });
  }

  getWidth() {
    return this.group.width();
  }

  setWidth(width: number, groupId?: string) {}

  getHeight() {
    return this.group.height();
  }

  setHeight(height: number, groupId?: string) {}

  transformChange(callback: (start: Start, movementX: number, movementY: number) => void) {
    let start: Start = null;
    this.group.on('transformstart', () => {
      const activeAnchor = this.editor.tr.transformer.getActiveAnchor();
      if (
        activeAnchor === 'middle-right'
        || activeAnchor === 'middle-left'
        || activeAnchor === 'top-center'
        || activeAnchor === 'bottom-center'
      ) {
        start = {
          startScaleX: this.group.scaleX(),
          startScaleY: this.group.scaleY(),
          activeAnchor,
        };
      }
    });
    this.group.on('transform', ({ evt }) => {
      if (start) {
        const layerScale = this.editor.mainLayer.scaleX();
        const groupScale = Math.abs(this.group.scaleX());
        const scale = layerScale * groupScale;
        const movementX = evt.movementX / scale;
        const movementY = evt.movementY / scale;
        callback(start, movementX, movementY);
      }
      this.trigger('move');
    });
    this.group.on('transformend', () => {
      start = null;
    });
  }

  highlight(highlight: boolean | string) {}

  editing() {
    if (this.editor.options.isEdit) {
      this.group.on('dragmove', () => {
        if (this.selected) {
          this.editor.move(this);
          this.trigger('move');
        }
      });
      this.group.on('mouseover', () => {
        this.highlight(true);
        this.editor.pointer(true);
      });
      this.group.on('mouseout', () => {
        this.highlight(false);
        this.editor.pointer(false);
      });
      this.group.on('mousedown', ({ evt }) => {
        if (
          (
            this.isNode
            || this.className === 'Rect'
            || this.className === 'Text'
          )
          && this.editor.options.mode === 'E'
          && !_.some(this.ports, (port) => port.isFixed)
        ) {
          this.editor.createLine(this.nodeId, evt.offsetX, evt.offsetY);
        }
      });
      this.group.on('mouseup', () => {
        if (
          (
            this.isNode
            || this.className === 'Rect'
            || this.className === 'Text'
          )
          && this.editor.options.mode === 'E'
          && !_.some(this.ports, (port) => port.isFixed)
        ) {
          this.editor.createLineDone(this.nodeId);
        }
      });
      this.transformChange((start, movementX, movementY) => {
        if (start) {
          const { startScaleX, startScaleY, activeAnchor } = start;
          this.group.scaleX(startScaleX);
          this.group.scaleY(startScaleY);
          if (activeAnchor === 'middle-right' || activeAnchor === 'middle-left') {
            let newWidth = this.getWidth();
            if (activeAnchor === 'middle-right') {
              newWidth += movementX;
            } else {
              newWidth -= movementX;
            }
            if (newWidth >= this.getMinWidth()) {
              this.setWidth(newWidth);
              this.editor.tr.update();
            } else {
              this.editor.tr.transformer.stopTransform();
            }
          } else {
            let newHeight = this.getHeight();
            if (activeAnchor === 'bottom-center') {
              newHeight += movementY;
            } else {
              newHeight -= movementY;
            }
            if (newHeight >= this.minHeight) {
              this.setHeight(newHeight);
              this.editor.tr.update();
            } else {
              this.editor.tr.transformer.stopTransform();
            }
          }
        }
      });
    }
  }

  cloneGroup() {
    const attrs = { ...this.group.getAttrs() };
    if (attrs.scaleX && attrs.scaleX < 0) {
      attrs.scaleX = Math.abs(attrs.scaleX);
      attrs.offsetX = -(attrs.offsetX || 0) + (attrs.width || 0);
    }
    if (attrs.scaleY && attrs.scaleY < 0) {
      attrs.scaleY = Math.abs(attrs.scaleY);
      attrs.offsetY = -(attrs.offsetY || 0) + (attrs.height || 0);
    }
    return new Konva.Group(attrs);
  }

  getMinWidth() {
    if (_.isNumber(this.minWidth)) {
      return this.minWidth;
    }
    return this.minWidth();
  }

  get() {
    return this.group;
  }

  setTransformer() {
    this.editor.tr.transformer.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right']);
    this.editor.tr.transformer.rotateEnabled(true);
  }

  select(event?: MouseEvent | KeyboardEvent, force = false) {
    this.editor.tr.set(this, event, force);
    this.selected = true;
    this.group.draggable(true);
  }

  unSelect() {
    this.selected = false;
    this.group.draggable(false);
  }

  destroy(skipClear = false) {
    this.group.destroy();
    if (!skipClear) {
      this.layer.remove(this);
    }
    if (this.ports?.length) {
      _.each(this.ports, (port) => {
        port.destroy(true);
      });
      this.ports = [];
    }
    this.editor.tr.clear();
    this.editor.pointer(false);
  }

  setPort(pos: number[], line: Line) {
    const port = new Port(this, pos, line, {
      onDestroy: (p) => {
        if (this.ports) {
          const index = this.ports.indexOf(p);
          this.ports.splice(index, 1);
        }
      },
    });
    this.ports?.push(port);
    return port;
  }

  onMove(mechanical?: boolean) {
    this.trigger('move', mechanical);
  }

  getAttrs(): NodeAttrs {
    return {};
  }

  getTemplate() {
    return _.omit(this.group.getAttrs(), ['draggable', 'cdata']);
  }

  setTemplate(attrs: Konva.GroupConfig) {
    this.group.setAttrs(_.defaults({ ...attrs }, {
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0,
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      skewY: 0,
      rotation: 0,
    }));
  }

  getData(parentId?: NodeId): ExportObject {
    return {
      type: this.className,
      nodeId: this.nodeId,
      parentId,
      attrs: {
        ...this.getTemplate(),
        ...this.getAttrs(),
      },
    };
  }

  moveUp() {
    this.group.moveUp();
    this.layer.moveUp(this);
  }

  moveDown() {
    this.group.moveDown();
    this.layer.moveDown(this);
  }

  moveToTop() {
    this.group.moveToTop();
    this.layer.moveToTop(this);
  }

  moveToBottom() {
    this.group.moveToBottom();
    this.layer.moveToBottom(this);
  }

  updatePorts() {
    const { flipX, flipY } = this.group.getAttrs();
    const width = this.imageGroup!.width();
    const height = this.imageGroup!.height();
    const orientation = {
      top: [width / 2, -24],
      bottom: [width / 2, height],
      left: [15, 5],
      right: [width - 15, 5],
    };
    _.each(this.ports, ({ isFixed, position, port }) => {
      if (isFixed && position) {
        const pos = [
          flipX ? (width - orientation[position][0]) : orientation[position][0],
          flipY ? (height - orientation[position][1]) : orientation[position][1],
        ];
        port.x(pos[0]);
        port.y(pos[1]);
      }
    });
  }

  flipX() {
    const flipX = !this.group.getAttr('flipX');
    this.group.setAttr('flipX', flipX);
    this.imageGroup.scaleX(flipX ? -1 : 1);
    this.imageGroup.offsetX(flipX ? this.group.width() : 0);
    this.updatePorts();
  }

  flipY() {
    const flipY = !this.group.getAttr('flipY');
    this.group.setAttr('flipY', flipY);
    this.imageGroup?.scaleY(flipY ? -1 : 1);
    this.imageGroup?.offsetY(flipY ? this.group.height() : 0);
    this.updatePorts();
  }

  moveTo(group: Group) {
    this.layer.remove(this);
    this.layer = group;
    group.moveIn(this);
  }

  getSelected() {
    if (this.selected) {
      return this;
    }
    return this.layer.getSelected();
  }
}

export default Node;
