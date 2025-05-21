import Konva from "konva";
import { createAnimateLine, LineAnimateType } from "./Line";

export const testAnimateLine = (LineLayer: Konva.Layer) => {
  const line = new Konva.Line({
    points: [5, 70, 140, 23, 250, 60, 300, 20],
    stroke: "black",
    strokeWidth: 15,
    lineCap: "round",
    lineJoin: "round",
    closed: false,
    id: "test-line",
  });

  const line2 = new Konva.Line({
    points: [5, 170, 140, 123, 250, 160, 300, 120],
    stroke: "black",
    strokeWidth: 15,
    lineCap: "round",
    lineJoin: "round",
    closed: false,
    id: "test-line2",
  });

  const line3 = new Konva.Line({
    points: [5, 270, 140, 223, 250, 260, 300, 220],
    stroke: "black",
    strokeWidth: 15,
    lineCap: "round",
    lineJoin: "round",
    closed: false,
    id: "test-line3",
  });

  LineLayer.add(line, line2, line3);

  LineLayer.draw();
  createAnimateLine({
    lineId: "test-line",
    speed: 0.2,
    type: LineAnimateType.default,
  });

  createAnimateLine({
    lineId: "test-line2",
    speed: 0.6,
    type: LineAnimateType.dot,
  });

  createAnimateLine({
    lineId: "test-line3",
    speed: 0.6,
    type: LineAnimateType.flow,
  });
};
