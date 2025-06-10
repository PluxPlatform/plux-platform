import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import _ from "lodash";
import { Editor, EditorOptions } from "@plux/editor";

interface Props extends Partial<EditorOptions> {
  tools: React.ReactNode;
  title?: React.ReactNode;
  extra?: React.ReactNode;
}

const EditorBody = forwardRef((props: Props, ref) => {
  const { tools, title, extra, isEdit, mode, onKeydown, onModeChange } = props;
  const editorRef = useRef<HTMLDivElement>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  useImperativeHandle(ref, () => ({}));

  // dom加载完成触发
  useEffect(() => {
    const editor = new Editor(editorRef.current!, {
      isEdit,
      mode,
      onKeydown: (event) => {
        onKeydown?.(event);
      },
      onModeChange: (mode) => {
        onModeChange?.(mode);
      },
    });
    setEditorInstance(editor);
    return () => {
      editor.destroy();
    };
  }, []);
  return (
    <div
      ref={editorWrapRef}
      className="inl-flowchart-editor flex-1"
      style={{ height: "100%" }}
    >
      {(tools || title || extra) && (
        <div className="inl-flowchart-editor-header">
          {title && <div className="inl-flowchart-editor-title">{title}</div>}
          {tools && <div className="inl-flowchart-editor-tools">{tools}</div>}
          {extra && <div className="inl-flowchart-editor-extra">{extra}</div>}
        </div>
      )}
      <div
        ref={editorRef}
        className="inl-flowchart-editor-main w-full h-full" /* style={{ backgroundColor: background }} */
        style={{
          outline: "none",
        }}
      />
    </div>
  );
});

export default EditorBody;
