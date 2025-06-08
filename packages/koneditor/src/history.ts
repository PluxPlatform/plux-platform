import {
  extend,
  times,
  each,
} from 'lodash';
import type { Step, DoEvent } from './types';

interface Options {
  enabled: boolean;
  onDo?: (event: DoEvent) => void;
}

class History {
  options: Options;

  started: boolean;

  index: number;

  list: Step[];

  constructor(opt: Options) {
    this.options = extend({
      enabled: false,
      onDo: () => {},
    }, opt);
    this.started = false;
    this.index = -1;
    this.list = [];
  }

  start() {
    if (this.options.enabled) {
      this.started = true;
    }
  }

  add(step: Step) {
    if (this.started) {
      this.index += 1;
      this.list[this.index] = step;
      this.list.length = this.index + 1;
    }
  }

  triggerEvent(event?: any) {
    if (this.options.onDo) {
      this.options.onDo({
        index: this.index,
        list: this.list,
        prev: this.index > -1,
        next: this.index < this.list.length - 1,
        event,
      });
    }
  }

  undoHandler() {
    if (this.index > -1) {
      this.list[this.index].undo();
      this.index -= 1;
      if (
        this.index > -1
        && this.list[this.index + 1].groupId
        && this.list[this.index].groupId === this.list[this.index + 1].groupId
      ) {
        this.undoHandler();
      } else {
        this.triggerEvent();
      }
    }
  }

  undo(step = 1) {
    each(times(step), () => {
      this.undoHandler();
    });
  }

  redoHandler() {
    if (this.index < this.list.length - 1) {
      this.list[this.index + 1].redo();
      this.index += 1;
      if (
        this.index < this.list.length - 1
        && this.list[this.index].groupId
        && this.list[this.index].groupId === this.list[this.index + 1].groupId
      ) {
        this.redoHandler();
      } else {
        this.triggerEvent();
      }
    }
  }

  redo(step = 1) {
    each(times(step), () => {
      this.redoHandler();
    });
  }
}

export default History;
