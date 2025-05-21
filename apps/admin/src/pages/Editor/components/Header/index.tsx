import { Button } from "antd";
import { PipelineDrawer } from "@plux/konva-editor";
import { useEditor } from "../../editor-context";
import { useEffect, useState } from "react";

const EditorHeader = () => {
  const { editor } = useEditor();
  const [pipelineDrawer, setPipelineDrawer] = useState<PipelineDrawer>();
  useEffect(() => {
    setTimeout(() => {
      const pipelineDrawer1 = new PipelineDrawer({
        pipeColor: "#3498db",
        pipeWidth: 10,
        showArrow: false,
        arrowColor: "#e74c3c",
        flowAnimation: false,
        flowSpeed: 3,
      });
      setPipelineDrawer(pipelineDrawer1);
    }, 1000);
  }, []);
  return (
    <div className="h-[40px] flex justify-between items-center pr-5 pl-5">
      <div>EditorHeader</div>
      <div>
        <Button
          onClick={() => {
            editor?.testAnimateLine();
          }}
        >
          自动创建三条线，并开始动画
        </Button>
        &nbsp;
        <Button>适应画布</Button>
        &nbsp;
        <Button
          onClick={() => {
            pipelineDrawer?.startDrawing();
          }}
        >
          画线
        </Button>
        &nbsp;
        <Button>保存</Button>
      </div>
    </div>
  );
};

export default EditorHeader;
