import { Line } from "konva/lib/shapes/Line";

export function cl() {
  const line = new Line({
    points: [100, 0, 100, 50, 120, 70, 100, 100, 100, 130],
    fill: "red",
    stroke: "blue",
    strokeWidth: 8,
    listening: true,
    draggable: false,
  });
  return line;
}
