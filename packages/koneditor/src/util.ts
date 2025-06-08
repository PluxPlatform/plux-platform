import { debounce, isNull, type DebouncedFunc } from 'lodash';

interface Step {
  groupId: string;
  oldValue: any;
  value: any;
}

export class DebounceRecord {
  temp: null | any;

  tempGroupId: null | string;

  change: DebouncedFunc<(val: any, resolve: (step: Step) => void) => void>;

  constructor() {
    this.temp = null;
    this.tempGroupId = null;
    this.change = debounce((val, resolve) => {
      resolve({
        groupId: this.tempGroupId!,
        oldValue: this.temp,
        value: val,
      });
      this.temp = null;
      this.tempGroupId = null;
    }, 300);
  }

  set(oldValue: any, val: any, groupId?: string) {
    return new Promise<Step>((resolve) => {
      if (groupId) {
        if (isNull(this.tempGroupId)) {
          this.tempGroupId = groupId;
          this.temp = oldValue;
        }
        this.change(val, resolve);
      }
    });
  }
}

export default DebounceRecord;
