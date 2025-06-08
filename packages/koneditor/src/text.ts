import Konva from 'konva';
import Node from './node.ts';
import { uuid } from './uuid.ts';
import type Editor from './editor';
import type Group from './group';
import type { NodeAttrs, NodeType, TextDecoration } from './types';

interface TextConfig {
  nodeId?: string;
  attrs?: NodeAttrs;
  layer: Group;
}

class Text extends Node {
  className: NodeType = 'Text';
  text: Konva.Text;
  attrs: NodeAttrs;

  constructor({
    nodeId = uuid(),
    attrs = {},
    layer,
  }: TextConfig, editor: Editor) {
    super(editor, layer);
    this.className = 'Text';
    this.editor = editor;
    this.layer = layer;
    this.nodeId = nodeId;
    const {
      width,
      fill = '#000',
      fontFamily = 'Arial',
      bold = false,
      italic = false,
      textDecoration = '',
      text = '文本',
      fontSize = 14,
    } = attrs;
    this.attrs = {
      fill,
      fontFamily,
      bold,
      italic,
      textDecoration,
      text,
      fontSize,
    };
    this.minWidth = () => this.attrs.fontSize || 14;
    this.group = new Konva.Group({
      ...attrs,
      width,
    });
    let fontStyle = 'normal';
    if (bold) {
      if (italic) {
        fontStyle = 'italic bold';
      } else {
        fontStyle = 'bold';
      }
    } else if (italic) {
      fontStyle = 'italic';
    }
    layer.add(this);
    this.init();
    this.editing();
    this.text = new Konva.Text({
      name: 'text',
      x: 0,
      y: 0,
      width,
      fill,
      fontFamily,
      fontStyle,
      textDecoration,
      text,
      fontSize,
    });
    this.group.width(this.text.width());
    this.group.height(this.text.height());
    this.group.add(this.text);
  }

  setTransformer() {
    this.editor.tr.transformer.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']);
    this.editor.tr.transformer.rotateEnabled(true);
  }

  setWidth(width: number) {
    const v = width >= this.getMinWidth() ? width : this.getMinWidth();
    this.group.width(v);
    this.group.skewX(0);
    this.group.skewY(0);
    this.text.width(v);
    this.editor.tr.update();
  }

  getAttrs() {
    return {
      ...this.attrs,
      width: this.text.width(),
    };
  }

  getText() {
    return this.attrs.text;
  }

  setText(text: string, groupId?: string) {
    const oldValue = this.getText();
    const { nodeId } = this;
    this.attrs.text = text;
    this.text.text(text);
    this.group.width(this.text.width());
    this.editor.tr.update();
    this.dr.set(oldValue, text, groupId).then((step) => {
      this.editor.history.add({
        title: '修改文字文本',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setText(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setText(step.value);
        },
      });
    });
  }

  getFontFamily() {
    return this.attrs.fontFamily || 'Arial';
  }

  setFontFamily(fontFamily: string, groupId?: string) {
    const oldValue = this.getFontFamily();
    const { nodeId } = this;
    this.attrs.fontFamily = fontFamily;
    this.text.fontFamily(fontFamily);
    this.dr.set(oldValue, fontFamily, groupId).then((step) => {
      this.editor.history.add({
        title: '修改文字字体',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setFontFamily(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setFontFamily(step.value);
        },
      });
    });
  }

  setTextStyle() {
    const { bold, italic } = this.attrs;
    let fontStyle = 'normal';
    if (bold) {
      if (italic) {
        fontStyle = 'italic bold';
      } else {
        fontStyle = 'bold';
      }
    } else if (italic) {
      fontStyle = 'italic';
    }
    this.text.fontStyle(fontStyle);
  }

  getBold() {
    return !!this.attrs.bold;
  }

  setBold(bold: boolean, groupId?: string) {
    const oldValue = this.getBold();
    const { nodeId } = this;
    this.attrs.bold = bold;
    this.setTextStyle();
    this.dr.set(oldValue, bold, groupId).then((step) => {
      this.editor.history.add({
        title: bold ? '文字加粗' : '取消文字加粗',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setBold(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setBold(step.value);
        },
      });
    });
  }

  getItalic() {
    return !!this.attrs.italic;
  }

  setItalic(italic: boolean, groupId?: string) {
    const oldValue = this.getItalic();
    const { nodeId } = this;
    this.attrs.italic = italic;
    this.setTextStyle();
    this.dr.set(oldValue, italic, groupId).then((step) => {
      this.editor.history.add({
        title: italic ? '文字倾斜' : '取消文字倾斜',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setItalic(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setItalic(step.value);
        },
      });
    });
  }

  getFontSize() {
    return this.attrs.fontSize || 14;
  }

  setFontSize(fontSize: number, groupId?: string) {
    const oldValue = this.getFontSize();
    const { nodeId } = this;
    this.attrs.fontSize = fontSize;
    this.text.fontSize(fontSize);
    this.setWidth(this.text.width());
    this.dr.set(oldValue, fontSize, groupId).then((step) => {
      this.editor.history.add({
        title: '修改文字字体大小',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setFontSize(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setFontSize(step.value);
        },
      });
    });
  }

  getFill() {
    return (this.attrs.fill || '#000') as string;
  }

  setFill(fill: string, groupId?: string) {
    const oldValue = this.getFill();
    const { nodeId } = this;
    this.attrs.fill = fill;
    this.text.fill(fill);
    this.dr.set(oldValue, fill, groupId).then((step) => {
      this.editor.history.add({
        title: '修改文字颜色',
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setFill(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setFill(step.value);
        },
      });
    });
  }

  getTextDecoration() {
    return this.attrs.textDecoration || '';
  }

  setTextDecoration(textDecoration: TextDecoration, groupId?: string) {
    const oldValue = this.getTextDecoration();
    const { nodeId } = this;
    this.attrs.textDecoration = textDecoration;
    this.text.textDecoration(textDecoration);
    this.dr.set(oldValue, textDecoration, groupId).then((step) => {
      let title = '';
      if (textDecoration === 'underline') {
        title = '文字下划线';
      } else if (textDecoration === 'line-through') {
        title = '文字删除线';
      } else {
        title = '取消文字装饰';
      }
      this.editor.history.add({
        title,
        groupId: step.groupId,
        undo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setTextDecoration(step.oldValue);
        },
        redo: () => {
          const node = this.editor.findNode(nodeId) as Text;
          node?.setTextDecoration(step.value);
        },
      });
    });
  }
}

export default Text;
