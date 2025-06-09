import { ShapeInfo } from "../defaultShaps";

const ImageMap = new Map<string, HTMLImageElement>();

export const createImage = async (attrs: ShapeInfo["attrs"]) => {
  return new Promise((resolve, reject) => {
    const src = attrs.src!;
    if (ImageMap.get(src)) {
      return resolve(ImageMap.get(src));
    }
    const ImgObj = new Image();
    ImgObj.src = src;
    ImgObj.onload = () => {
      ImageMap.set(src, ImgObj);
      resolve(ImgObj);
    };
  });
};
