import { KonvaEditor } from "@plux/konva-editor";
import { useEffect } from "react";
import SiderMenu from "./components/Sider";
import EditorHeader from "./components/Header";
import EditorProps from "./components/Props";

let editor: KonvaEditor;

const EditorPage = () => {
  // 初始化编辑器
  useEffect(() => {
    editor = new KonvaEditor({ container: "#editor" });
    editor.init("editor");
  }, []);
  return (
    <div className="flex flex-1 relative">
      <SiderMenu />
      <EditorProps />
      <div className="flex flex-1 flex-col">
        <EditorHeader />
        <div id="editor" className="flex-1"></div>
      </div>
    </div>
  );
};

export default EditorPage;
