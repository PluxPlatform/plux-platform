import Konva from 'konva';
import _ from 'lodash';
import Group from './group';
import Line from './line';
import Rect from './rect';
import Text from './text';
import Image from './image';
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
} from './types';
import type Node from './node';
import type Port from './port';

type EditorOptions = Options<Node, Group, Line>;

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

class Editor {
  stage: Konva.Stage;
  gridGroup?: Konva.Group;
  mainLayer: Konva.Layer;
  nodeLayer: Group;
  lineLayer: Group;
  editorContainer: HTMLElement;
  options: EditorOptions;
  lineMap: Record<string, Line>;
  nodeIds: Record<string, Node>;
  tr: Transformer;
  cursor?: string;
  cacheAnchor: Anchor | null;
  tempLine: Line | null;
  tempRect: Rect | null;
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

  constructor(container: HTMLDivElement, opt: EditorOptions) {
    this.lastCenter = {
      x: 0,
      y: 0,
    };
    this.lastDistance = 0;
    this.blockSave = false;
    this.tempLine = null;
    this.tempRect = null;
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
        if (this.options.mode === 'R' && !target.hasName('rect') && !mover.enable && target.parent?.className !== 'Transformer') {
          this.createRectStart(evt.offsetX, evt.offsetY);
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
        if (this.options.mode === 'T' && !target.hasName('text') && !mover.enable) {
          const { offsetX, offsetY } = evt;
          const { x, y } = this.getPositionInLayer(offsetX, offsetY);
          const textConfig = {
            x,
            y,
            fill: '#333',
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
        }
      });
      this.stage.on('mouseup dragend', () => {
        this.createLineOver();
        this.createRectEnd();
        this.selectionEnd();
        this.clearGuide();
      });
      container.addEventListener('mouseout', () => {
        this.createLineOver();
        this.createRectEnd();
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
        const thingData = e.dataTransfer?.getData('thing');
        const templateData = e.dataTransfer?.getData('template');
        const cancelDrop = e.dataTransfer?.getData('cancelDrop');
        if (cancelDrop !== 'cancelDrop') {
          const { offsetX, offsetY } = e;
          if (thingData) {
            try {
              const thing = JSON.parse(thingData || '');
              this.dropNode(thing, offsetX, offsetY);
            } catch {
              console.warn('拖入数据异常', e);
            }
          } else if (templateData) {
            this.options.onDrop({
              type: 'template',
              id: templateData,
              offsetX,
              offsetY,
            });
          } else if (e.dataTransfer?.files.length) {
            this.options.onDrop({
              type: 'files',
              files: e.dataTransfer.files,
              offsetX,
              offsetY,
            });
          }
        }
      });
      this.gridGroup = new Konva.Group();
      this.mainLayer.add(this.gridGroup);
      this.renderGrid();
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
      }, this);
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
    }, this);
    if (thing && thing.iu) {
      this.lineMap[lineKey(thing.iu)] = line;
    }
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

  createRectStart(offsetX: number, offsetY: number) {
    this.clearSelect();
    this.tr.clear();
    const { x: startX, y: startY } = this.getPositionInLayer(offsetX, offsetY);
    this.tempRect = new Rect({
      attrs: {
        width: 0,
        height: 0,
        x: startX,
        y: startY,
      },
      layer: this.nodeLayer,
    }, this);
    this.tempMover = new Mover(this.stage, ({ offsetX: ox, offsetY: oy }) => {
      if (this.tempRect) {
        const { x: endX, y: endY } = this.getPositionInLayer(ox, oy);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        const x = endX < startX ? endX : startX;
        const y = endY < startY ? endY : startY;
        this.tempRect.setWidth(width);
        this.tempRect.setHeight(height);
        this.tempRect.setX(x);
        this.tempRect.setY(y);
      }
    }, true);
  }

  createRectEnd() {
    if (this.tempRect) {
      if (this.tempRect.getWidth() && this.tempRect.getHeight()) {
        const id = this.tempRect.nodeId;
        const template = this.tempRect.getTemplate();
        this.nodeIds[id] = this.tempRect;
        this.setMode('A');
        this.history.add({
          title: '创建矩形',
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
        this.tempRect.destroy();
      }
      this.tempRect = null;
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
    }, this);
    this.nodeIds[rect.nodeId] = rect;
    return rect;
  }

  protected createImage(attrs: NodeAttrs, layer: Group, nodeId?: string) {
    const image = new Image({
      nodeId,
      attrs,
      layer,
    }, this);
    this.nodeIds[image.nodeId] = image;
    return image;
  }

  protected createText(attrs: NodeAttrs, layer: Group, nodeId?: string) {
    const text = new Text({
      nodeId,
      attrs,
      layer,
    }, this);
    this.nodeIds[text.nodeId] = text;
    return text;
  }

  createLineOver() {
    if (this.tempLine) {
      this.tempLine.destroy();
      this.tempLine = null;
      this.blockSave = false;
    }
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
        this.tr.setList(_.map(this.selectionRectMap, (rect, nodeId) => this.findNode(nodeId)));
        _.each(this.selectionRectMap, (rect) => {
          rect.destroy();
        });
        this.selectionRectMap = {};
        this.selectionRectangle.hide();
        this.tempMover?.stop();
      }, 20);
    }
  }

  clearGuide() {
    this.guideXLine?.hide();
    this.guideYLine?.hide();
    this.guideXTransform?.nodes([]);
    this.guideYTransform?.nodes([]);
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
}

export default Editor;
