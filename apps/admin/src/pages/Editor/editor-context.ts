import { createContext, useContext } from "react";
import { KonvaEditor } from "@plux/konva-editor";

// 类型定义
interface EditorContextType {
  editor: KonvaEditor | null;
  setEditor: (editor: KonvaEditor) => void;
}

// 默认值
const EditorContext = createContext<EditorContextType>({
  editor: null,
  setEditor: () => {},
});

// 快捷 Hook
export const useEditor = () => useContext(EditorContext);

export default EditorContext;
