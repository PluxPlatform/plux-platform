import Node from './node';
import type { NodeType } from './types';

class Line extends Node {
  className: NodeType = 'Line';
  highlight() {}
  setHeight() {}
  setWidth() {}
}

export default Line;
