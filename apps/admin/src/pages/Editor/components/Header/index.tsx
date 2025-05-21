import { Button } from "antd";
import { useEditor } from "../../editor-context";

const EditorHeader = () => {
  const { editor } = useEditor();
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
        <Button>画线</Button>
        &nbsp;
        <Button>保存</Button>
      </div>
    </div>
  );
};

export default EditorHeader;
