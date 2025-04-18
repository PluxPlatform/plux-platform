import Konva from "konva";
import { BaseShape } from "../defautShape";
import { ShapeConfig } from "../shape";
import { getStage } from "../..";
import { createHtmlOverlay } from "../../components/Html";

class HtmlShape extends BaseShape<"html"> {
  private overlay?: ReturnType<typeof createHtmlOverlay>;
  private node?: Konva.Rect;

  render(layer: Konva.Layer): void {
    const { x, y, width, height, id, html } = this.config.defaultProps;
    // 移除旧的 overlay
    if (this.overlay) {
      this.overlay.destroy();
      this.overlay = undefined;
    }
    // 移除旧的 node
    if (this.node) {
      this.node.destroy();
      this.node = undefined;
    }

    // 用一个不可见的 Rect 作为锚点
    const rect = new Konva.Rect({
      id,
      x,
      y,
      width,
      height,
      fill: "red",
      visible: false,
      name: "html-anchor",
    });
    layer.add(rect);
    this.node = rect;

    // 渲染 overlay
    const stage = getStage()!;
    this.overlay = createHtmlOverlay(stage, rect, html);

    // 支持拖动
    rect.draggable(true);
    rect.on("dragmove", () => {
      this.overlay?.update();
    });
  }

  static update(config: Partial<ShapeConfig<"html">>) {
    const stage = getStage();
    if (!stage || !config.id) return;
    const rect = stage.findOne(`#${config.id}`) as Konva.Rect;
    if (!rect) return;
    // 更新 rect 的位置和大小
    rect.setAttrs(config);

    // 更新 overlay
    // 这里假设你有办法拿到 overlay 的引用，或通过 rect 关联
    // 可通过 rect.setAttr('overlay', overlay) 方式存储引用
    const overlay = (rect as any).overlay as ReturnType<
      typeof createHtmlOverlay
    >;
    if (overlay) {
      overlay.update();
    }
    rect.draw();
  }

  static getFormConfig() {
    return [
      [
        {
          name: "x",
          label: "x轴位置",
          type: "number",
        },
        {
          name: "y",
          label: "y轴位置",
          type: "number",
        },
        {
          name: "width",
          label: "宽度",
          type: "number",
        },
        {
          name: "height",
          label: "高度",
          type: "number",
        },
        {
          name: "html",
          label: "HTML内容",
          type: "textarea",
        },
      ],
    ];
  }
}

export default HtmlShape;
