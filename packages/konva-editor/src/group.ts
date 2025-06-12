/* eslint-disable class-methods-use-this */
import {
  map,
  each,
  includes,
  omit,
} from 'lodash';
import Konva from 'konva';
import Node from './node';
import { DebounceRecord } from './util';
// import type Port from './port';
import type {
  NodeId,
  ExportObject,
  NodeConfig,
  NodeType,
} from './types';

interface GroupConfig extends NodeConfig {
  root?: boolean;
}

export class Group extends Node {

  highlight() {}

  className: NodeType = 'Group';

  root: boolean;

  children: Node[];

  type?: string;

  parent: Group | null;

  dr: DebounceRecord;

  // ports: Port[];

  constructor(config: GroupConfig) {
    super(config);
    const {
      root = false,
      attrs = { x: 0, y: 0 },
      layer,
    } = config;
    this.parent = layer instanceof Group ? layer : null;
    this.type = attrs.type;
    this.children = [];
    this.root = root;
    this.group = new Konva.Group(attrs);
    this.dr = new DebounceRecord();
    this.isNode = false;
    // this.ports = [];
    if (this.layer instanceof Group) {
      this.layer.add(this);
    } else {
      this.layer.add(this.group);
    }
    if (this.editor.options.isEdit) {
      this.group.on('dragmove', () => {
        if (this.editor.tr.include(this)) {
          this.editor.move(this);
          each(this.children, (node) => {
            node.onMove();
          });
        }
      });
    }
  }

  onMove(mechanical?: boolean) {
    each(this.children, (node) => {
      node.onMove(mechanical);
    });
  }

  getGroupSize() {
    if (this.children.length) {
      let ix = Infinity;
      let iy = Infinity;
      let ax = -Infinity;
      let ay = -Infinity;
      each(this.children, (node) => {
        const {
          minX, minY, maxX, maxY,
        } = node.getGroupSize();
        ix = Math.min(ix, minX);
        iy = Math.min(iy, minY);
        ax = Math.max(ax, maxX);
        ay = Math.max(ay, maxY);
      });
      return {
        width: ax - ix,
        height: ay - iy,
        minX: ix,
        minY: iy,
        maxX: ax,
        maxY: ay,
      };
    }
    return {
      width: 0,
      height: 0,
      minX: this.group.x(),
      minY: this.group.y(),
      maxX: this.group.x(),
      maxY: this.group.y(),
    };
  }

  getX(): number {
    return this.getGroupSize().minX;
  }

  setX(val: number, groupId?: string, mechanical?: boolean) {
    const oldValue = this.getX();
    const { nodeId } = this;
    this.group.x(this.group.x() - this.getX() + val);
    this.onMove(mechanical);
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

  getY(): number {
    return this.getGroupSize().minY;
  }

  setY(val: number, groupId?: string, mechanical?: boolean) {
    const oldValue = this.getY();
    const { nodeId } = this;
    this.group.y(this.group.y() - this.getY() + val);
    this.onMove(mechanical);
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

  getWidth() {
    return this.getGroupSize().width;
  }

  setWidth() {}

  getHeight() {
    return this.getGroupSize().height;
  }

  setHeight() {}

  getScale() {
    return this.group.scaleX();
  }

  setScale() {}

  getRotation() {
    return this.group.rotation();
  }

  setRotation() {}

  add(...nodes: Node[]) {
    this.children.push(...nodes);
    this.group.add(...map(nodes, (node) => node.get()));
  }

  addNatural(...nodes: (Konva.Group | Konva.Shape)[]) {
    this.group.add(...nodes);
  }

  draw() {
    this.group.draw();
  }

  get() {
    return this.group;
  }

  setTransformer() {
    this.editor.tr.transformer.enabledAnchors([]);
    this.editor.tr.transformer.rotateEnabled(false);
  }

  select(event?: MouseEvent | KeyboardEvent, force = false) {
    this.editor.tr.set(this, event, force);
    this.selected = true;
    this.group.draggable(true);
  }

  unSelect(currentGroup?: Group) {
    if (!currentGroup || currentGroup !== this) {
      this.selected = false;
    }
    this.group.draggable(false);
    each(this.children, (child) => {
      child.unSelect();
    });
  }

  click(target: Node, event?: Konva.KonvaEventObject<MouseEvent>) {
    if (this.editor.options.mode === 'A') {
      if (this.root || this.selected) {
        this.editor.tr.checkSelected(this, event?.evt).then(() => {
          target.select(event?.evt);
        });
      } else if (this.layer instanceof Group) {
        this.layer.click(this, event);
      }
    }
  }

  getChildren(filter = () => true) {
    return this.group.getChildren(filter);
  }

  getIndex(target: Node) {
    return this.children.indexOf(target);
  }

  remove(child: Node) {
    const index = this.getIndex(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      if (this.children.length === 0 && !this.root) {
        this.destroy();
      }
    }
  }

  destroy(skipClear = false) {
    if (this.layer instanceof Group) {
      this.group.destroy();
      if (!skipClear) {
        this.layer.remove(this);
      }
    }
    each(this.children, (node) => {
      node.destroy(true);
    });
    this.editor.deleteNodeId(this.nodeId);
    this.children = [];
  }

  getData(parentId?: NodeId) {
    const datas: ExportObject[] = [];
    let pid: NodeId;
    if (!this.root) {
      pid = this.nodeId;
      datas.push({
        type: 'Group',
        nodeId: this.nodeId,
        parentId,
        attrs: {
          ...this.group.getAttrs(),
        },
      });
    }
    each(this.children, (item) => {
      if (item instanceof Group) {
        datas.push(...item.getData(pid));
      } else {
        datas.push(item.getData(pid) as ExportObject);
      }
    });
    return datas;
  }

  tid() {
    return this.group.attrs.tid;
  }

  moveUp(target?: Node) {
    if (target) {
      const index = this.getIndex(target);
      if (index !== -1 && index < this.children.length - 1) {
        this.children.splice(index, 1);
        this.children.splice(index + 1, 0, target);
      }
    } else {
      this.group.moveUp();
      if (!this.root) {
        this.layer.moveUp(this);
      }
    }
  }

  moveDown(target?: Node) {
    if (target) {
      const index = this.getIndex(target);
      if (index > 0) {
        this.children.splice(index, 1);
        this.children.splice(index - 1, 0, target);
      }
    } else {
      this.group.moveDown();
      if (!this.root) {
        this.layer.moveDown(this);
      }
    }
  }

  moveToTop(target?: Node) {
    if (target) {
      const index = this.getIndex(target);
      if (index !== -1 && index < this.children.length - 1) {
        this.children.splice(index, 1);
        this.children.push(target);
      }
    } else {
      this.group.moveToTop();
      if (!this.root) {
        this.layer.moveToTop(this);
      }
    }
  }

  moveToBottom(target?: Node) {
    if (target) {
      const index = this.getIndex(target);
      if (index > 0) {
        this.children.splice(index, 1);
        this.children.unshift(target);
      }
    } else {
      this.group.moveToBottom();
      if (!this.root) {
        this.layer.moveToBottom(this);
      }
    }
  }

  moveIn(node: Node) {
    this.children.push(node);
    node.get().moveTo(this.group);
  }

  moveTo(group: Group) {
    this.layer.remove(this);
    this.layer = group;
    group.moveIn(this);
  }

  checkCopy() {
    if (this.type) {
      return '物实例组不可以被复制';
    }
    let check = '';
    each(this.children, (node) => {
      const { className } = node;
      if (className === 'Group') {
        check = (node as Group).checkCopy();
        if (check) {
          return false;
        }
        return true;
      }
      if (includes(['Node', 'Belt', 'Scraper', 'TextGroup', 'Line'], className)) {
        check = '组内包含物实例信息，不可以被复制';
        return false;
      }
      return true;
    });
    return check;
  }

  getSelected(): Group | null {
    if (this.root) {
      return null;
    }
    if (this.selected) {
      return this;
    }
    return (this.layer as Group).getSelected();
  }

  getTemplate() {
    return omit(this.group.getAttrs(), ['draggable']);
  }

  setTemplate(attrs: Konva.GroupConfig) {
    this.group.setAttrs(attrs);
  }

  flipX() {}

  flipY() {}
}

export default Group;
