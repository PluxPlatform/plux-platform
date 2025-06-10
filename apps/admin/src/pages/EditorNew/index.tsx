import type React from "react";
import style from "./index.module.less";
import { useState, useRef } from 'react';
import {
  Divider,
  Button,
  Tooltip,
  message,
} from "antd";
import { UndoOutlined, RedoOutlined, ExpandOutlined } from '@ant-design/icons';
import Editor from './components/editor';

const EditorNewPage: React.FC = () => {
  const editorRef = useRef(null);
  const [mode, setMode] = useState('A');
  const [intersection, setIntersection] = useState(false);
  const onKeydown = ({ key }: KeyboardEvent) => {
    if (key === 'a') {
      if (mode === 'A') {
        setIntersection(!intersection);
      } else {
        setMode('A');
      }
      message.info(intersection ? '相交选择' : '包含选择');
    }
  };

  return (
    <div className={style.editorWrap}>
      <div className={style.editorHeader}>
        <div className="flex items-center">
          <div className={style.editorTitle}>设计工具</div>
          <Divider type="vertical" style={{
            borderInlineStartColor: '#c8c8c8',
            marginLeft: '16px',
          }}></Divider>
          <Button type="text" icon={<UndoOutlined></UndoOutlined>}></Button>
          <Button type="text" icon={<RedoOutlined></RedoOutlined>}></Button>
        </div>
        <Button icon={<ExpandOutlined></ExpandOutlined>} size="small">适应画布</Button>
      </div>
      <div className={style.editorContent}>
        <div className={style.editorMenu}>
          <div className={style.editorTools}>
            <div className={style.editorToolsGroup}>
              <Tooltip title={'包含选择'} placement="right">
                <Button className={`${style.editorToolsBtn} ${mode === 'A' ? style['is-active'] : ''}`} onClick={() => setMode('A')}>A</Button>
              </Tooltip>
            </div>
            <div className={style.editorToolsGroup}>
              <Button className={`${style.editorToolsBtn} ${mode === 'R' ? style['is-active'] : ''}`} onClick={() => setMode('R')}>R</Button>
              <Button className={`${style.editorToolsBtn} ${mode === 'C' ? style['is-active'] : ''}`}>C</Button>
              <Button className={`${style.editorToolsBtn} ${mode === 'T' ? style['is-active'] : ''}`} onClick={() => setMode('T')}>T</Button>
              <Button className={`${style.editorToolsBtn} ${mode === 'P' ? style['is-active'] : ''}`}>P</Button>
            </div>
          </div>
        </div>
        <div className={style.editorMain}>
          <Editor
            ref={editorRef}
            isEdit={true}
            mode={mode}
            onKeydown={onKeydown}
            onModeChange={setMode}
          ></Editor>
        </div>
      </div>
    </div>
  );
};

export default EditorNewPage;
