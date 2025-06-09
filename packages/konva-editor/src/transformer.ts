import Konva from "konva";
import { debounce, map, each, min, max, sortBy, sumBy } from "lodash";
import HistoryRecord from "./historyRecord";
import { PositionEnum } from "./types/enums";
import type Editor from "./editor";
import type Node from "./node";
import Group from "./group";

type MoveHistory = {
  nodeId: string;
  attrs: Konva.ShapeConfig;
};

class Transformer {
  transformer: Konva.Transformer;

  editor: Editor;

  cache: Node[];

  update: () => void;

  moveHistory: null | MoveHistory[];

  constructor(layer: Konva.Layer, editor: Editor) {
    this.editor = editor;
    this.cache = [];
    this.moveHistory = null;
    this.transformer = new Konva.Transformer({
      flipEnabled: false,
    });
    this.update = debounce(() => {
      this.transformer.forceUpdate();
    }, 100);
    const debounceDragmoveHandler = debounce(() => {
      this.editor.dragmove();
    }, 100);
    this.transformer.on("dragstart transformstart", () => {
      this.dragStart();
    });
    this.transformer.on("dragend transformend", (event) => {
      if (this.moveHistory) {
        this.dragEnd(event.type, [...this.moveHistory]);
      }
    });
    this.transformer.on("dragmove", debounceDragmoveHandler);
    this.transformer.on("transform", debounceDragmoveHandler);
    layer.add(this.transformer);
  }

  dragStart() {
    this.moveHistory = map(this.cache, (node) => ({
      nodeId: node.nodeId,
      attrs: node.getTemplate(),
    }));
  }

  dragEnd(type: string, history: MoveHistory[]) {
    const current = map(this.cache, (node) => ({
      nodeId: node.nodeId,
      attrs: node.getTemplate(),
    }));
    let title = "";
    if (type === "dragend") {
      title = "移动位置";
    } else if (type === "transformend") {
      title = "变形";
    }
    this.editor.history.add({
      title,
      undo: () => {
        each(history, ({ nodeId, attrs }) => {
          const node = this.editor.findNode(nodeId);
          node?.setTemplate(attrs);
          node?.onMove();
        });
      },
      redo: () => {
        each(current, ({ nodeId, attrs }) => {
          const node = this.editor.findNode(nodeId);
          node?.setTemplate(attrs);
          node?.onMove();
        });
      },
    });
    this.moveHistory = null;
  }

  selectAll(list: Node[], evt: KeyboardEvent) {
    this.clear();
    each(list, (node) => {
      node.select(evt);
    });
  }

  setTransformer() {
    this.transformer.nodes(map(this.cache, (node) => node.get()));
    if (this.cache.length > 1) {
      this.transformer.enabledAnchors([]);
      this.transformer.rotateEnabled(false);
      this.editor.select(this.cache);
    } else if (this.cache.length === 1) {
      const [item] = this.cache;
      item.setTransformer();
      this.editor.select([item]);
    } else {
      this.editor.select(null);
    }
  }

  set(target: Node, event?: MouseEvent | KeyboardEvent, force = false) {
    if (event && (event.ctrlKey || event.metaKey) && this.cache.length) {
      if (this.cache[0].layer === target.layer || force) {
        this.cache.push(target);
        this.setTransformer();
      }
    } else {
      const group =
        target.layer.className === "Group" ? target.layer : undefined;
      this.editor.clearSelect(group as Group | undefined);
      this.cache = [target];
      this.transformer.nodes([target.get()]);
      target.setTransformer();
      this.editor.select([target]);
    }
  }

  setList(nodes: Node[], force = false) {
    this.clear();
    const evt = new KeyboardEvent("keydown", { ctrlKey: true });
    each(nodes, (node) => {
      node.select(evt, force);
    });
  }

  checkSelected(target: Node, event?: MouseEvent | KeyboardEvent) {
    return new Promise((resolve) => {
      if (event && (event.ctrlKey || event.metaKey) && this.include(target)) {
        const index = this.cache.indexOf(target);
        if (index > -1) {
          this.cache.splice(index, 1);
          target.unSelect();
          this.setTransformer();
        }
      } else {
        resolve(true);
      }
    });
  }

  clear() {
    this.cache = [];
    this.transformer.nodes([]);
    this.editor.select(null);
  }

  iterator(callback: (node: Node) => void) {
    each(this.cache, (item) => {
      callback(item);
    });
  }

  saveHistory(title: string, his: HistoryRecord) {
    this.editor.history.add({
      title,
      undo() {
        his.undo();
      },
      redo() {
        his.redo();
      },
    });
  }

  flipX() {
    const his = new HistoryRecord(this.editor, (node) => {
      (node as Node).flipX();
      this.editor.clearSelect();
      this.clear();
    });
    this.iterator((node) => {
      his.set(node.nodeId);
      node.flipX();
    });
    if (this.cache.length === 1) {
      this.cache[0].setTransformer();
    }
    this.saveHistory("水平翻转", his);
  }

  flipY() {
    const his = new HistoryRecord(this.editor, (node) => {
      (node as Node).flipY();
      this.editor.clearSelect();
      this.clear();
    });
    this.iterator((node) => {
      his.set(node.nodeId);
      node.flipY();
    });
    if (this.cache.length === 1) {
      this.cache[0].setTransformer();
    }
    this.saveHistory("垂直翻转", his);
  }

  leftAlign() {
    const x = min(map(this.cache, (node) => node.getX())) || 0;
    const his = new HistoryRecord(this.editor, (node, val) => {
      node.setX(val, undefined, true);
    });
    this.iterator((node) => {
      const oldX = node.getX();
      his.set(node.nodeId, oldX, x);
      node.setX(x, undefined, true);
    });
    this.saveHistory("左对齐", his);
  }

  rightAlign() {
    const x = max(map(this.cache, (node) => node.getGroupSize().maxX)) || 0;
    const his = new HistoryRecord(this.editor, (node, val) => {
      node.setX(val, undefined, true);
    });
    this.iterator((node) => {
      const oldX = node.getX();
      const newX = x - node.getGroupSize().width;
      his.set(node.nodeId, oldX, newX);
      node.setX(newX, undefined, true);
    });
    this.saveHistory("右对齐", his);
  }

  topAlign() {
    const y = min(map(this.cache, (node) => node.getY())) || 0;
    const his = new HistoryRecord(this.editor, (node, val) => {
      node.setY(val, undefined, true);
    });
    this.iterator((node) => {
      const oldY = node.getY();
      his.set(node.nodeId, oldY, y);
      node.setY(y, undefined, true);
    });
    this.saveHistory("顶对齐", his);
  }

  bottomAlign() {
    const y = max(map(this.cache, (node) => node.getGroupSize().maxY)) || 0;
    const his = new HistoryRecord(this.editor, (node, val) => {
      node.setY(val, undefined, true);
    });
    this.iterator((node) => {
      const oldY = node.getY();
      const newY = y - node.getGroupSize().height;
      his.set(node.nodeId, oldY, newY);
      node.setY(newY, undefined, true);
    });
    this.saveHistory("底对齐", his);
  }

  centerX() {
    const first = this.cache[0];
    const { minX, width } = first.getGroupSize();
    const x = minX + width / 2;
    const his = new HistoryRecord(this.editor, (node, val) => {
      node.setX(val, undefined, true);
    });
    this.iterator((node) => {
      const oldX = node.getX();
      const newX = x - node.getGroupSize().width / 2;
      his.set(node.nodeId, oldX, newX);
      node.setX(newX, undefined, true);
    });
    this.saveHistory("水平居中对齐", his);
  }

  centerY() {
    const first = this.cache[0];
    const { minY, height } = first.getGroupSize();
    const y = minY + height / 2;
    const his = new HistoryRecord(this.editor, (node, val) => {
      node.setY(val, undefined, true);
    });
    this.iterator((node) => {
      const oldY = node.getY();
      const newY = y - node.getGroupSize().height / 2;
      his.set(node.nodeId, oldY, newY);
      node.setY(newY, undefined, true);
    });
    this.saveHistory("垂直居中对齐", his);
  }

  distributionX() {
    const list = sortBy(this.cache, (node) => {
      const { minX, width } = node.getGroupSize();
      return minX + width / 2;
    });
    const left = list[0].getX();
    const right = list[list.length - 1].getGroupSize().maxX;
    const long = right - left;
    const totalWidth = sumBy(list, (node) => node.getGroupSize().width);
    const totalGap = long - totalWidth;
    const gap = totalGap / (list.length - 1);
    let temp = 0;
    const his = new HistoryRecord(this.editor, (node, val) => {
      node.setX(val, undefined, true);
    });
    each(list, (node, index) => {
      if (index !== 0) {
        const oldX = node.getX();
        const newX = temp + gap;
        his.set(node.nodeId, oldX, newX);
        node.setX(newX, undefined, true);
      }
      temp = node.getGroupSize().maxX;
    });
    this.saveHistory("水平分布对齐", his);
  }

  distributionY() {
    const list = sortBy(this.cache, (node) => {
      const { minY, height } = node.getGroupSize();
      return minY + height / 2;
    });
    const left = list[0].getY();
    const right = list[list.length - 1].getGroupSize().maxY;
    const long = right - left;
    const totalHeight = sumBy(list, (node) => node.getGroupSize().height);
    const totalGap = long - totalHeight;
    const gap = totalGap / (list.length - 1);
    let temp = 0;
    const his = new HistoryRecord(this.editor, (node, val) => {
      node.setY(val, undefined, true);
    });
    each(list, (node, index) => {
      if (index !== 0) {
        const oldY = node.getY();
        const newY = temp + gap;
        his.set(node.nodeId, oldY, newY);
        node.setY(newY, undefined, true);
      }
      temp = node.getGroupSize().maxY;
    });
    this.saveHistory("垂直分布对齐", his);
  }

  up(ten: boolean) {
    const diff = ten ? 10 : 1;
    const his = new HistoryRecord(this.editor, (node, val) => {
      node.setY(val);
    });
    this.iterator((node) => {
      const oldY = node.getY();
      const newY = oldY - diff;
      his.set(node.nodeId, oldY, newY);
      node.setY(newY);
    });
    this.saveHistory("上移", his);
  }

  down(ten: boolean) {
    const diff = ten ? 10 : 1;
    const his = new HistoryRecord(this.editor, (node, val) => {
      node.setY(val);
    });
    this.iterator((node) => {
      const oldY = node.getY();
      const newY = oldY + diff;
      his.set(node.nodeId, oldY, newY);
      node.setY(newY);
    });
    this.saveHistory("下移", his);
  }

  left(ten: boolean) {
    const diff = ten ? 10 : 1;
    const his = new HistoryRecord(this.editor, (node, val) => {
      node.setX(val);
    });
    this.iterator((node) => {
      const oldX = node.getX();
      const newX = oldX - diff;
      his.set(node.nodeId, oldX, newX);
      node.setX(newX);
    });
    this.saveHistory("左移", his);
  }

  right(ten: boolean) {
    const diff = ten ? 10 : 1;
    const his = new HistoryRecord(this.editor, (node, val) => {
      node.setX(val);
    });
    this.iterator((node) => {
      const oldX = node.getX();
      const newX = oldX + diff;
      his.set(node.nodeId, oldX, newX);
      node.setX(newX);
    });
    this.saveHistory("右移", his);
  }

  changeElementPosition(type: PositionEnum) {
    switch (type) {
      case PositionEnum.MOVE_UP:
        this.editor.saveHistory("上层", () => {
          this.iterator((node) => {
            node.moveUp();
          });
        });
        break;
      case PositionEnum.MOVE_DOWN:
        this.editor.saveHistory("下层", () => {
          this.iterator((node) => {
            node.moveDown();
          });
        });
        break;
      case PositionEnum.MOVE_TO_TOP:
        this.editor.saveHistory("置于顶层", () => {
          this.iterator((node) => {
            node.moveToTop();
          });
        });
        break;
      case PositionEnum.MOVE_TO_BOTTOM:
        this.editor.saveHistory("置于底层", () => {
          this.iterator((node) => {
            node.moveToBottom();
          });
        });
        break;
      case PositionEnum.FLIP_X:
        this.flipX();
        break;
      case PositionEnum.FLIP_Y:
        this.flipY();
        break;
      case PositionEnum.LEFT:
        this.leftAlign();
        break;
      case PositionEnum.RIGHT:
        this.rightAlign();
        break;
      case PositionEnum.TOP:
        this.topAlign();
        break;
      case PositionEnum.BOTTOM:
        this.bottomAlign();
        break;
      case PositionEnum.CENTER_X:
        this.centerX();
        break;
      case PositionEnum.CENTER_Y:
        this.centerY();
        break;
      case PositionEnum.DISTRIBUTION_X:
        this.distributionX();
        break;
      case PositionEnum.DISTRIBUTION_Y:
        this.distributionY();
        break;
      default:
        break;
    }
  }

  include(node: Node | null) {
    if (node) {
      return this.cache.indexOf(node) !== -1;
    }
    return false;
  }
}

export default Transformer;
