import Konva from "konva";
import { map, each, max, extend } from "lodash";
import type Node from "./node";
import type Line from "./line";
import { PortType } from "./types/enums";

type Options = {
  onDestroy: (port: Port) => void;
};

type FixedPortConfig = {
  id: string;
  type: PortType;
  position: "top" | "bottom" | "left" | "right";
};

class Port {
  port: Konva.Circle;

  node: Node;

  lines: Line[];

  options: Options;

  destroyed: boolean;

  isFixed: boolean;

  type?: PortType;

  id?: string;

  position?: "top" | "bottom" | "left" | "right";

  constructor(
    node: Node,
    pos: number[],
    line: Line | FixedPortConfig,
    options: Options
  ) {
    this.destroyed = false;
    this.options = extend(
      {
        onDestroy: () => {},
      },
      options
    );
    this.node = node;
    this.lines = [];
    let x: number;
    let y: number;
    let stroke = "#87cefa";
    if ((line as Line).className === "Line") {
      this.isFixed = false;
      this.lines.push(line as Line);
      (line as Line).onDestroy((currentLine) => {
        const index = this.lines.indexOf(currentLine as Line);
        if (index > -1) {
          this.lines.splice(index, 1);
        }
        if (this.lines.length === 0) {
          this.destroy();
        }
      });
      const [absoluteX, absoluteY] = pos;
      const groupInverseMatrix = node
        .portsGroup!.getAbsoluteTransform()
        .copy()
        .invert();
      const base = node.editor.mainLayer;
      const baseX = base.x();
      const baseY = base.y();
      const scale = base.scaleX();
      const relativeX = absoluteX * scale + baseX;
      const relativeY = absoluteY * scale + baseY;
      ({ x, y } = groupInverseMatrix.point({
        x: relativeX,
        y: relativeY,
      }));
    } else {
      const l = line as FixedPortConfig;
      this.isFixed = true;
      this.type = l.type;
      this.id = l.id;
      this.position = l.position;
      [x, y] = pos;
      if (l.type === PortType.InPort) {
        stroke = "green";
      } else if (l.type === PortType.OutPort) {
        stroke = "red";
      }
    }
    this.port = new Konva.Circle({
      x,
      y,
      radius: this.getRadiusByMaxLineWidth(),
      fill: "#fff",
      stroke,
      strokeWidth: 0.5,
      visible: this.node.editor.options.mode === "E" && this.isFixed,
    });
    if (this.isFixed) {
      this.port.on("mousedown", () => {
        if (this.type !== PortType.InPort) {
          const portPos = this.port.getAbsolutePosition();
          this.node.editor.createLine(this.node.nodeId, portPos.x, portPos.y);
        }
      });
      this.port.on("mouseup", () => {
        if (this.type !== PortType.OutPort) {
          this.node.editor.createLineDone(this.node.nodeId, this);
        }
      });
    }
    this.setScale();
    this.port.on("mouseover", () => {
      this.port.fill("#53f7fe");
      this.port.strokeWidth(2);
      if (!this.isFixed) {
        this.port.draggable(true);
      }
      node.editor.setCursor("move");
    });
    this.port.on("mouseout", () => {
      this.port.fill("#fff");
      this.port.strokeWidth(0.5);
      this.port.draggable(false);
      node.editor.setCursor();
    });
    node.portsGroup?.add(this.port);
    node.group.on("transform", () => {
      this.setScale();
    });
  }

  getRadiusByMaxLineWidth() {
    const maxLineWidth = max(map(this.lines, (line) => line.attrs.lineWidth));
    if (maxLineWidth) {
      return maxLineWidth + 2;
    }
    return 8;
  }

  setScale() {
    const scale = 1 / this.node.group.scaleX();
    this.port.scale({
      x: scale,
      y: scale,
    });
  }

  setLineWidth() {
    this.port.radius(this.getRadiusByMaxLineWidth());
  }

  getPos() {
    return this.port.getAbsolutePosition(this.node.editor.mainLayer);
  }

  onPositionChange(
    callback: (pos: { x: number; y: number }, mechanical?: boolean) => void
  ) {
    let { x, y } = this.getPos();
    const handler = (
      _node: Node | Konva.KonvaEventObject<MouseEvent>,
      mechanical?: boolean
    ) => {
      const { x: newX, y: newY } = this.getPos();
      callback(
        {
          x: newX - x,
          y: newY - y,
        },
        mechanical
      );
      x = newX;
      y = newY;
    };
    this.node.on("move", handler);
    this.port.on("dragmove", handler);
  }

  onHold(callback: (holding: boolean) => void) {
    this.port.on("mousedown", () => {
      callback(true);
    });
    this.port.on("mouseup", () => {
      callback(false);
    });
  }

  show() {
    this.port.show();
  }

  hide() {
    this.port.hide();
  }

  visible(isVisible: boolean) {
    this.port.visible(isVisible);
  }

  destroy(skipClear = false) {
    if (!this.destroyed) {
      this.destroyed = true;
      this.port.destroy();
      each(this.lines, (line) => {
        line.destroy(false);
      });
      if (!skipClear) {
        this.options.onDestroy(this);
      }
    }
  }
}

export default Port;
