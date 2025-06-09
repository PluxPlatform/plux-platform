import Konva from "konva";
import { BaseShape } from "../defautShape";
import { ShapeConfig } from "../shape";

// 图片
class ImageShape extends BaseShape<"image"> {
  render(layer: Konva.Layer): void {
    const { x, y, fill, stroke, strokeWidth, src } = this.config.defaultProps;
    // 创建图片
    const imageObj = new Image();
    imageObj.src = src;
    imageObj.onload = () => {
      const image = new Konva.Image({
        id: this.config.id,
        type: "image",
        x,
        y,
        fill,
        stroke,
        strokeWidth,
        image: imageObj,
        draggable: true,
      });
      // 添加到图层
      layer.add(image);
    };
  }
  static update(config: Partial<ShapeConfig<"image">>) {}
  static getFormConfig() {}
}

export default ImageShape;
