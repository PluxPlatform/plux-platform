import _ from 'lodash';
import type Editor from './editor';
import type Node from './node';

export default class HistoryRecord {
  editor: Editor;

  callback: (node: Node, val: number) => void;

  data: Record<string, {
    oldValue?: number;
    value?: number;
  }>;

  constructor(editor: Editor, callback: (node: Node, val: number) => void) {
    this.editor = editor;
    this.callback = callback;
    this.data = {};
  }

  set(nodeId: string, oldValue?: number, value?: number) {
    this.data[nodeId] = {
      oldValue,
      value,
    };
  }

  undo() {
    _.each(this.data, ({ oldValue = 0 }, nodeId) => {
      const node = this.editor.findNode(nodeId);
      if (node) {
        this.callback(node, oldValue);
      }
    });
  }

  redo() {
    _.each(this.data, ({ value = 0 }, nodeId) => {
      const node = this.editor.findNode(nodeId);
      if (node) {
        this.callback(node, value);
      }
    });
  }
}
