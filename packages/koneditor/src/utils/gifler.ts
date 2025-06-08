import { GifReader } from 'omggif';
import { Animator } from './animator';
import type { GifFrame } from '../types';

export type GiflerCallback = (animator: Animator) => void;

export type Selector = string | HTMLCanvasElement;

export function getCanvasElement(selector: Selector) {
  let element: HTMLCanvasElement | null = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector) as HTMLCanvasElement | null;
  } else if (selector instanceof HTMLCanvasElement) {
    element = selector;
  }
  if (!element) {
    throw new Error('Unexpected selector type. Valid types are query-selector-string/canvas-element');
  }
  return element;
}

export class Gifler {
  private xhr: XMLHttpRequest;

  constructor(url: string) {
    this.xhr = new XMLHttpRequest();
    this.xhr.open('GET', url, true);
    this.xhr.responseType = 'arraybuffer';
  }

  private wrapXhrCallback(callback: GiflerCallback) {
    return () => callback(new Animator(new GifReader(new Uint8Array(this.xhr.response))));
  }

  get(callback: GiflerCallback) {
    this.xhr.onload = this.wrapXhrCallback(callback);
    this.xhr.send();
    return this;
  }

  animate(selector: Selector) {
    const canvas = getCanvasElement(selector);
    this.xhr.onload = this.wrapXhrCallback((animator) => animator.animateInCanvas(canvas));
    this.xhr.send();
    return this;
  }

  frames(
    selector: Selector,
    onDrawFrame: (ctx: CanvasRenderingContext2D, frame: GifFrame, i: number) => void,
    setCanvasDimensions = false,
  ) {
    const canvas = getCanvasElement(selector);
    this.xhr.onload = this.wrapXhrCallback((animator) => {
      const inst = animator;
      inst.onDrawFrame = onDrawFrame;
      return animator.animateInCanvas(canvas, setCanvasDimensions);
    });
    this.xhr.send();
    return this;
  }
}

export default Gifler;
