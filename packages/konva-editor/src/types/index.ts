import type Konva from 'konva';
import type Node from '../node';
import type Group from '../group';
import type Line from '../line';
import type Editor from '../editor';

export type NodeId = string;

export type EditorMode = 'A' | 'E' | 'R' | 'T' | 'C' | 'B' | 'I' | 'S';

export type GridConfig = boolean | {
  size: number;
  fixed: boolean;
};

export type GuideLineConfig = {
  enable: boolean;
  sameType: boolean;
  fixed: boolean;
};

export type ClickEvent = {
  type: string;
  event: Konva.KonvaEventObject<MouseEvent>;
  value?: string;
  nodeId?: NodeId;
};

export type DropFilesEvent = {
  type: 'files';
  files: FileList;
  offsetX: number;
  offsetY: number;
};

export type DropDataEvent<Group> = {
  type: 'data';
  group: Group;
  offsetX: number;
  offsetY: number;
};

export type DropEvent<Group> = DropFilesEvent | DropDataEvent<Group>;

export type Nodes<Node> = Node[];

export type SelectEvent = Nodes<Node> | null;

export type Step = {
  title: string;
  groupId?: string;
  undo: () => void;
  redo: () => void;
};

export type DoEvent = {
  index: number;
  list: Step[];
  prev: boolean;
  next: boolean;
  event: any;
};

export type Menu = {
  label: string;
  handler: () => void;
};

export type MenuList = Menu[];

export type Options = {
  background: string;
  isEdit: boolean;
  mode: EditorMode;
  intersection: boolean;
  scroll: boolean;
  touch: boolean;
  history: boolean;
  grid: GridConfig;
  guideLine: GuideLineConfig;
  lineTop: boolean;
  onKeydown: (event: KeyboardEvent) => void;
  onModeChange: (mode: EditorMode) => void;
  onClick: (event: ClickEvent) => void;
  onDrop: (event: DropEvent<Group>) => void;
  onSelect: (event: SelectEvent) => void;
  onDragmove: () => void;
  onCreateLine: (line: Line) => Promise<boolean>;
  onRemove: () => void;
  onMessage: (message: string) => void;
  onDo: (event: DoEvent) => void;
  onTouch: () => void;
  onBeforeDrop: () => Promise<boolean>;
  onContextMenu: (x: number, y: number, menuList: MenuList) => void;
};

export type Value = string | number | null;

export type NodeType = 'Group' | 'Rect' | 'Text' | 'Image' | 'Line' | 'Circle' | 'Button';

export type ImageSrc = string;

export type TextDecoration = '' | 'line-through' | 'underline';

export type LineType = string;

export interface NodeAttrs extends Konva.ShapeConfig {
  flipX?: boolean;
  flipY?: boolean;
  src?: ImageSrc;
  stroke?: string | CanvasGradient;
  strokeWidth?: number;
  fill?: string;
  cornerRadius?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  textDecoration?: TextDecoration;
  text?: string;
  fontSize?: number;
  showLabel?: boolean;
  colon?: boolean;
  label?: string;
  showArrow?: boolean;
  isPipeLine?: boolean;
  lineWidth?: number;
  points?: number[];
  type?: LineType;
}

export type NodeConfig = {
  nodeId?: string;
  attrs: NodeAttrs;
  layer: Konva.Group | Group;
  editor: Editor;
};

export type ExportObject = {
  type: NodeType;
  nodeId: NodeId;
  parentId?: NodeId;
  attrs: NodeAttrs;
};

export type ExportData = {
  options: Konva.LayerConfig;
  nodes: ExportObject[];
  lines: ExportObject[];
};

export interface Frame {
  data_length: number;
  data_offset: number;
  delay: number;
  disposal: number;
  has_local_palette: boolean;
  height: number;
  interlaced: boolean;
  palette_offset: number | null;
  palette_size: number | null;
  transparent_index: number | null;
  width: number;
  x: number;
  y: number;
}

export interface GifFrame extends Frame {
  pixels: Uint8ClampedArray;
  buffer: HTMLCanvasElement;
}

export interface Coordinate {
  x: number;
  y: number;
}
