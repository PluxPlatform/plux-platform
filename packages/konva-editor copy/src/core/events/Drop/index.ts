import Konva from "konva";
import ShapeFactory from "../../shape";
import { LAYERNAME } from "../..";
import { computedXY } from "../../../utils";

export const DropEvent = (dom: HTMLElement, stage: Konva.Stage) => {
  const layer = stage
    .getLayers()
    .find((item) => item.attrs.name === LAYERNAME.MAIN) as Konva.Layer;
  dom.ondragenter = function (e) {
    e.preventDefault();
  };

  dom.ondragover = function (e) {
    e.preventDefault();
  };

  dom.ondragleave = function (e) {
    e.preventDefault();
  };
  dom.ondrop = (e) => {
    e.preventDefault();
    try {
      const component = JSON.parse(e.dataTransfer!.getData("component"));
      const { x, y } = computedXY(stage, e.offsetX, e.offsetY);
      component.defaultProps.x = x;
      component.defaultProps.y = y;

      const shape = ShapeFactory.createShape(component);
      shape.render(layer);
    } catch (error) {
      console.log("error", error);
    }
  };
};
