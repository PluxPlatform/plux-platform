import *as _ from 'lodash';
import type { NodeAttrs } from './types';

export class SetPoint {
  handler: (points: number[]) => void;

  origin: NodeAttrs;

  activePoints: number[];

  suffix: number[];

  prefix: number[];

  constructor(attrs: NodeAttrs, handler: (points: number[]) => void) {
    this.origin = attrs;
    this.handler = handler;
    this.activePoints = [];
    this.suffix = [];
    this.prefix = [];
  }

  start() {
    this.activePoints = [...this.origin.points!];
    this.suffix = [];
    this.prefix = [];
  }

  end() {
    this.origin.points = _.concat(this.prefix, this.activePoints, this.suffix);
    this.activePoints = [];
    this.suffix = [];
    this.prefix = [];
  }

  set(index: number | 'start' | 'end', type: undefined | boolean, x: number, y: number, ap?: { x: number, y: number }) {
    let autoEnd = false;
    if (this.activePoints.length < 2) {
      this.start();
      autoEnd = true;
    }
    const points = this.activePoints;
    let i = 0;
    if (index === 'start') {
      i = 0;
    } else if (index === 'end') {
      i = points.length / 2 - 1;
    } else {
      i = index;
    }
    if (_.isUndefined(type)) {
      const common = {
        x: -1,
        y: -1,
      };
      if (points.length > 4) {
        // 如果修改点不是第一个点
        if (i > 0) {
          if (i === 1 && this.prefix.length < 2) {
            this.prefix = [points[0], points[1]];
          }
          // 找前一个点，如果横坐标差值小于纵坐标差值
          if (
            Math.abs(points[(i - 1) * 2] - points[i * 2])
            < Math.abs(points[(i - 1) * 2 + 1] - points[i * 2 + 1])
          ) {
            // 共同横坐标标记为前一个点的横坐标位置
            common.x = (i - 1) * 2;
          } else {
            // 否则共同纵坐标标记为前一个点的纵坐标位置
            common.y = (i - 1) * 2 + 1;
          }
        }
        // 如果修改点不是最后一个点
        if (i < points.length / 2 - 1) {
          if (i === points.length / 2 - 2 && this.suffix.length < 2) {
            this.suffix = [points[points.length - 2], points[points.length - 1]];
          }
          // 找后一个点，逻辑同上
          if (
            Math.abs(points[(i + 1) * 2] - points[i * 2])
            < Math.abs(points[(i + 1) * 2 + 1] - points[i * 2 + 1])
          ) {
            common.x = (i + 1) * 2;
          } else {
            common.y = (i + 1) * 2 + 1;
          }
        }
      }
      if (points.length === 4 && ap) {
        if (i === 0) {
          if (Math.abs(ap.x - points[2]) - Math.abs(ap.y - points[3]) > 0) {
            points[0] = ap.x;
            points[1] = points[3];
          } else {
            points[0] = points[2];
            points[1] = ap.y;
          }
        } else {
          if (Math.abs(ap.x - points[0]) - Math.abs(ap.y - points[1]) > 0) {
            points[2] = ap.x;
            points[3] = points[1];
          } else {
            points[2] = points[0];
            points[3] = ap.y;
          }
        }
      } else {
        points[i * 2] += x;
        if (common.x !== -1) {
          points[common.x] += x;
        }
        points[i * 2 + 1] += y;
        if (common.y !== -1) {
          points[common.y] += y;
        }
      }
    } else {
      if (i === 0) {
        if (this.prefix.length < 2) {
          this.prefix = [points[0], points[1]];
        }
      } else if (i === points.length / 2 - 2) {
        if (this.suffix.length < 2) {
          this.suffix = [points[points.length - 2], points[points.length - 1]];
        }
      }
      if (type) {
        points[i * 2] += x;
        points[(i + 1) * 2] += x;
      } else {
        points[i * 2 + 1] += y;
        points[(i + 1) * 2 + 1] += y;
      }
    }
    this.handler(_.concat(this.prefix, points, this.suffix));
    if (autoEnd) {
      this.end();
      autoEnd = false;
    }
  }
}

export default SetPoint;
