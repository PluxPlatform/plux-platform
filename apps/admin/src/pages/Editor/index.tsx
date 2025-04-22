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
      <div className="flex-1 flex-col overflow-hidden relative">
        <EditorHeader />

        <div
          style={{
            backgroundSize: "20px 20px",
          }}
          id="editor"
          className="h-[calc(100%-40px)] overflow-hidden relative z-10 bg-[linear-gradient(to_right,theme(colors.gray.200)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.gray.200)_1px,transparent_1px)]"
        ></div>
      </div>
    </div>
  );
};

export default EditorPage;
