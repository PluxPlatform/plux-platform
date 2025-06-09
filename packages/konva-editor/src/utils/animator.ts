import { GifReader } from 'omggif';
import { times } from 'lodash';
import type { GifFrame } from '../types';

export function decodeFrames(reader: GifReader) {
  return times(reader.numFrames(), (frameIndex) => {
    const frameInfo = reader.frameInfo(frameIndex) as GifFrame;
    const pixels = new Uint8ClampedArray(reader.width * reader.height * 4);
    frameInfo.pixels = pixels;
    reader.decodeAndBlitFrameBGRA(frameIndex, pixels);
    return frameInfo;
  });
}

export function createBufferCanvas(frame: GifFrame, width: number, height: number) {
  const bufferCanvas = document.createElement('canvas');
  const bufferContext = bufferCanvas.getContext('2d');
  bufferCanvas.width = frame.width;
  bufferCanvas.height = frame.height;
  const imageData = bufferContext?.createImageData(width, height);
  imageData?.data.set(frame.pixels);
  if (imageData) {
    bufferContext?.putImageData(imageData, -frame.x, -frame.y);
  }
  return bufferCanvas;
}

export class Animator {
  width: number;

  height: number;

  private frames;

  private loopCount: number;

  private loops: number;

  private frameIndex: number;

  private running: boolean;

  private lastTime: number;

  private delayCompensation: number;

  onFrame?: (frame: GifFrame, i: number) => void;

  onDrawFrame?: (ctx: CanvasRenderingContext2D, frame: GifFrame, i: number) => void;

  private disposeFrame?: () => void;

  constructor(reader: GifReader) {
    this.width = reader.width;
    this.height = reader.height;
    this.frames = decodeFrames(reader);
    this.loopCount = reader.loopCount();
    this.loops = 0;
    this.frameIndex = 0;
    this.running = false;
    this.lastTime = 0;
    this.delayCompensation = 0;
  }

  start() {
    this.lastTime = new Date().valueOf();
    this.delayCompensation = 0;
    this.running = true;
    setTimeout(() => this.nextFrame(), 0);
    return this;
  }

  stop() {
    this.running = false;
    return this;
  }

  private advanceFrame() {
    this.frameIndex += 1;
    if (this.frameIndex >= this.frames.length) {
      if (this.loopCount !== 0 && this.loopCount === this.loops) {
        this.stop();
      } else {
        this.frameIndex = 0;
        this.loops += 1;
      }
    }
  }

  private enqueueNextFrame() {
    this.advanceFrame();
    while (this.running) {
      const frame = this.frames[this.frameIndex];
      const delta = new Date().valueOf() - this.lastTime;
      this.lastTime += delta;
      this.delayCompensation += delta;
      const frameDelay = frame.delay * 10;
      const actualDelay = frameDelay - this.delayCompensation;
      this.delayCompensation -= frameDelay;
      if (actualDelay < 0) {
        this.advanceFrame();
      } else {
        setTimeout(() => this.nextFrame(), actualDelay);
        break;
      }
    }
  }

  private nextFrameRender() {
    if (this.running) {
      const frame = this.frames[this.frameIndex];
      this.onFrame?.apply(this, [frame, this.frameIndex]);
      this.enqueueNextFrame();
    }
  }

  private nextFrame() {
    requestAnimationFrame(() => this.nextFrameRender());
  }

  reset() {
    this.frameIndex = 0;
    this.loops = 0;
    return this;
  }

  animateInCanvas(canvas: HTMLCanvasElement, setDimension = true) {
    const canvasElement = canvas;
    if (setDimension) {
      canvasElement.width = this.width;
      canvasElement.height = this.height;
    }
    const ctx = canvas.getContext('2d');
    this.onDrawFrame ??= (c, frame) => {
      c?.drawImage(frame.buffer, frame.x, frame.y);
    };
    this.onFrame ??= (frame, i) => {
      const fr = frame;
      fr.buffer ??= createBufferCanvas(frame, this.width, this.height);
      this.disposeFrame?.();
      if (frame.disposal === 2) {
        this.disposeFrame = () => ctx?.clearRect(0, 0, canvas.width, canvas.height);
      } else if (frame.disposal === 3) {
        const saved = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (saved) {
          this.disposeFrame = () => ctx?.putImageData(saved, 0, 0);
        }
      } else {
        this.disposeFrame = undefined;
      }
      if (ctx) {
        this.onDrawFrame?.apply(this, [ctx, frame, i]);
      }
    };
    this.start();
    return this;
  }
}
