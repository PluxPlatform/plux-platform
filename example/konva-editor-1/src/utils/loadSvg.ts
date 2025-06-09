import { Group } from "konva/lib/Group";
import { Path } from "konva/lib/shapes/Path";

export default function loadSvg(svgText: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const paths = doc.querySelectorAll("path");
  const SVGGroup = new Group();
  paths.forEach((path) => {
    const data = path.getAttribute("d");
    if (data) {
      const konvaPath = new Path({
        data,
        stroke: "black",
        strokeWidth: 1,
      });
      SVGGroup.add(konvaPath);
    }
  });
  return SVGGroup;
}
