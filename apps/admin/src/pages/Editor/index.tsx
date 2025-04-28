import { KonvaEditor } from "@plux/konva-editor";
import { useEffect, useState } from "react";
import SiderMenu from "./components/Sider";
import EditorHeader from "./components/Header";
import EditorProps from "./components/Props";
import EditorContext from "./editor-context";

const EditorPage = () => {
  const [editor, setEditor] = useState<KonvaEditor | null>(null);

  useEffect(() => {
    const newEditor = new KonvaEditor({ container: "#editor" });
    newEditor.init("editor");
    setEditor(newEditor);
  }, []);
  return (
    <EditorContext.Provider value={{ editor, setEditor }}>
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
    </EditorContext.Provider>
  );
};

export default EditorPage;
