export function getClassName(className: string) {
  if (className === 'Text') {
    return '文字';
  }
  if (className === 'Rect') {
    return '矩形';
  }
  if (className === 'Line') {
    return '线';
  }
  if (className === 'Circle') {
    return '圆形';
  }
  if (className === 'Button') {
    return '按钮';
  }
  if (className === 'Image') {
    return '图片';
  }
  if (className === 'Input') {
    return '输入框';
  }
  if (className === 'Switch') {
    return '开关';
  }
  return '';
};

export default getClassName;
