import { Button } from "antd";
import { PipelineDrawer } from "@plux/konva-editor";
import { useEffect } from "react";

let pipelineDrawer!: PipelineDrawer;
const EditorHeader = () => {
  useEffect(() => {
    setTimeout(() => {
      pipelineDrawer = new PipelineDrawer({
        pipeColor: "#3498db",
        pipeWidth: 10,
        showArrow: false,
        arrowColor: "#e74c3c",
        flowAnimation: false,
        flowSpeed: 3,
      });
    }, 1000);
  }, []);
  return (
    <div className="h-[40px] flex justify-between items-center pr-5 pl-5">
      <div>EditorHeader</div>
      <div>
        <Button>适应画布</Button>
        &nbsp;
        <Button onClick={() => pipelineDrawer.startDrawing()}>画线</Button>
        &nbsp;
        <Button>保存</Button>
      </div>
    </div>
  );
};

export default EditorHeader;
