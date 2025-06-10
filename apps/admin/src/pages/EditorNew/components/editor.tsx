import type React from "react";
import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Modal } from "antd";
import _ from "lodash";
import { Editor } from "@plux/editor";

// Custom hook to replace useElementSize from @vueuse/core
const useElementSize = (elementRef: React.RefObject<HTMLElement | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return size;
};

const FlowchartEditor = forwardRef(
  (
    {
      theme = "dark",
      isEdit = false,
      animation = true,
      mode = "A",
      intersection = false,
      defaultPipeline = false,
      showBindBtn = false,
      scroll = false,
      touch = false,
      history = false,
      selected = null,
      gridSize = 30,
      gridFixed = false,
      viewStyle = 0,
      lineTop = false,
      onClick,
      onDrop,
      onSelect,
      onDragmove,
      onModeChange,
      onKeydown,
      onCreateLine,
      onRemove,
      onMessage,
      onDo,
      onTouch,
      title,
      tools,
      extra,
      selectedValue,
      onSelectedChange,
      modeValue,
      onModeValueChange,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const editorWrapRef = useRef<HTMLDivElement>(null);
    const editorInstance = useRef<Editor | null>(null);

    const { width, height } = useElementSize(editorRef);

    const debounceToFit = useMemo(
      () =>
        _.debounce(() => {
          if (editorInstance.current) {
            editorInstance.current.fitStage();
          }
        }, 300),
      []
    );

    useEffect(() => {
      debounceToFit();
    }, [width, height, debounceToFit]);

    const currentMode = useMemo(() => {
      return modeValue !== undefined ? modeValue : mode;
    }, [modeValue, mode]);

    const currentSelected = useMemo(() => {
      return selectedValue !== undefined ? selectedValue : selected;
    }, [selectedValue, selected]);

    const init = useCallback(() => {
      if (!editorInstance.current && editorRef.current) {
        editorInstance.current = new Editor(editorRef.current, {
          isEdit,
          mode: currentMode,
          intersection,
          background: "",
          scroll,
          touch,
          history,
          lineTop,
          grid: {
            size: gridSize,
            fixed: gridFixed,
          },
          onKeydown: (event) => {
            onKeydown?.(event);
          },
          onModeChange: (newMode) => {
            onModeValueChange?.(newMode);
            onModeChange?.(newMode);
          },
          onClick: (event) => {
            onClick?.(event);
          },
          onDrop: (event) => {
            onDrop?.(event);
          },
          onSelect: (event) => {
            onSelectedChange?.(event);
            onSelect?.(event);
          },
          onDragmove: () => {
            onDragmove?.();
          },
          onRemove: () => {
            onRemove?.();
          },
          onMessage: (message) => {
            onMessage?.(message);
          },
          onDo: (event) => {
            onDo?.(event);
          },
          onTouch: () => {
            onTouch?.();
          },
        });
      }
    }, [
      isEdit,
      currentMode,
      intersection,
      theme,
      animation,
      scroll,
      touch,
      history,
      defaultPipeline,
      showBindBtn,
      viewStyle,
      lineTop,
      gridSize,
      gridFixed,
      onKeydown,
      onModeValueChange,
      onModeChange,
      onClick,
      onDrop,
      onSelectedChange,
      onSelect,
      onDragmove,
      onCreateLine,
      onRemove,
      onMessage,
      onDo,
      onTouch,
    ]);

    useEffect(() => {
      init();
    }, [init]);

    useEffect(() => {
      if (editorInstance.current) {
        if (gridSize === 0) {
          editorInstance.current.setGrid(false);
        } else {
          editorInstance.current.setGrid({
            size: gridSize,
            fixed: gridFixed,
          });
        }
      }
    }, [gridSize, gridFixed]);
    useEffect(() => {
      if (editorInstance.current) {
        editorInstance.current.setLineTop(lineTop);
      }
    }, [lineTop]);

    useEffect(() => {
      if (editorInstance.current) {
        editorInstance.current.enableScroll(scroll);
      }
    }, [scroll]);

    useEffect(() => {
      if (editorInstance.current) {
        editorInstance.current.enableTouch(touch);
      }
    }, [touch]);

    useEffect(() => {
      if (editorInstance.current) {
        editorInstance.current.setMode(currentMode);
      }
    }, [currentMode]);

    useEffect(() => {
      if (editorInstance.current) {
        editorInstance.current.options.intersection = intersection;
      }
    }, [intersection]);

    const cancelGroup = useCallback(() => {
      if (currentSelected && editorInstance.current) {
        const group =
          currentSelected.length === 1
            ? currentSelected[0]
            : currentSelected[0].layer;
        if (group.tid()) {
          Modal.confirm({
            title: "提示",
            content: "该组存在物模型信息，取消后将不会恢复，确认取消？",
            okText: "确认取消组合",
            cancelText: "我再考虑考虑",
            onOk: () => {
              if (editorInstance.current) {
                editorInstance.current.cancelGroup(group);
              }
            },
          });
        } else {
          editorInstance.current.cancelGroup(group);
        }
      }
    }, [currentSelected]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        fit: () => editorInstance.current?.fit(),
        destroy: () => editorInstance.current?.destroy(),
        dragIn: (event, data) => {
          event.dataTransfer?.setData("thing", JSON.stringify(data));
        },
        dropImage: (src, offsetX, offsetY) =>
          editorInstance.current?.dropImage(src, offsetX, offsetY),
        exportPNG: () => editorInstance.current?.exportPNG(),
        exportData: () => editorInstance.current?.exportData(),
        findNode: (nodeId) => editorInstance.current?.findNode(nodeId),
        getAllNodes: () => editorInstance.current?.nodeIds,
        changeElementsPosition: (type) =>
          editorInstance.current?.changeElementsPosition(type),
        group: () => editorInstance.current?.group(),
        cancelGroup,
        pull: (group) => editorInstance.current?.pull(group),
        undo: () => editorInstance.current?.undo(),
        redo: () => editorInstance.current?.redo(),
      }),
      [cancelGroup]
    );

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
  }
);

FlowchartEditor.displayName = "FlowchartEditor";

export default FlowchartEditor;
