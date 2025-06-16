import Konva from 'konva';
import * as _ from 'lodash';
import { uuid } from './uuid';
import Group from './group';
import Line from './line';
import Rect from './rect';
import Text from './text';
import Button from './button';
import Image from './image';
import Circle from './circle';
import Transformer from './transformer';
import Mover from './mover';
import EditorHistory from './history';

import type {
  NodeId,
  Options,
  NodeAttrs,
  EditorMode,
  ExportData,
  NodeType,
  ClickEvent,
  ImageSrc,
  GridConfig,
  GuideLineConfig,
  ExportObject,
} from './types';
import { type PositionEnum } from './types/enums';
import type Node from './node';
import type Port from './port';
import type Anchor from './anchor';

export type AllNodes = Node | Rect | Text | Image | Circle;

type EditorOptions = Options;

type GuideItem = {
  val: number;
  nodeId: NodeId;
};

type GuideMap = Record<number, GuideItem>;

function getCenter(x1: number, y1: number, x2: number, y2: number) {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  };
}

function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

type Closest = [number, number, string] | undefined;

function getClosest(
  val: number,
  guideList: GuideItem[],
  type: string,
  threshold = 5
): Closest {
  const index = _.sortedIndexBy(guideList, { val, nodeId: '' }, 'val');
  let ln: GuideItem | null = null;
  let rn: GuideItem | null = null;
  if (index !== 0) {
    ln = guideList[index - 1];
  }
  if (index !== guideList.length) {
    rn = guideList[index];
  }
  const l = (ln && Math.abs(ln.val - val) < threshold) ? ln.val : undefined;
  const r = (rn && Math.abs(rn.val - val) < threshold) ? rn.val : undefined;
  if (!_.isUndefined(l) && !_.isUndefined(r)) {
    if (Math.abs(l - val) <= Math.abs(r - val)) {
      return [l, Math.abs(l - val), type];
    }
    return [r, Math.abs(r - val), type];
  }
  if (!_.isUndefined(l)) {
    return [l, Math.abs(l - val), type];
  }
  if (!_.isUndefined(r)) {
    return [r, Math.abs(r - val), type];
  }
  return undefined;
}

export class Editor {
  stage: Konva.Stage;
  gridGroup?: Konva.Group;
  mainLayer: Konva.Layer;
  nodeLayer: Group;
  lineLayer: Group;
  editorContainer: HTMLElement;
  options: EditorOptions;
  lineMap: Record<string, Line>;
  nodeIds: Record<string, AllNodes>;
  tr: Transformer;
  cursor?: string;
  cacheAnchor: Anchor | null;
  tempLine: Line | null;
  tempShape: Node | null;
  tempMover?: Mover;
  blockSave: boolean;
  copied: NodeId[];
  utilLayer!: Konva.Layer;
  selectionRectangle!: Konva.Rect;
  selectionRectMap!: Record<NodeId, Konva.Rect>;
  selecting!: boolean;
  history: EditorHistory;
  lastCenter: {
    x: number;
    y: number;
  };
  lastDistance: number;
  guideXMap: GuideMap = {};
  guideXList: GuideItem[] = [];
  guideYMap: GuideMap = {};
  guideYList: GuideItem[] = [];
  guideXLine: Konva.Line | null = null;
  guideYLine: Konva.Line | null = null;
  guideXTransform: Konva.Transformer | null = null;
  guideYTransform: Konva.Transformer | null = null;

  constructor(container: HTMLDivElement, opt: Partial<EditorOptions>) {
    this.lastCenter = {
      x: 0,
      y: 0,
    };
    this.lastDistance = 0;
    this.blockSave = false;
    this.tempLine = null;
    this.tempShape = null;
    this.cacheAnchor = null;
    this.copied = [];
    this.options = _.extend({
      background: '',
      isEdit: false,
      mode: 'A',
      intersection: false,
      scroll: false,
      touch: false,
      history: false,
      grid: false,
      guideLine: {
        enable: false,
        sameType: false,
        fixed: false,
      },
      lineTop: false,
      onKeydown: () => {},
      onModeChange: () => {},
      onClick: () => {},
      onDrop: () => {},
      onSelect: () => {},
      onDragmove: () => {},
      onCreateLine: () => Promise.resolve(true),
      onRemove: () => {},
      onMessage: () => {},
      onDo: () => {},
      onTouch: () => {},
      onBeforeDrop: () => Promise.resolve(true),
      onContextMenu: () => {},
    }, opt);
    this.editorContainer = container;
    this.stage = new Konva.Stage({
      container,
      width: container.clientWidth,
      height: container.clientHeight,
    });
    this.mainLayer = new Konva.Layer();
    this.stage.add(this.mainLayer);
    this.lineMap = {};
    this.nodeIds = {};
    if (this.options.scroll) {
      this.onWheel();
    }
    if (this.options.touch) {
      this.onTouch();
    }
    this.history = new EditorHistory({
      enabled: this.options.history,
      onDo: (event) => {
        this.options.onDo(event);
      },
    });
    if (this.options.isEdit) {
      const c = this.stage.container();
      c.tabIndex = 1;
      c.focus();
      const mover = new Mover(this.stage, ({ movementX, movementY }) => {
        const x = this.mainLayer.x();
        const y = this.mainLayer.y();
        this.mainLayer.setAttrs({
          x: x + movementX,
          y: y + movementY,
        });
      });
      this.utilLayer = new Konva.Layer();
      this.stage.add(this.utilLayer);
      this.selectionRectMap = {};
      this.selectionRectangle = new Konva.Rect({
        fill: 'rgba(0, 0, 255, .3)',
        visible: false,
        listening: false,
      });
      this.selecting = false;
      const { clientWidth, clientHeight } = this.editorContainer;
      this.guideXLine = new Konva.Line({
        name: 'grid',
        points: [0, 0, 0, clientHeight],
        stroke: '#ff00007f',
        strokeWidth: 1,
        visible: false,
      });
      this.guideYLine = new Konva.Line({
        name: 'grid',
        points: [0, 0, clientWidth, 0],
        stroke: '#ff00ff7f',
        strokeWidth: 1,
        visible: false,
      });
      this.guideXTransform = new Konva.Transformer({
        enabledAnchors: [],
        rotateEnabled: false,
        resizeEnabled: false,
        borderStroke: '#ff00007f',
      });
      this.guideYTransform = new Konva.Transformer({
        enabledAnchors: [],
        rotateEnabled: false,
        resizeEnabled: false,
        borderStroke: '#ff00ff7f',
      });
      this.utilLayer.add(
        this.guideXTransform,
        this.guideYTransform,
        this.guideXLine,
        this.guideYLine,
        this.selectionRectangle,
      );
      this.stage.on('mousedown', ({ evt, target }) => {
        if (!mover.enable && target.parent?.className !== 'Transformer') {
          if (this.options.mode === 'R' && !target.hasName('rect')) {
            this.createShapeStart(Rect, evt.offsetX, evt.offsetY);
          } else if (this.options.mode === 'C' && !target.hasName('circle')) {
            this.createShapeStart(Circle, evt.offsetX, evt.offsetY);
          }
        }
        if (
          !mover.enable
          && this.options.mode === 'A'
          && (
            target === this.stage
            || target.hasName('grid')
          )
        ) {
          this.selecting = true;
          this.selectionRectangle.setAttrs({
            visible: true,
            width: 0,
            height: 0,
            x: evt.offsetX,
            y: evt.offsetY,
          });
          const checkList = (this.tr.cache.length === 1 && this.tr.cache[0] instanceof Group)
            ? this.tr.cache[0].children
            : this.nodeLayer.children;
          this.tempMover = new Mover(this.stage, ({ offsetX, offsetY }) => {
            const width = Math.abs(offsetX - evt.offsetX);
            const height = Math.abs(offsetY - evt.offsetY);
            const x = offsetX < evt.offsetX ? offsetX : evt.offsetX;
            const y = offsetY < evt.offsetY ? offsetY : evt.offsetY;
            this.selectionRectangle.width(width);
            this.selectionRectangle.height(height);
            this.selectionRectangle.x(x);
            this.selectionRectangle.y(y);
            this.triggerSelection(checkList, x, y, x + width, y + height);
          }, true);
        }
      });
      this.stage.on('click', ({ target, evt }) => {
        if (!mover.enable) {
          const { offsetX, offsetY } = evt;
          const { x, y } = this.getPositionInLayer(offsetX, offsetY);
          if (this.options.mode === 'T' && !target.hasName('text')) {
            const textConfig = {
              x,
              y,
              fill: '#333333',
            };
            const text = this.createText(textConfig, this.nodeLayer);
            this.setMode('A');
            this.history.add({
              title: '创建文字',
              undo: () => {
                this.removeNode(text.nodeId);
              },
              redo: () => {
                this.createText({
                  ...textConfig,
                }, this.nodeLayer, text.nodeId);
              },
            });
            setTimeout(() => {
              text.select();
            }, 10);
          } else if (this.options.mode === 'B' && !target.hasName('button')) {
            const buttonConfig = {
              x,
              y,
              type: 'primary',
            };
            const button = this.createButton(buttonConfig, this.nodeLayer);
            this.setMode('A');
            this.history.add({
              title: '创建按钮',
              undo: () => {
                this.removeNode(button.nodeId);
              },
              redo: () => {
                this.createButton({
                  ...buttonConfig,
                }, this.nodeLayer, button.nodeId);
              },
            });
            setTimeout(() => {
              button.select();
            }, 10);
          }
        }
      });
      this.stage.on('mouseup dragend', () => {
        this.createLineOver();
        this.createShapeEnd();
        this.selectionEnd();
        this.clearGuide();
      });
      container.addEventListener('mouseout', () => {
        this.createLineOver();
        this.createShapeEnd();
        this.selectionEnd();
        if (mover.enable) {
          container.style.cursor = 'default';
          mover.stop();
        }
      });
      container.addEventListener('keydown', (event) => {
        event.stopPropagation();
        event.preventDefault();
        const metaKey = event.metaKey || event.ctrlKey;
        if (event.code === 'Space') {
          if (!this.selecting) {
            container.style.cursor = 'grab';
            mover.enable = true;
          }
        } else if (event.code === 'Delete' || event.code === 'Backspace') {
          if (this.cacheAnchor && !this.cacheAnchor.destroyed) {
            this.cacheAnchor.remove();
            this.cacheAnchor = null;
          } else if (this.tr.cache.length) {
            this.saveHistory('删除', () => {
              _.each(this.tr.cache, (node) => {
                node.destroy();
              });
              this.options.onRemove();
            }, 'deleteNodeUndo', 'deleteNodeRedo');
          }
        } else if (event.code === 'ArrowUp') {
          this.tr.up(metaKey);
        } else if (event.code === 'ArrowDown') {
          this.tr.down(metaKey);
        } else if (event.code === 'ArrowLeft') {
          this.tr.left(metaKey);
        } else if (event.code === 'ArrowRight') {
          this.tr.right(metaKey);
        } else if (event.code === 'KeyC' && metaKey) {
          this.copy();
        } else if (event.code === 'KeyV' && metaKey) {
          this.paste();
        } else if (event.code === 'KeyA' && metaKey) {
          this.selectAll(event);
        } else if (event.code === 'KeyZ' && metaKey) {
          if (event.shiftKey) {
            this.history.redo();
          } else {
            this.history.undo();
          }
        } else if (event.code === 'KeyY' && metaKey) {
          this.history.redo();
        } else {
          this.options.onKeydown(event);
        }
      });
      container.addEventListener('keyup', ({ code }) => {
        if (code === 'Space') {
          container.style.cursor = 'default';
          mover.stop();
          mover.enable = false;
        }
      });
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      container.addEventListener('drop', (e) => {
        e.preventDefault();
        const { offsetX, offsetY } = e;
        if (e.dataTransfer?.files.length) {
          this.options.onDrop({
            type: 'files',
            files: e.dataTransfer.files,
            offsetX,
            offsetY,
          });
        }
      });
      this.gridGroup = new Konva.Group();
      this.mainLayer.add(this.gridGroup);
      this.renderGrid();
      // Todo: 先在这里开启历史记录，后期要改成加载完数据再开启
      this.history.start();
    }
    this.nodeLayer = new Group({
      root: true,
      layer: this.mainLayer,
      editor: this,
      attrs: {},
    });
    this.lineLayer = new Group({
      root: true,
      layer: this.mainLayer,
      editor: this,
      attrs: {},
    });
    if (!this.options.isEdit && !this.options.lineTop) {
      this.nodeLayer.moveUp();
    }
    this.tr = new Transformer(this.mainLayer, this);
    this.stage.on('click', ({ target }) => {
      if (target === this.stage) {
        this.tr.clear();
        this.clearSelect();
      }
    });
  }

  setLineTop(isTop: boolean) {
    if (isTop) {
      this.lineLayer.moveUp();
    } else {
      this.nodeLayer.moveUp();
    }
  }

  setMode(mode: EditorMode) {
    this.options.mode = mode;
    this.options.onModeChange(mode);
    this.clearSelect();
    this.tr.clear();
  }

  findNode(nodeId: NodeId) {
    return this.nodeIds[nodeId];
  }

  removeNode(nodeId: NodeId) {
    const node = this.findNode(nodeId);
    if (node) {
      node.destroy();
    }
  }

  protected changeZoom(deltaY: number) {
    const scale = this.mainLayer.scaleX();
    const newScale = deltaY < 0 ? scale * 1.1 : scale / 1.1;
    const position = this.stage.getPointerPosition();
    const x = position ? position.x : 0;
    const y = position ? position.y : 0;
    const stageX = this.mainLayer.x();
    const stageY = this.mainLayer.y();
    const mousePointTo = {
      x: x / scale - stageX / scale,
      y: y / scale - stageY / scale,
    };
    const newPosition = {
      x: -(mousePointTo.x - x / newScale) * newScale,
      y: -(mousePointTo.y - y / newScale) * newScale,
    };
    this.mainLayer.setAttrs({
      scaleX: newScale,
      scaleY: newScale,
      x: newPosition.x,
      y: newPosition.y,
    });
  }

  protected addNode(
    type: NodeType,
    nodeId: NodeId,
    parentId: NodeId | undefined,
    attrs: NodeAttrs,
  ) {
    const layer = parentId ? this.nodeIds[parentId] as Group : this.nodeLayer;
    if (type === 'Group') {
      const group = new Group({
        nodeId,
        attrs,
        layer,
        editor: this,
      });
      this.nodeIds[nodeId] = group;
      return group;
    }
    if (type === 'Image') {
      return this.createImage(attrs, layer, nodeId);
    }
    if (type === 'Rect') {
      return this.createRect(attrs, layer, nodeId);
    }
    if (type === 'Text') {
      return this.createText(attrs, layer, nodeId);
    }
    return null;
  }

  protected addLine(
    nodeId: NodeId,
    attrs: NodeAttrs,
    from: NodeId,
    to: NodeId,
    fromPort?: string | null,
    toPort?: string | null,
  ) {
    const line = new Line({
      nodeId,
      attrs,
      from,
      fromPort,
      to,
      toPort,
      layer: this.lineLayer,
      editor: this,
    });
    this.nodeIds[nodeId] = line;
  }

  onWheel() {
    this.stage.on('wheel', ({ evt }) => {
      evt.preventDefault();
      if (!this.selecting) {
        if (evt.ctrlKey || evt.metaKey) {
          if (evt.deltaY !== 0) {
            this.changeZoom(evt.deltaY);
          }
        } else if (evt.shiftKey) {
          const x = evt.deltaY || evt.deltaX;
          if (x !== 0) {
            this.mainLayer.x(this.mainLayer.x() - x / 10);
          }
        } else if (evt.deltaY !== 0) {
          this.mainLayer.y(this.mainLayer.y() - evt.deltaY / 10);
        }
      }
    });
  }

  offWheel() {
    this.stage.off('wheel');
  }

  getTouchPos(clientX: number, clientY: number) {
    const ox = this.mainLayer.x();
    const oy = this.mainLayer.y();
    const dx = clientX - this.lastCenter.x;
    const dy = clientY - this.lastCenter.y;
    return {
      x: ox + dx,
      y: oy + dy,
    };
  }

  onTouch() {
    this.stage.on('touchstart', ({ evt }) => {
      if (evt.touches.length === 1) {
        const [{ clientX, clientY }] = evt.touches;
        this.lastCenter = {
          x: clientX,
          y: clientY,
        };
      } else if (evt.touches.length) {
        const [a, b] = evt.touches;
        this.lastCenter = getCenter(a.clientX, a.clientY, b.clientX, b.clientY);
        this.lastDistance = getDistance(a.clientX, a.clientY, b.clientX, b.clientY);
      }
    });
    this.stage.on('touchmove', ({ evt }) => {
      evt.preventDefault();
      if (evt.touches.length === 1) {
        const [{ clientX, clientY }] = evt.touches;
        const { x, y } = this.getTouchPos(clientX, clientY);
        this.mainLayer.setAttrs({
          x,
          y,
        });
        this.lastCenter = {
          x: clientX,
          y: clientY,
        };
      } else if (evt.touches.length) {
        const [a, b] = evt.touches;
        const currentCenter = getCenter(a.clientX, a.clientY, b.clientX, b.clientY);
        const currentDistance = getDistance(a.clientX, a.clientY, b.clientX, b.clientY);
        const scale = this.mainLayer.scaleX();
        const newScale = scale * (currentDistance / this.lastDistance);
        const { x, y } = this.getTouchPos(currentCenter.x, currentCenter.y);
        this.mainLayer.setAttrs({
          scaleX: newScale,
          scaleY: newScale,
          x,
          y,
        });
        this.lastCenter = currentCenter;
        this.lastDistance = currentDistance;
      }
      this.options.onTouch();
    });
  }

  offTouch() {
    this.stage.off('touchstart');
  }

  enableScroll(scroll: boolean) {
    if (scroll) {
      this.onWheel();
    } else {
      this.offWheel();
    }
  }

  enableTouch(touch: boolean) {
    if (touch) {
      this.onTouch();
    } else {
      this.offTouch();
    }
  }

  getPositionInLayer(offsetX: number, offsetY: number) {
    const scale = this.mainLayer.scaleX();
    const stageX = this.mainLayer.x();
    const stageY = this.mainLayer.y();
    const x = (offsetX - stageX) / scale;
    const y = (offsetY - stageY) / scale;
    return {
      x,
      y,
    };
  }

  getPositionInStage(offsetX: number, offsetY: number) {
    const scale = this.mainLayer.scaleX();
    const stageX = this.mainLayer.x();
    const stageY = this.mainLayer.y();
    const x = offsetX * scale + stageX;
    const y = offsetY * scale + stageY;
    return {
      x,
      y,
    };
  }

  clearAll() {
    this.clearSelect();
    this.tr.clear();
    _.each(this.lineLayer.children, (line) => {
      line.destroy(true);
    });
    this.lineLayer.children = [];
    _.each(this.nodeLayer.children, (node) => {
      node.destroy(true);
    });
    this.nodeLayer.children = [];
  }

  protected reload({ nodes, lines }: ExportData) {
    this.clearAll();
    _.each(nodes, ({
      type, nodeId, parentId, attrs
    }) => {
      this.addNode(type, nodeId, parentId, attrs);
    });
    _.each(lines, ({ nodeId, attrs }) => {
      const {
        from,
        to,
        fromPort,
        toPort,
      } = attrs;
      this.addLine(nodeId, attrs, from, to, fromPort, toPort);
    });
  }

  clearSelect(currentGroup?: Group) {
    this.nodeLayer.unSelect(currentGroup);
    this.lineLayer.unSelect();
    this.cacheAnchor = null;
  }

  createShapeStart(Shape: typeof Rect | typeof Circle, offsetX: number, offsetY: number) {
    this.clearSelect();
    this.tr.clear();
    const { x: startX, y: startY } = this.getPositionInLayer(offsetX, offsetY);
    this.tempShape = new Shape({
      attrs: {
        width: 0,
        height: 0,
        x: startX,
        y: startY,
        radius: 0,
      },
      layer: this.nodeLayer,
      editor: this,
    });
    this.tempMover = new Mover(this.stage, ({ offsetX: ox, offsetY: oy }) => {
      if (this.tempShape) {
        const { x: endX, y: endY } = this.getPositionInLayer(ox, oy);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        const x = endX < startX ? endX : startX;
        const y = endY < startY ? endY : startY;
        this.tempShape.setWidth(width);
        this.tempShape.setHeight(height);
        this.tempShape.setX(x);
        this.tempShape.setY(y);
      }
    }, true);
  }

  createShapeEnd() {
    if (this.tempShape) {
      if (this.tempShape.getWidth() && this.tempShape.getHeight()) {
        const id = this.tempShape.nodeId;
        const template = this.tempShape.getTemplate();
        this.nodeIds[id] = this.tempShape;
        this.setMode('A');
        this.history.add({
          title: `创建${this.tempShape.name}`,
          undo: () => {
            this.removeNode(id);
          },
          redo: () => {
            this.createRect(template, this.nodeLayer, id);
          },
        });
        setTimeout(() => {
          this.nodeIds[id].select();
        }, 10);
      } else {
        this.tempShape.destroy();
      }
      this.tempShape = null;
    }
  }

  addSelectionRect(nodeId: NodeId, x1: number, y1: number, x2: number, y2: number) {
    if (this.selectionRectMap[nodeId]) {
      this.selectionRectMap[nodeId].setAttrs({
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
      });
    } else {
      const rect = new Konva.Rect({
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
        strokeWidth: 1,
        stroke: '#f00',
      });
      this.utilLayer.add(rect);
      this.selectionRectMap[nodeId] = rect;
    }
  }

  removeSelectionRect(nodeId: NodeId) {
    if (this.selectionRectMap[nodeId]) {
      this.selectionRectMap[nodeId].destroy();
      delete this.selectionRectMap[nodeId];
    }
  }

  triggerSelection(list: Node[], rx1: number, ry1: number, rx2: number, ry2: number) {
    _.each(list, (node) => {
      const {
        minX, minY, maxX, maxY,
      } = node.getGroupSize();
      const { x: x1, y: y1 } = this.getPositionInStage(minX, minY);
      const { x: x2, y: y2 } = this.getPositionInStage(maxX, maxY);
      const secting = this.options.intersection
        ? (!(rx2 < x1 || ry2 < y1 || rx1 > x2 || ry1 > y2))
        : (rx1 < x1 && ry1 < y1 && rx2 > x2 && ry2 > y2);
      if (secting) {
        this.addSelectionRect(node.nodeId, x1, y1, x2, y2);
      } else {
        this.removeSelectionRect(node.nodeId);
      }
    });
  }

  protected createRect(attrs: NodeAttrs, layer: Group, nodeId?: string) {
    const rect = new Rect({
      nodeId,
      attrs,
      layer,
      editor: this,
    });
    this.nodeIds[rect.nodeId] = rect;
    return rect;
  }

  protected createImage(attrs: NodeAttrs, layer: Group, nodeId?: string) {
    const image = new Image({
      nodeId,
      attrs,
      layer,
      editor: this,
    });
    this.nodeIds[image.nodeId] = image;
    return image;
  }

  protected createText(attrs: NodeAttrs, layer: Group, nodeId?: string) {
    const text = new Text({
      nodeId,
      attrs,
      layer,
      editor: this,
    });
    this.nodeIds[text.nodeId] = text;
    return text;
  }

  protected createButton(attrs: NodeAttrs, layer: Group, nodeId?: string) {
    const button = new Button({
      nodeId,
      attrs,
      layer,
      editor: this,
    });
    this.nodeIds[button.nodeId] = button;
    return button;
  }

  selectionEnd() {
    if (this.selecting) {
      this.selecting = false;
      if (this.tr.cache.length === 1 && this.tr.cache[0] instanceof Group) {
        this.clearSelect(this.tr.cache[0]);
      } else {
        this.clearSelect();
      }
      setTimeout(() => {
        this.tr.setList(_.map(this.selectionRectMap, (_rect, nodeId) => this.findNode(nodeId)));
        _.each(this.selectionRectMap, (rect) => {
          rect.destroy();
        });
        this.selectionRectMap = {};
        this.selectionRectangle.hide();
        this.tempMover?.stop();
      }, 20);
    }
  }

  exportCanvas() {
    return new Promise<HTMLCanvasElement>((resolve) => {
      const x = this.mainLayer.scaleX();
      const y = this.mainLayer.scaleY();
      this.mainLayer.scale({ x: 1, y: 1 });
      const canvas = this.mainLayer.toCanvas();
      resolve(canvas);
      this.mainLayer.scale({ x, y });
    });
  }

  exportPNG() {
    return new Promise<string>((resolve) => {
      this.gridGroup?.hide();
      this.exportCanvas().then((canvas) => {
        resolve(canvas.toDataURL('image/png'));
        this.gridGroup?.show();
      });
    });
  }

  exportData() {
    return new Promise<ExportData>((resolve, reject) => {
      if (this.blockSave) {
        reject(new Error('阻塞保存'));
      } else {
        resolve({
          options: this.mainLayer.getAttrs(),
          nodes: this.nodeLayer.getData(),
          lines: this.lineLayer.getData(),
        });
      }
    });
  }

  saveHistory(
    title: string,
    callback: () => void,
    undoTriggerEvent?: string,
    redoTriggerEvent?: string,
  ) {
    this.exportData().then((oldData) => {
      callback();
      this.exportData().then((newData) => {
        this.history.add({
          title,
          undo: () => {
            this.reload(oldData);
            if (undoTriggerEvent) {
              this.history.triggerEvent({
                type: undoTriggerEvent,
              });
            }
          },
          redo: () => {
            this.reload(newData);
            const type = redoTriggerEvent || undoTriggerEvent;
            if (type) {
              this.history.triggerEvent({
                type,
              });
            }
          },
        });
      });
    });
  }

  copy() {
    this.copied = _.map(this.tr.cache, 'nodeId');
  }

  paste(/* pos?: { x: number; y: number } */) {
    const offsetX = 50;
    const offsetY = 50;
    if (this.copied.length && !_.some(this.copied, (nodeId) => {
      const node = this.nodeIds[nodeId];
      if (node) {
        if (node.className === 'Group') {
          return (node as Group).checkCopy();
        }
        return _.includes(['Node', 'Belt', 'Scraper', 'TextGroup', 'Line'], node.className);
      }
      return true;
    })) {
      this.exportData().then((/* oldData */) => {
        // const layer = this.nodeIds[this.copied[0]].layer as Group;
        _.each(this.copied, (nodeId) => {
          const node = this.nodeIds[nodeId];
          if (node.className === 'Group') {
            console.log(node.getData());
          }
        });
      });
      const layer = this.nodeIds[this.copied[0]].layer as Group;
      const pasted: Node[] = [];
      _.each(this.copied, (nodeId) => {
        const node = this.nodeIds[nodeId];
        if (node.className === 'Group') {
          const check = (node as Group).checkCopy();
          if (check) {
            this.message(check);
          } else {
            // Todo
          }
        } else {
          const { attrs } = node.getData() as ExportObject;
          if (attrs.x) {
            attrs.x += offsetX;
          }
          if (attrs.y) {
            attrs.y += offsetY;
          }
          const newNode = this.addNode(
            node.className,
            uuid(),
            layer.root ? undefined : layer.nodeId,
            attrs,
          );
          if (newNode) {
            pasted.push(newNode);
          }          
        }
      });
      this.clearSelect(layer);
      this.tr.setList(pasted);
      this.copied = _.map(pasted, 'nodeId');
    }
  }

  message(msg: string) {
    this.options.onMessage(msg);
  }

  selectAll(event: KeyboardEvent) {
    this.clearSelect();
    this.tr.selectAll(this.nodeLayer.children, event);
  }

  selectAllType(type: string) {
    this.clearSelect();
    this.tr.setList(_.filter(this.nodeIds, (item) => item.className === type), true);
  }

  undo() {
    this.history.undo();
  }

  redo() {
    this.history.redo();
  }

  getGridSize() {
    let size = 0;
    if (this.options.grid) {
      if (this.options.grid === true) {
        size = 30;
      } else {
        size = this.options.grid.size;
      }
    } else {
      size = 0;
    }
    if (size && size < 30) {
      size = 30;
    }
    return size;
  }

  getGridFixed() {
    if (this.options.grid) {
      if (this.options.grid === true || !this.getGridSize()) {
        return false;
      }
      return this.options.grid.fixed;
    }
    return false;
  }

  renderGrid() {}

  pointer(isPointer: boolean) {
    const container = this.stage.container();
    if (isPointer) {
      if (!this.cursor) {
        container.style.cursor = 'pointer';
      }
    } else {
      container.style.cursor = 'default';
    }
  }

  setCursor(cursor?: string) {
    this.cursor = cursor;
    const container = this.stage.container();
    container.style.cursor = cursor || 'default';
  }

  fitStage() {
    const { clientWidth, clientHeight } = this.editorContainer;
    if (clientWidth && clientHeight) {
      this.stage.setAttrs({
        width: clientWidth,
        height: clientHeight,
      });
    }
  }

  fit() {}

  changeBackground(background: string) {
    this.options.background = background;
  }

  onClick(event: ClickEvent) {
    this.options.onClick(event);
  }

  destroy() {
    this.clearAll();
    this.stage.destroy();
  }

  getParentIds(target: Node, arr: NodeId[] = []): NodeId[] {
    if ((target.layer as Group).root) {
      return arr;
    }
    return this.getParentIds((target.layer as Group), _.concat(arr, [target.nodeId]));
  }

  getChildrenIds(target: Node) {
    if (target.className === 'Group') {
      const re: NodeId[] = [];
      _.each((target as Group).children, (child) => {
        if (child.className === 'Group') {
          re.push(...this.getChildrenIds(child as Group));
        } else {
          re.push(child.nodeId);
        }
      });
      return re;
    }
    return [];
  }

  select(target: Node[] | null) {
    this.options.onSelect(target ? [...target] : null);
    if (target?.length === 1) {
      if (target[0].className !== 'Line' && this.options.guideLine.enable) {
        const parentIds = this.getParentIds(target[0]);
        const childrenIds = this.getChildrenIds(target[0]);
        _.each(this.nodeIds, (node, nodeId) => {
          if (
            node.className !== 'Line'
            && nodeId !== target[0].nodeId
            && !_.includes(parentIds, nodeId)
            && !_.includes(childrenIds, nodeId)
            && (
              !this.options.guideLine.sameType
              || (
                (target[0].isNode && node.isNode)
                || target[0].className === node.className
              )
            )
          ) {
            const {
              width, height, minX, minY, maxX, maxY,
            } = node.getGroupSize();
            const cx = minX + width / 2;
            const cy = minY + height / 2;
            if (!this.guideXMap[minX]) {
              this.guideXMap[minX] = {
                val: minX,
                nodeId,
              };
            }
            if (!this.guideXMap[cx]) {
              this.guideXMap[cx] = {
                val: cx,
                nodeId,
              };
            }
            if (!this.guideXMap[maxX]) {
              this.guideXMap[maxX] = {
                val: maxX,
                nodeId,
              };
            }
            if (!this.guideYMap[minY]) {
              this.guideYMap[minY] = {
                val: minY,
                nodeId,
              };
            }
            if (!this.guideYMap[cy]) {
              this.guideYMap[cy] = {
                val: cy,
                nodeId,
              };
            }
            if (!this.guideYMap[maxY]) {
              this.guideYMap[maxY] = {
                val: maxY,
                nodeId,
              };
            }
          }
        });
        this.guideXList = _.sortBy(this.guideXMap, 'val');
        this.guideYList = _.sortBy(this.guideYMap, 'val');
      }
    } else {
      this.guideXMap = {};
      this.guideYMap = {};
      this.guideXList = [];
      this.guideYList = [];
    }
  }

  dragmove() {
    this.options.onDragmove();
  }

  addImage(src: string) {
    const image = this.createImage({ src, x: 10, y: 10 }, this.nodeLayer);
    this.history.add({
      title: '插入图片',
      undo: () => {
        this.removeNode(image.nodeId);
      },
      redo: () => {
        this.createImage({
          x: 10,
          y: 10,
          src,
        }, this.nodeLayer, image.nodeId);
      },
    });
  }

  dropImage(src: ImageSrc, offsetX: number, offsetY: number) {
    const { x, y } = this.getPositionInLayer(offsetX, offsetY);
    const image = this.createImage({
      x,
      y,
      src,
    }, this.nodeLayer);
    this.history.add({
      title: '拖入图片',
      undo: () => {
        this.removeNode(image.nodeId);
      },
      redo: () => {
        this.createImage({
          x,
          y,
          src,
        }, this.nodeLayer, image.nodeId);
      },
    });
  }

  getGroupSize(group: Konva.Group, options: {
    scale?: number;
    filterFunc?: (item: Konva.Node) => boolean;
    getClientRectConfig?: {
      skipTransform?: boolean;
      skipShadow?: boolean;
      skipStroke?: boolean;
      relativeTo?: Konva.Container;
    };
  } = {}) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const scale = options.scale || this.mainLayer.scaleX();
    const stageX = this.mainLayer.x();
    const stageY = this.mainLayer.y();
    const childs = group.getChildren(options.filterFunc);
    if (childs.length) {
      _.each(childs, (child) => {
        const {
          x, y, width, height,
        } = child.getClientRect(_.extend({
          skipShadow: true,
        }, options.getClientRectConfig));
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
      });
      return {
        width: (maxX - minX) / scale,
        height: (maxY - minY) / scale,
        minX: (minX - stageX) / scale,
        minY: (minY - stageY) / scale,
        maxX: (maxX - stageX) / scale,
        maxY: (maxY - stageY) / scale,
      };
    }
    const { x, y } = group.getAbsolutePosition(this.stage);
    return {
      width: 0,
      height: 0,
      minX: (x - stageX) / scale,
      minY: (y - stageY) / scale,
      maxX: (x - stageX) / scale,
      maxY: (y - stageY) / scale,
    };
  }

  deleteNodeId(nodeId: NodeId) {
    if (this.nodeIds[nodeId]) {
      delete this.nodeIds[nodeId];
    }
  }

  setPort(nodeId: NodeId | undefined, pos: number[], line: Line) {
    if (pos && pos.length && nodeId) {
      const node = this.nodeIds[nodeId];
      if (node) {
        return node.setPort(pos, line);
      }
      return undefined;
    }
    return undefined;
  }

  selectAnchor(anchor: Anchor) {
    this.cacheAnchor = anchor;
  }

  createLine(from: NodeId, offsetX: number, offsetY: number) {
    this.blockSave = true;
    this.clearSelect();
    this.tr.clear();
    const { x, y } = this.getPositionInLayer(offsetX, offsetY);
    let showArrow = true;
    let lineWidth = 4;
    this.tempLine = new Line({
      attrs: {
        tid: uuid(),
        showArrow,
        type: 'CLEAN_COAL',
        lineWidth,
        points: [x, y, x, y, x, y],
      },
      from,
      layer: this.lineLayer,
      editor: this,
    });
    let t = 0;
    this.tempMover = new Mover(this.stage, ({
      offsetX: ox,
      offsetY: oy,
      movementX,
      movementY,
    }) => {
      if (this.tempLine) {
        if (!t) {
          t = Math.abs(movementX) > Math.abs(movementY) ? 1 : 2;
        }
        const { x: lx, y: ly } = this.getPositionInLayer(ox, oy);
        const points = _.chunk(this.tempLine.attrs.points, 2);
        if (t === 1) {
          const endY = ly < points[0][1] ? ly + 5 : ly - 5;
          points[1][0] = lx;
          points[2][0] = lx;
          points[2][1] = endY;
        } else {
          const endX = lx < points[0][0] ? lx + 5 : lx - 5;
          points[1][1] = ly;
          points[2][0] = endX;
          points[2][1] = ly;
        }
        this.tempLine.setPoints(_.flatten(points));
      }
    }, true);
  }

  createLineDone(to: NodeId, port?: Port) {
    if (this.tempLine) {
      if (this.tempLine.from !== to) {
        if (port) {
          const portPos = port.port.getAbsolutePosition();
          const pos = this.getPositionInLayer(portPos.x, portPos.y);
          this.tempLine.setTo(to, port.id, pos);
        } else {
          this.tempLine.setTo(to);
        }
        this.tempLine.init();
        this.options.onCreateLine(this.tempLine).then(() => {
          this.blockSave = false;
        });
        this.tempLine = null;
      }
    }
  }

  createLineOver() {
    if (this.tempLine) {
      this.tempLine.destroy();
      this.tempLine = null;
      this.blockSave = false;
    }
  }

  saveLine(line: Line) {
    this.nodeIds[line.nodeId] = line;
    line.select();
  }

  changeElementsPosition(type: PositionEnum) {
    this.tr.changeElementPosition(type);
  }

  groupByIds(ids: NodeId[], nodeId?: NodeId) {
    const list: AllNodes[] = [];
    _.each(ids, (id) => {
      const finded = this.findNode(id);
      if (finded) {
        list.push(finded);
      }
    });
    if (list.length) {
      const first = list[0];
      const layer = first.layer as Group;
      const group = new Group({
        nodeId,
        layer,
        editor: this,
        attrs: {},
      });
      this.nodeIds[group.nodeId] = group;
      _.each(list, (node) => {
        node.moveTo(group);
      });
      group.select();
      return group.nodeId;
    }
    return null;
  }

  group() {
    const ids = _.map(this.tr.cache, 'nodeId');
    const groupId = this.groupByIds(ids);
    if (groupId) {
      this.history.add({
        title: '组合',
        undo: () => {
          this.cancelGroupById(groupId);
        },
        redo: () => {
          this.groupByIds(ids, groupId);
        },
      });
    }
  }

  cancelGroupById(groupId: NodeId) {
    const group = this.findNode(groupId) as Group;
    const layer = group.layer as Group;
    const ids = _.map(group.children, 'nodeId');
    _.each(group.children, (node) => {
      node.get().moveTo(layer.get());
      node.layer = layer;
      node.get().x(node.get().x() + group.get().x());
      node.get().y(node.get().y() + group.get().y());
    });
    layer.children.push(...group.children);
    layer.remove(group);
    this.deleteNodeId(groupId);
    this.tr.clear();
    this.clearSelect();
    return ids;
  }

  cancelGroup(group: Group) {
    const groupId = group.nodeId;
    const ids = this.cancelGroupById(groupId);
    this.history.add({
      title: '取消组合',
      undo: () => {
        this.groupByIds(ids, groupId);
      },
      redo: () => {
        this.cancelGroupById(groupId);
      },
    });
  }

  pull(nodes: Node[]) {
    this.saveHistory('移出组', () => {
      const group = nodes[0].layer as Group;
      const layer = group.layer as Group;
      _.each(nodes, (node) => {
        node.get().moveTo(layer.get());
        node.layer = layer;
        node.get().x(node.get().x() + group.get().x());
        node.get().y(node.get().y() + group.get().y());
      });
      layer.children.push(...nodes);
      _.remove(group.children, (item) => _.includes(nodes, item));
      this.tr.clear();
      this.clearSelect();
    }, 'deleteNodeUndo', 'deleteNodeRedo');
  }
  
  setGrid(gridConfig: GridConfig) {
    this.options.grid = gridConfig;
    this.renderGrid();
  }

  setGuideLine(config: GuideLineConfig) {
    this.options.guideLine = config;
    if (!config.enable) {
      this.guideXMap = {};
      this.guideYMap = {};
      this.guideXList = [];
      this.guideYList = [];
    }
  }

  clearGuide() {
    this.guideXLine?.hide();
    this.guideYLine?.hide();
    this.guideXTransform?.nodes([]);
    this.guideYTransform?.nodes([]);
  }

  showGuideX(item: Closest) {
    const { clientHeight } = this.editorContainer;
    if (item) {
      const [x] = item;
      const guideItem = this.guideXMap[x];
      if (guideItem) {
        const node = this.nodeIds[guideItem.nodeId];
        if (node) {
          this.guideXTransform?.nodes([node.get()]);
        }
      }
      const { x: lx } = this.getPositionInStage(x, 0);
      this.guideXLine?.points([lx, 0, lx, clientHeight]);
      this.guideXLine?.show();
    } else {
      this.guideXLine?.hide();
      this.guideXTransform?.nodes([]);
    }
  }

  showGuideY(item: Closest) {
    const { clientWidth } = this.editorContainer;
    if (item) {
      const [y] = item;
      const guideItem = this.guideYMap[y];
      if (guideItem) {
        const node = this.nodeIds[guideItem.nodeId];
        if (node) {
          this.guideYTransform?.nodes([node.get()]);
        }
      }
      const { y: ly } = this.getPositionInStage(0, y);
      this.guideYLine?.points([0, ly, clientWidth, ly]);
      this.guideYLine?.show();
    } else {
      this.guideYLine?.hide();
      this.guideYTransform?.nodes([]);
    }
  }

  move(node: Node) {
    if (_.size(this.guideXMap) || _.size(this.guideYMap)) {
      const {
        width, height, minX, minY, maxX, maxY,
      } = node.getGroupSize();
      const cx = minX + width / 2;
      const l = getClosest(minX, this.guideXList, 'l');
      const c = getClosest(cx, this.guideXList, 'c');
      const r = getClosest(maxX, this.guideXList, 'r');
      const x = _.minBy(_.compact([l, c, r]), 1);
      this.showGuideX(x);
      const cy = minY + height / 2;
      const t = getClosest(minY, this.guideYList, 't');
      const m = getClosest(cy, this.guideYList, 'm');
      const b = getClosest(maxY, this.guideYList, 'b');
      const y = _.minBy(_.compact([t, m, b]), 1);
      this.showGuideY(y);
      if (this.options.guideLine.enable && this.options.guideLine.fixed) {
        if (x) {
          if (x[2] === 'l') {
            node.setX(x[0]);
          } else if (x[2] === 'r') {
            node.setX(x[0] - width);
          } else {
            node.setX(x[0] - width / 2);
          }
        }
        if (y) {
          if (y[2] === 't') {
            node.setY(y[0]);
          } else if (y[2] === 'b') {
            node.setY(y[0] - height);
          } else {
            node.setY(y[0] - height / 2);
          }
        }
      }
    }
    const size = this.getGridSize();
    const isFixed = this.getGridFixed();
    if (size && isFixed && this.tr.cache.length === 1 && node === this.tr.cache[0]) {
      const {
        width, height, minX, minY, maxX, maxY,
      } = node.getGroupSize();
      const closestMinX = Math.round(minX / size) * size;
      const offsetMinX = Math.abs(minX - closestMinX);
      const closestMaxX = Math.round(maxX / size) * size;
      const offsetMaxX = Math.abs(maxX - closestMaxX);
      const closestMinY = Math.round(minY / size) * size;
      const offsetMinY = Math.abs(minY - closestMinY);
      const closestMaxY = Math.round(maxY / size) * size;
      const offsetMaxY = Math.abs(maxY - closestMaxY);
      let x = minX;
      let y = minY;
      if (offsetMinX < 5) {
        x = closestMinX;
      } else if (offsetMaxX < 5) {
        x = closestMaxX - width;
      }
      if (offsetMinY < 5) {
        y = closestMinY;
      } else if (offsetMaxY < 5) {
        y = closestMaxY - height;
      }
      node.setX(x);
      node.setY(y);
    }
  }

  contextMenu(x: number, y: number, menuList: any[]) {
    this.options.onContextMenu(x, y, menuList);
  }
}

export default Editor;
