import Konva from "konva";
import { getStage } from "..";
import { createUUID } from "../../utils";
import ButtonShape from "./Button";
import CircleShape from "./Circle";
import HtmlShape from "./Html";
import ImageShape from "./Image";
import PolygonShape from "./Polygon";
import RectShape from "./Rect";
import { ShapeConfig, shapeType, ShapeSetting } from "./shape";
import StarShape from "./Star";
import TextShape from "./Text";

// 图形工厂类
export class ShapeFactory {
  static createShape(config: ShapeConfig): any {
    // 使用 uuid 生成唯一 ID
    if (!config.id) {
      config.id = createUUID();
    }
    switch (config.type.toLowerCase()) {
      case "rect":
        return new RectShape(config as ShapeConfig<"rect">);
      case "circle":
        return new CircleShape(config as ShapeConfig<"circle">);
      case "text":
        return new TextShape(config as ShapeConfig<"text">);
      case "polygon":
        return new PolygonShape(config as ShapeConfig<"polygon">);
      case "star":
        return new StarShape(config as ShapeConfig<"star">);
      case "image":
        return new ImageShape(config as ShapeConfig<"image">);
      case "button":
        return new ButtonShape(config as ShapeConfig<"button">);
      case "html":
        return new HtmlShape(config as ShapeConfig<"html">);
      default:
        throw new Error(`不支持的图形类型: ${config.type}`);
    }
  }
  static settingShape(config: ShapeSetting) {
    switch (config.type.toLowerCase()) {
      case "rect":
        return RectShape.update(config as ShapeSetting<"rect">);
      case "circle":
        return CircleShape.update(config as ShapeSetting<"circle">);
      case "text":
        return TextShape.update(config as ShapeSetting<"text">);
      case "polygon":
        return PolygonShape.update(config as ShapeSetting<"polygon">);
      case "star":
        return StarShape.update(config as ShapeSetting<"star">);
      case "image":
        return ImageShape.update(config as ShapeSetting<"image">);
      case "button":
        return ButtonShape.update(config as ShapeSetting<"button">);
      default:
        throw new Error(`不支持的图形类型: ${config.type}`);
    }
  }
  static getFormConfig<T extends shapeType = shapeType>(type: T, id: string) {
    switch (type.toLowerCase()) {
      case "rect":
        return RectShape.getFormConfig();
      case "circle":
        return CircleShape.getFormConfig();
      case "text":
        return TextShape.getFormConfig();
      case "polygon":
        return PolygonShape.getFormConfig();
      case "star":
        return StarShape.getFormConfig();
      case "image":
        return ImageShape.getFormConfig();
      case "button":
        return ButtonShape.getFormConfig();
      default:
        throw new Error(`不支持的图形类型: ${type}`);
    }
  }
  /**
   *
   * @param id 图形id
   * @abstract 将图形置顶
   * @returns void
   */
  static moveToTop(id: string) {
    const Stage = getStage()!;
    const node = Stage.findOne(`#${id}`);
    if (!node) return;
    node.moveToTop();
    node.draw();
  }
  /**
   *
   * @param id 图形id
   * @abstract 将图形置底
   * @returns  void
   */
  static moveToBottom(id: string) {
    const Stage = getStage()!;
    const node = Stage.findOne(`#${id}`);
    if (!node) return;
    node.moveToBottom();
    node.draw();
  }
  /**
   *
   * @param id 图形id
   * @abstract 将图形上移一层
   * @returns void
   */
  static moveUp(id: string) {
    const Stage = getStage()!;
    const node = Stage.findOne(`#${id}`);
    if (!node) return;
    node.moveUp();
    node.draw();
  }

  /**
   *
   * @param id 图形id
   * @abstract 将图形下移一层
   * @returns void
   */
  static moveDown(id: string) {
    const Stage = getStage()!;
    const node = Stage.findOne(`#${id}`);
    if (!node) return;
    node.moveDown();
    node.draw();
  }

  // 当前元素是否是自定义图形
  static isCustomShape(node: Konva.Node) {
    let type = node.getAttrs().type;
    if (!type) {
      type = node.parent?.getAttrs().type;
      node = node.parent as any;
    }
    if (type === "pipeline") return undefined;
    return node;
  }

  // 获取当前元素绑定的管道
  static getPipelineNodes(node: Konva.Node) {
    const pipelineIds = (node.getAttr("pipelineIds") || []) as string[];
    if (pipelineIds.length <= 0) return [];
    const Stage = node.getStage();
    const pipelines = pipelineIds.map((id) => {
      return Stage!.findOne(`#${id}`) as Konva.Line;
    });
    return pipelines;
  }
  static getPipelineIds(node: Konva.Node) {
    const pipelineIds = (node.getAttr("pipelineIds") || []) as number[];
    return pipelineIds;
  }
  // 设置当前元素绑定的管道
  static setNodePipeline(node: Konva.Node, pipeline: Konva.Line) {
    const pipelineIds = this.getPipelineIds(node);
    pipelineIds.push(pipeline.getAttr("id"));
    node.setAttr("pipelineIds", pipelineIds);
  }
  // 移除当前元素绑定的管道
  static removePipeline(node: Konva.Node, line?: Konva.Line) {
    const pipelineIds = this.getPipelineIds(node);
    if (!line) {
      node.setAttr("pipelineIds", []);
    } else {
      const index = pipelineIds.indexOf(line.getAttr("id"));
      pipelineIds.splice(index, 1);
      node.setAttr("pipelineIds", pipelineIds);
    }
  }
  //获取当前管道绑定的上下元素
  static getPipelineBindNodes(line: Konva.Line) {
    const startNode = line.getAttr("startNodeId");
    const endNode = line.getAttr("endNodeId");
    return {
      startNode,
      endNode,
    };
  }

  // 设置当前管道绑定的上下元素
  static setPipelineNodes(
    line: Konva.Line,
    startNode: Konva.Node,
    endNode: Konva.Node
  ) {
    line.setAttr("startNodeId", startNode.getAttr("id"));
    line.setAttr("endNodeId", endNode.getAttr("id"));
  }
}

export default ShapeFactory;
