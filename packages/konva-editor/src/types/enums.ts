export enum PortType {
  Port = 'port',
  InPort = 'inPort',
  OutPort = 'outPort',
}

export enum PositionEnum {
  /** 上层 */
  MOVE_UP = 'moveUp',
  /** 下层 */
  MOVE_DOWN = 'moveDown',
  /** 置于顶层 */
  MOVE_TO_TOP = 'moveToTop',
  /** 置于底层 */
  MOVE_TO_BOTTOM = 'moveToBottom',
  /** 水平翻转 */
  FLIP_X = 'flipX',
  /** 垂直翻转 */
  FLIP_Y = 'flipY',
  /** 左对齐 */
  LEFT = 'left',
  /** 右对齐 */
  RIGHT = 'right',
  /** 顶对齐 */
  TOP = 'top',
  /** 底对齐 */
  BOTTOM = 'bottom',
  /** 水平居中对齐 */
  CENTER_X = 'centerX',
  /** 垂直居中对齐 */
  CENTER_Y = 'centerY',
  /** 水平分布对齐 */
  DISTRIBUTION_X = 'distributionX',
  /** 垂直分布对齐 */
  DISTRIBUTION_Y = 'distributionY',
}
