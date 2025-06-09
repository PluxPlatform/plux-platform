import Konva from 'konva';
import { uniqueId } from 'lodash';

class Mover {
  enable: boolean;

  isStart: boolean;

  callback: (offset: MouseEvent) => void;

  stage: Konva.Stage;

  uid: string;

  fastOnce: boolean;

  constructor(stage: Konva.Stage, callback: (offset: MouseEvent) => void, fastOnce = false) {
    this.stage = stage;
    this.callback = callback;
    this.enable = fastOnce;
    this.isStart = fastOnce;
    this.fastOnce = fastOnce;
    this.uid = fastOnce ? `.${uniqueId()}` : '';
    stage.on(`mousedown${this.uid} touchstart${this.uid}`, () => {
      this.start();
    });
    stage.on(`mousemove${this.uid} touchmove${this.uid}`, ({ evt }) => {
      this.move(evt);
    });
    stage.on(`mouseup${this.uid} touchend${this.uid}`, () => {
      this.stop();
    });
  }

  start() {
    if (this.enable) {
      this.isStart = true;
    }
  }

  move(evt: MouseEvent) {
    if (this.isStart) {
      this.callback(evt);
    }
  }

  stop() {
    this.isStart = false;
    if (this.fastOnce) {
      this.stage.off(`mousedown${this.uid} touchstart${this.uid}`);
      this.stage.off(`mousemove${this.uid} touchmove${this.uid}`);
      this.stage.off(`mouseup${this.uid} touchend${this.uid}`);
    }
  }
}

export default Mover;
