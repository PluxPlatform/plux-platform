import Konva from 'konva';
import { endsWith } from 'lodash';
import Gifler from './utils/gifler';
import type Group from './group';

const errorImageUrl = '/micro-assets/platform-web/close.png';

function isGif(url: string) {
  return endsWith(url.split('?')[0].toLowerCase(), '.gif');
}

export const imgCatch: Record<string, Konva.Image> = {};

export function createImage(img: string | undefined, opt = {}, layer?: Konva.Group | Group) {
  return new Promise<Konva.Image>((resolve) => {
    const imgUrl = (img && img !== 'null') ? img : errorImageUrl;
    if (imgCatch[imgUrl]) {
      resolve(imgCatch[imgUrl].clone(opt));
    } else if (isGif(imgUrl) && layer) {
      const canvas = document.createElement('canvas');
      const gifler = new Gifler(imgUrl);
      gifler.frames(canvas, (ctx, frame) => {
        canvas.width = frame.width;
        canvas.height = frame.height;
        ctx.drawImage(frame.buffer, 0, 0);
        layer.draw();
      });
      const image = new Konva.Image({
        image: canvas,
        ...opt,
      });
      resolve(image);
    } else {
      Konva.Image.fromURL(imgUrl, (image) => {
        image.setAttrs(opt);
        imgCatch[imgUrl] = image;
        resolve(image);
      }, () => {
        Konva.Image.fromURL(errorImageUrl, (dartNode) => {
          dartNode.setAttrs(opt);
          resolve(dartNode);
        });
      });
    }
  });
}
