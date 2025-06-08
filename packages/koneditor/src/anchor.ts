import Konva from 'konva';
import _ from 'lodash';
import type Group from './group';

type OnRemoveFunc = (anchor: Anchor, index?: number, type?: boolean) => void;

interface AnchorAttrs {
  x: number;
  y: number;
  lineWidth: number;
  selected: boolean;
}

interface AnchorConfig {
  layer: Group;
  index?: number;
  type?: boolean;
  attrs: AnchorAttrs;
  onPositionChange?: (pos: { x: number, y: number }, index?: number, type?: boolean, ap?: { x: number, y: number }) => void;
  onHold?: (holding: boolean, index?: number, type?: boolean, moved?: boolean) => void;
  onClick?: (anchor: Anchor, index?: number, type?: boolean) => void;
  onRemove?: OnRemoveFunc;
  onContextMenu?: (anchor: Anchor, x: number, y: number, index?: number, type?: boolean) => void;
}

class Anchor {
  oldX: number;

  oldY: number;

  anchor: Konva.Circle;

  index?: number;

  type: undefined | boolean;

  moved: boolean;

  destroyed: boolean;

  onRemove?: OnRemoveFunc;

  selected: boolean;

  constructor({
    layer,
    index,
    type,
    attrs,
    onPositionChange,
    onHold,
    onClick,
    onRemove,
    onContextMenu,
  }: AnchorConfig) {
    this.oldX = 0;
    this.oldY = 0;
    this.selected = false;
    this.onRemove = onRemove;
    this.destroyed = false;
    this.moved = false;
    const { x, y, lineWidth } = attrs;
    this.index = index;
    this.type = type;
    this.anchor = new Konva.Circle({
      x,
      y,
      radius: _.max([lineWidth - 2, 6]),
      fill: '#fff',
      stroke: '#87cefa',
      strokeWidth: 0.5,
      visible: attrs.selected,
    });
    layer.addNatural(this.anchor);
    this.anchor.on('mouseover', () => {
      this.anchor.fill('#53f7fe3f');
      this.anchor.radius(lineWidth * 3);
      this.anchor.draggable(true);
      layer.editor.setCursor('move');
    });
    this.anchor.on('mouseout', () => {
      this.anchor.fill(this.selected ? '#53f7fe' : '#fff');
      this.anchor.radius(_.max([lineWidth - 2, 6])!);
      this.anchor.draggable(false);
      layer.editor.setCursor();
    });
    this.anchor.on('mousedown', () => {
      if (onHold) {
        onHold(true, index, type);
      }
    });
    this.anchor.on('mouseup dragend', () => {
      if (onHold) {
        onHold(false, index, type, this.moved);
        this.moved = false;
      }
    });
    this.anchor.on('dragstart', () => {
      this.oldX = this.anchor.x();
      this.oldY = this.anchor.y();
    });
    this.anchor.on('dragmove', ({ evt }) => {
      const {
        movementX,
        movementY,
        layerX,
        layerY,
        shiftKey
      } = evt;
      let newX = this.anchor.x();
      let newY = this.anchor.y();
      let moved: undefined | true | 1 | 0;
      if (_.isUndefined(type)) {
        newX += movementX;
        newY += movementY;
        moved = true;
      } else if (type) {
        newX += movementX;
        newY = this.oldY;
        if (newX !== this.oldX) {
          moved = 1;
        }
        this.anchor.y(newY);
      } else {
        newX = this.oldX;
        newY += movementY;
        if (newY !== this.oldY) {
          moved = 0;
        }
        this.anchor.x(newX);
      }
      if (onPositionChange && !_.isUndefined(moved)) {
        this.moved = true;
        const scale = layer.editor.mainLayer.scaleX();
        onPositionChange({
          x: (moved === true || moved === 1) ? movementX / scale : 0,
          y: (moved === true || moved === 0) ? movementY / scale : 0,
        }, index, type, shiftKey ? {
          x: (layerX - layer.editor.mainLayer.x()) / scale,
          y: (layerY - layer.editor.mainLayer.y()) / scale,
        } : undefined);
      }
    });
    this.anchor.on('click tap', () => {
      if (onClick) {
        onClick(this, index, type);
        this.select();
      }
    });
    this.anchor.on('contextmenu', ({ evt }) => {
      evt.stopPropagation();
      evt.preventDefault();
      if (onContextMenu) {
        onContextMenu(this, evt.clientX, evt.clientY, this.index, this.type);
      }
    });
  }

  show() {
    this.anchor.show();
  }

  hide() {
    this.anchor.hide();
  }

  visible(visible: boolean) {
    this.anchor.visible(visible);
  }

  select() {
    this.selected = true;
    this.anchor.fill('#53f7fe');
  }

  unSelect() {
    this.selected = false;
    this.anchor.fill('#fff');
  }

  destroy() {
    this.destroyed = true;
    this.anchor.destroy();
  }

  remove() {
    if (this.onRemove) {
      this.onRemove(this, this.index);
    }
  }
}

export default Anchor;
