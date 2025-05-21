import Konva from "konva";
import { ShapeInfo } from "../defaultShaps";

export const createImage = async (
  attrs: ShapeInfo["attrs"],
  callback?: (m: Konva.Image) => void
) => {
  return new Promise((resolve, reject) => {
    const ImgObj = new Image();
    ImgObj.src = attrs.src!;
    ImgObj.onload = () => {
      const img = new Konva.Image({
        ...attrs,
        type: "image",
        image: ImgObj,
      });
      callback?.(img);
      resolve(img);
    };
  });
};
