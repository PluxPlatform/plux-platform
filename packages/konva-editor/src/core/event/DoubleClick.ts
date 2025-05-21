import { Stage } from "konva/lib/Stage";
import { isPipLine, PipelineEditor } from "../../plugins/PipeLineDrawer";
import { Line } from "konva/lib/shapes/Line";

export const DoubleClick = (stage: Stage) => {
  stage.on("dblclick", (e) => {
    if (isPipLine(e.target as Line)) {
      PipelineEditor(e.target as Line, stage);
    }
  });
};
