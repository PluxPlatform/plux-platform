/* eslint-disable class-methods-use-this */
import Konva from 'konva';
import * as _ from 'lodash';
import Node from './node';
import Anchor from './anchor';
import { SetPoint } from './setPoint';
import type Group from './group';
import type Port from './port';
import type {
  NodeAttrs,
  NodeConfig,
  NodeId,
  NodeType,
  Coordinate,
} from './types';

export interface LineConfig extends NodeConfig {
  from?: NodeId;
  fromPort?: string | null;
  to?: NodeId;
  toPort?: string | null;
  isTemp?: boolean;
}

function calcDistance(pointA: number[], pointB: number[]) {
  const dx = Math.abs(pointA[0] - pointB[0]);
  const dy = Math.abs(pointA[1] - pointB[1]);
  return Math.sqrt(dx ** 2 + dy ** 2);
}

function calcDirection(pointA: number[], pointB: number[]) {
  return Math.abs(pointA[0] - pointB[0]) < Math.abs(pointA[1] - pointB[1]) ? 0 : 1;
}

const lineTheme = {
  fill: '#000000',
  borderOuter: '#7c87a1',
  borderInner: '#354468',
};

const defaultLineWidth = 8;
export class Line extends Node {
  className: NodeType = 'Line';
  name = '管路';

  attrs: NodeAttrs;

  from?: NodeId;

  fromPort?: string | null;

  to?: NodeId;

  toPort?: string | null;

  state: boolean;

  group: Konva.Group;

  borderOuter: Konva.Arrow;

  borderInner?: Konva.Arrow;

  line: Konva.Arrow;

  animation?: Konva.Tween;

  speed: number;

  animationAvailable: boolean;

  selected: boolean;

  startPort?: Port;

  endPort?: Port;

  anchors: Anchor[];

  setPoint?: SetPoint;

  ports: Port[];

  constructor(config: LineConfig) {
    super(config);
    this.className = 'Line';
    this.anchors = [];
    this.selected = false;
    this.animationAvailable = true;
    this.speed = 20;
    this.attrs = config.attrs;
    this.from = config.from;
    this.to = config.to;
    this.fromPort = config.fromPort;
    this.toPort = config.toPort;
    this.state = false;
    this.isNode = false;
    this.ports = [];
    this.group = new Konva.Group();
    this.group.on('click tap dblclick', (event) => this.bindEvent('line', event));
    if (this.editor.options.isEdit) {
      this.group.on('mouseover', () => {
        this.editor.pointer(true);
        this.highlight(true);
      });
      this.group.on('mouseout', () => {
        this.editor.pointer(false);
        this.highlight(false);
      });
    }
    (config.layer as Group).add(this);
    const {
      lineWidth = defaultLineWidth,
    } = config.attrs;
    const color = '#3FCC83';
    const dotted = [15, 8, 15, 8];
    const pointer = config.attrs.showArrow ? 10 : 0;
    const opt = {
      fill: color,
      points: config.attrs.points,
      pointerFill: color,
      pointerLength: config.attrs.isPipeline ? 0 : pointer,
      pointerWidth: config.attrs.isPipeline ? 0 : pointer,
    };
    if (config.attrs.isPipeline) {
      this.borderOuter = this.createLine({
        ...opt,
        strokeWidth: lineWidth,
        stroke: lineTheme.borderOuter,
        dashEnabled: false,
      });
      this.borderInner = this.createLine({
        ...opt,
        strokeWidth: lineWidth * 0.75,
        stroke: lineTheme.borderInner,
        dashEnabled: false,
      });
      this.group.add(this.borderOuter, this.borderInner);
    } else {
      this.borderOuter = this.createLine({
        ...opt,
        stroke: color,
        strokeWidth: config.attrs.lineWidth,
        dashEnabled: false,
        visible: false,
      });
      this.borderOuter.cache();
      this.borderOuter.filters([Konva.Filters.HSL]);
      this.borderOuter.luminance(-0.5);
        this.borderOuter.saturation(-0.3);
      this.group.add(this.borderOuter);
    }
    const dash = dotted || [15, 8, 15, 8];
    this.line = this.createLine({
      ...opt,
      strokeWidth: config.attrs.isPipeline ? lineWidth * 0.4 : config.attrs.lineWidth,
      stroke: color,
      dash,
      dashEnabled: config.attrs.isPipeline ? true : !!dotted,
    });
    this.group.add(this.line);
    if (!config.isTemp) {
      this.init();
    }
  }

  getX() {
    return 0;
  }

  getY() {
    return 0;
  }

  refreshAnchors() {
    _.each(this.anchors, (anchor, index) => {
      anchor.anchor.setPosition({
        x: this.attrs.points![index * 2],
        y: this.attrs.points![index * 2 + 1],
      });
    });
  }

  setX(val: number) {
    const { points } = this.attrs;
    const finded = _.find(this.anchors, 'selected');
    if (finded) {
      this.setPoints(_.map(points, (p, i) => {
        if (i === finded.index! * 2) {
          return p + val;
        }
        return p;
      }));
    } else {
      this.setPoints(_.map(points, (p, i) => {
        if (i % 2 === 0) {
          return p + val;
        }
        return p;
      }));
    }
    this.refreshAnchors();
    this.editor.tr.update();
  }

  setY(val: number) {
    const { points } = this.attrs;
    const finded = _.find(this.anchors, 'selected');
    if (finded) {
      this.setPoints(_.map(points, (p, i) => {
        if (i === finded.index! * 2 + 1) {
          return p + val;
        }
        return p;
      }));
    } else {
      this.setPoints(_.map(points, (p, i) => {
        if (i % 2) {
          return p + val;
        }
        return p;
      }));
    }
    this.refreshAnchors();
    this.editor.tr.update();
  }

  setRotation() {}

  onMove() {}

  moveTo() {}

  getWidth() {
    return 0;
  }

  setWidth() {}

  getHeight() {
    return 0;
  }

  setHeight() {}

  getScale() {
    return 1;
  }

  setScale() {}

  getGroupSize() {
    return {
      width: 0,
      height: 0,
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
    };
  }

  init() {
    this.initPorts();
    const lineDash = this.line.dash();
    const length = lineDash.length === 1 ? lineDash[0] * 2 : _.sum(lineDash);
    this.animation = new Konva.Tween({
      node: this.line,
      dashOffset: -length,
      duration: (this.speed * length) / 500,
      onFinish: () => {
        if (this.state) {
          this.animation!.reset();
          this.animation!.play();
        }
      },
    });
    this.setPoint = new SetPoint(this.attrs, (points) => {
      this.setPoints(points);
    });
  }

  highlight(highlight: boolean | string) {
    if (highlight === false) {
      if (this.attrs.isPipeline) {
        this.borderOuter.shadowEnabled(false);
      } else {
        this.line.shadowEnabled(false);
      }
    } else {
      const color = highlight === true ? '#53f7fe' : highlight;
      if (this.attrs.isPipeline) {
        this.borderOuter.shadowColor(color);
        this.borderOuter.shadowBlur(10);
        this.borderOuter.shadowEnabled(true);
      } else {
        this.line.shadowColor(color);
        this.line.shadowBlur(10);
        this.line.shadowEnabled(true);
      }
    }
  }

  createLine(attrs: NodeAttrs) {
    return new Konva.Arrow({
      ...attrs,
      points: attrs.points || [],
    });
  }

  start() {
    if (this.animation) {
      if (!this.attrs.isPipeline) {
        this.borderOuter.show();
        this.line.strokeWidth((this.attrs.lineWidth || defaultLineWidth) / 2);
        this.line.dashEnabled(true);
      }
      this.animation.play();
      this.group.moveToTop();
    }
  }

  stop() {
    if (this.animation) {
      if (!this.attrs.isPipeline) {
        this.borderOuter.hide();
        this.line.strokeWidth(this.attrs.lineWidth || defaultLineWidth);
      }
      this.animation?.pause();
    }
  }

  changeState() {
    if (this.animationAvailable) {
      if (this.state) {
        this.start();
      } else {
        this.stop();
      }
    }
  }

  setState(state: boolean) {
    if (state !== this.state) {
      this.state = state;
      this.changeState();
    }
  }

  startAnimate() {
    this.animationAvailable = true;
    this.changeState();
  }

  stopAnimate() {
    this.animationAvailable = false;
    this.stop();
  }

  setTransformer() {
    this.editor.tr.transformer.enabledAnchors([]);
    this.editor.tr.transformer.rotateEnabled(false);
  }

  select(event?: MouseEvent | KeyboardEvent, force = false) {
    this.editor.tr.checkSelected(this, event).then(() => {
      this.editor.tr.set(this, event, force);
      this.selected = true;
      this.initAnchors();
      this.anchorsVisible(true);
    });
  }

  unSelect() {
    this.selected = false;
    this.startPort?.hide();
    this.endPort?.hide();
    this.anchorsVisible(false);
  }
  get() {
    return this.group;
  }
  onDestroy(callback: (line: Node, mechanical?: boolean) => void) {
    this.on('destroy', callback);
  }

  destroy(skipClear = false) {
    this.group.destroy();
    this.clearAnchors();
    if (!skipClear) {
      (this.layer as Group).remove(this);
    }
    _.each(this.events.destroy, (callback) => {
      callback(this);
    });
    this.editor.deleteNodeId(this.nodeId);
    this.editor.pointer(false);
  }

  removePoint(index: number, _type: undefined | boolean) {
    const points = _.chunk(this.attrs.points, 2);
    if (points.length === 3) {
      points.splice(1, 1);
    } else {
      let target = -1;
      let origin = -1;
      if (index === 1) {
        target = 1;
      } else if (index === points.length - 2) {
        target = points.length - 3;
      } else {
        const p = calcDistance(points[index - 1], points[index]);
        const n = calcDistance(points[index + 1], points[index]);
        if (p < n) {
          target = index - 1;
        } else {
          target = index;
        }
      }
      const pl = calcDistance(points[target], points[target - 1]);
      const nl = calcDistance(points[target + 1], points[target + 2]);
      if (points.length === 4) {
        if (pl < nl) {
          origin = target + 1;
          const direction = calcDirection(points[origin], points[target]);
          points[origin][direction] = points[target - 1][direction];
        } else {
          origin = target;
          target += 1;
          const direction = calcDirection(points[origin], points[target]);
          points[origin][direction] = points[target + 1][direction];
        }
        points.splice(target, 1);
      } else {
        if ((pl < nl && target !== 1) || target === points.length - 3) {
          origin = target - 1;
          const direction = calcDirection(points[origin], points[target]);
          points[origin][direction] = points[target + 1][direction];
        } else {
          origin = target + 2;
          const direction = calcDirection(points[origin], points[target + 1]);
          points[origin][direction] = points[target][direction];
        }
        points.splice(target, 2);
      }
    }
    this.setPoints(_.flatten(points));
    this.initAnchors();
    this.editor.tr.update();
  }

  clearAnchors() {
    _.each(this.anchors, (anchor) => {
      anchor.destroy();
    });
    this.anchors = [];
  }

  private onAnchorHode(holding: boolean, index?: number, type?: boolean, moved?: boolean) {
    if (holding) {
      this.setPoint?.start();
      _.each(this.anchors, (anchor) => {
        anchor.visible(index === anchor.index && type === anchor.type);
      });
    } else {
      this.setPoint?.end();
      const points = this.getPoints();
      if (moved) {
        if (!_.isUndefined(type) && points && points.length >= 8) {
          const ps = [...points];
          let change: number | null = null;
          const i = index || 1;
          if (type) {
            if (Math.abs(ps[i * 2] - ps[i * 2 - 2]) < 10) {
              ps[i * 2 + 2] = ps[(i - 1) * 2];
              change = 1;
            } else if (Math.abs(ps[(i + 1) * 2] - ps[(i + 1) * 2 + 2]) < 10) {
              ps[i * 2] = ps[(i + 1) * 2 + 2];
              change = 2;
            }
          } else if (Math.abs(ps[i * 2 + 1] - ps[i * 2 - 1]) < 10) {
            ps[i * 2 + 3] = ps[i * 2 - 1];
            change = 1;
          } else if (Math.abs(ps[i * 2 + 3] - ps[i * 2 + 5]) < 10) {
            ps[i * 2 + 1] = ps[i * 2 + 5];
            change = 2;
          }
          if (change) {
            if (change === 1) {
              if (i - 1) {
                ps.splice((i - 1) * 2, 4);
              } else {
                ps.splice(i * 2, 2);
              }
            } else if (change === 2) {
              if (i >= ps.length / 2 - 3) {
                ps.splice((i + 1) * 2, 2);
              } else {
                ps.splice((i + 1) * 2, 4);
              }
            }
            this.setPoints(ps);
          }
        }
        this.initAnchors();
        this.editor.tr.update();
      } else {
        this.anchorsVisible(true);
      }
    }
  }

  private onAnchorClick(anchor: Anchor) {
    this.editor.selectAnchor(anchor);
    _.each(this.anchors, (item) => {
      if (item !== anchor) {
        item.unSelect();
      }
    });
  }

  initAnchors() {
    this.clearAnchors();
    const points = _.chunk(this.attrs.points, 2);
    const lineWidth = this.attrs.lineWidth || defaultLineWidth;
    _.each(points, (point, pi) => {
      const [px, py] = point;
      this.anchors.push(new Anchor({
        layer: this.layer as Group,
        index: pi,
        attrs: {
          x: px,
          y: py,
          lineWidth,
          selected: this.selected,
        },
        onPositionChange: ({ x, y }, index, type, ap) => {
          this.setPoint?.set(index!, type, x, y, ap);
        },
        onHold: this.onAnchorHode.bind(this),
        onClick: this.onAnchorClick.bind(this),
        onRemove: (_anchor, index, type) => {
          this.removePoint(index!, type);
        },
      }));
    });
    if (points.length > 2) {
      for (let i = 0; i < points.length - 1; i += 1) {
        const startPoint = points[i];
        const endPoint = points[i + 1];
        const v = startPoint[0] === endPoint[0];
        const d = v ? Math.abs(startPoint[1] - endPoint[1]) : Math.abs(startPoint[0] - endPoint[0]);
        if (d > 30) {
          this.anchors.push(new Anchor({
            layer: this.layer as Group,
            index: i,
            type: v,
            attrs: {
              x: v ? startPoint[0] : (Math.abs(startPoint[0] + endPoint[0]) / 2),
              y: v ? (Math.abs(startPoint[1] + endPoint[1]) / 2) : startPoint[1],
              lineWidth,
              selected: this.selected,
            },
            onPositionChange: ({ x, y }, index, type, ap) => {
              this.setPoint?.set(index!, type, x, y, ap);
            },
            onHold: this.onAnchorHode.bind(this),
            onClick: this.onAnchorClick.bind(this),
            onRemove: (_anchor, index, type) => {
              this.removePoint(index!, type);
            },
          }));
        }
      }
    }
  }

  initPorts() {
    const points = _.chunk(this.attrs.points, 2);
    this.startPort = this.editor.setPort(this.from, _.first(points)!, this);
    this.endPort = this.editor.setPort(this.to, _.last(points)!, this);
    if (this.startPort) {
      this.bindPortsEvents(this.startPort, 'start');
    }
    if (this.endPort) {
      this.bindPortsEvents(this.endPort, 'end');
    }
  }

  anchorsVisible(visible: boolean) {
    _.each(this.anchors, (anchor) => {
      anchor.visible(visible);
    });
  }

  getSelected() {
    return this;
  }

  isBothSelected() {
    const from = this.from ? this.editor.findNode(this.from) : null;
    const to = this.to ? this.editor.findNode(this.to) : null;
    if (from && to) {
      if (!from.getSelected() || !to.getSelected()) {
        return false;
      }
      return from.getSelected() === to.getSelected() || (
        this.editor.tr.include(from.getSelected())
        && this.editor.tr.include(to.getSelected())
      );
    }
    return false;
  }

  bindPortsEvents(port: Port, type: 'start' | 'end') {
    port.onHold((holding) => {
      if (holding) {
        this.anchorsVisible(false);
        this.setPoint?.start();
      } else {
        this.setPoint?.end();
        this.initAnchors();
        this.editor.tr.update();
      }
    });
    port.onPositionChange(({ x, y }, mechanical) => {
      if (!mechanical && this.isBothSelected()) {
        this.setPoints(_.map(this.attrs.points, (p, i) => {
          if (i % 2) {
            return p + y / 2;
          }
          return p + x / 2;
        }));
      } else {
        this.setPoint?.set(type, undefined, x, y);
      }
    });
  }

  getPoints() {
    return this.attrs.points;
  }

  togglePoints() {
    const { points } = this.attrs;
    if (points) {
      if (points.length > 4) {
        this.setPoints([
          points[0],
          points[1],
          points[points.length - 2],
          points[points.length - 1],
        ]);
      } else {
        points.splice(2, 0, points[0], points[points.length - 1]);
        this.setPoints(points);
      }
      this.initAnchors();
    }
  }

  setPoints(points: number[]) {
    this.attrs.points = points;
    if (this.attrs.isPipeline) {
      this.borderInner?.points(points);
    }
    this.borderOuter.points(points);
    this.line.points(points);
  }

  getLineWidth() {
    return this.attrs.lineWidth;
  }

  setLineWidth(val: number) {
    this.attrs.lineWidth = val;
    this.borderOuter.strokeWidth(val);
    if (this.attrs.isPipeline) {
      this.borderInner?.strokeWidth(val * 0.75);
      this.line.strokeWidth(val * 0.4);
    } else {
      this.line.strokeWidth(val);
    }
    this.initAnchors();
    this.startPort?.setLineWidth();
    this.endPort?.setLineWidth();
  }

  getShowArrow() {
    return this.attrs.showArrow;
  }

  setShowArrow(showArrow: boolean) {
    this.attrs.showArrow = showArrow;
    const v = showArrow ? 10 : 0;
    this.borderOuter.pointerLength(v);
    this.borderOuter.pointerWidth(v);
    if (this.attrs.isPipeline) {
      this.borderInner?.pointerLength(v);
      this.borderInner?.pointerWidth(v);
    }
    this.line.pointerLength(v);
    this.line.pointerWidth(v);
  }

  setFrom(from: NodeId) {
    this.from = from;
  }

  setTo(to: NodeId, portId?: string, pos?: Coordinate) {
    this.to = to;
    this.toPort = portId;
    if (pos) {
      const points = this.getPoints();
      if (points && points.length >= 4) {
        let v = 0;
        if (points[points.length - 2] === points[points.length - 4]) {
          v = 1;
        }
        if (points[points.length - 1] === points[points.length - 3]) {
          v = 2;
        }
        if (points.length >= 6) {
          if (v === 1) {
            points[points.length - 4] = pos.x;
          } else if (v === 2) {
            points[points.length - 3] = pos.y;
          }
        }
        points[points.length - 2] = pos.x;
        points[points.length - 1] = pos.y;
        this.setPoints(points);
      }
    }
  }

  getData(parentId?: NodeId) {
    return {
      type: 'Line' as NodeType,
      nodeId: this.nodeId,
      parentId,
      attrs: {
        ...this.attrs,
        from: this.from,
        to: this.to,
        fromPort: this.fromPort,
        toPort: this.toPort,
      },
    };
  }

  tid() {
    return this.attrs.tid;
  }

  getTemplate() {
    return this.group.getAttrs();
  }

  setTemplate(attrs: Konva.ShapeConfig) {
    this.group.setAttrs(attrs);
  }

  flipX() {}

  flipY() {}

  moveUp() {}

  moveDown() {}

  moveToTop() {}

  moveToBottom() {}
}

export default Line;
