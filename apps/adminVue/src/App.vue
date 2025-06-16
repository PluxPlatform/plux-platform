<script setup lang="ts">
import {
  useTemplateRef,
  ref,
  provide,
  onMounted,
  onUnmounted,
} from 'vue';
import _ from 'lodash';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ArrowLeft,
  ArrowRight,
  FullScreen,
  Pointer,
} from '@element-plus/icons-vue';
import Editor from './components/editor.vue';
import Operation from './components/operation.vue';
import { base64toFile } from './utils/base64toFile';
import type { EditorMode } from '@plux/editor';

const editor = useTemplateRef<typeof Editor>('editor');

provide('editor', editor);

const background = ref('');
const gridSize = ref(30);
const gridFixed = ref(false);
const alignLineFlag = ref(false);
const alignLineOnlySameType = ref(false);
const alignLineFixed = ref(false);
const selected = ref<any>(null);
provide('selected', selected);
const mode = ref<EditorMode>('A');
const intersection = ref(false);
const setSelectionMode = (inter?: boolean) => {
  mode.value = 'A';
  if (_.isBoolean(inter)) {
    intersection.value = inter;
  }
};
const handleAddPictrue = () => {
  ElMessageBox.prompt('URL', '插入图片').then(({ value }) => {
    const url = _.trim(value);
    editor.value?.addImage(url);
  });
};
const onKeydown = ({ key }: KeyboardEvent) => {
  if (key === 'a') {
    if (mode.value === 'A') {
      intersection.value = !intersection.value;
    } else {
      editor.value?.setMode('A');
    }
  } else if (key === 'e') {
    editor.value?.setMode('E');
  } else if (key === 'r') {
    editor.value?.setMode('R');
  } else if (key === 't') {
    editor.value?.setMode('T');
  } else if (key === 'b') {
    editor.value?.setMode('B');
  } else if (key === 'c') {
    editor.value?.setMode('C');
  } else if (key === 'p') {
    handleAddPictrue();
  } else if (key === 'g') {
    if (selected.value) {
      if (selected.value.length === 1) {
        if (selected.value[0].className === 'Group') {
          editor.value?.cancelGroup();
        }
      } else {
        editor.value?.group();
      }
    }
  }
};
const keydown = (event: KeyboardEvent) => {
  if (
    event.target instanceof HTMLElement
    && event.target.tagName !== 'INPUT'
    && event.target.tagName !== 'TEXTAREA'
  ) {
    onKeydown(event);
  }
};
const bindEvent = _.debounce(() => {
  document.addEventListener('keydown', keydown);
}, 100);
const unBindEvent = _.debounce(() => {
  document.removeEventListener('keydown', keydown);
}, 100);
onMounted(() => {
  bindEvent();
});
onUnmounted(() => {
  unBindEvent();
});
const operation = useTemplateRef('operation');
const snapshot = () => {
  editor.value?.exportPNG().then((img) => {
    const file = base64toFile(img, 'snapshot.png');
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
};
// const onDrop = (event) => {
//   console.log(event);
//   const { type } = event;
//   if (type === 'files') {
//     const { files, offsetX, offsetY } = event;
//     _.each(files, (file) => {
//       uploadImage(file).then(({ data }) => {
//         editor.value?.dropImage(data, offsetX, offsetY);
//       });
//     });
//   }
// };
const onDragMove = _.debounce(() => {
  operation.value?.getPosition();
}, 500);
const onMessage = (msg: string) => {
  ElMessage.warning(msg);
};
const onDo = () => {
  operation.value?.getPosition();
};
const lineTop = ref(true);
</script>

<template>
  <div class="demo">
    <header class="demo-header">
      <div class="demo-header-left">
        <h1 class="demo-title">设计工具</h1>
        <div class="demo-divider"></div>
        <div class="demo-his-btns">
          <el-button
            :icon="ArrowLeft"
            circle
            size="small"
            plain
            @click="() => editor?.undo()"
          ></el-button>
          <el-button
            :icon="ArrowRight"
            circle
            size="small"
            plain
            @click="() => editor?.redo()"
          ></el-button>
        </div>
      </div>
      <div class="demo-header-right">
        <el-tooltip content="适应画布">
          <el-button :icon="FullScreen" size="small"></el-button>
        </el-tooltip>
      </div>
    </header>
    <div class="demo-content">
      <div class="demo-left-toolbar">
        <el-tooltip content="选择工具" placement="right" :show-after="500">
          <div class="demo-tool-item" :class="{ 'is-active': mode === 'A' }" @click="mode = 'A'">
            <el-icon><Pointer></Pointer></el-icon>
          </div>
        </el-tooltip>
        <div class="demo-divider-horizontal"></div>
        <el-tooltip content="矩形" placement="right" :show-after="500">
          <div class="demo-tool-item" :class="{ 'is-active': mode === 'R' }" @click="mode = 'R'">R</div>
        </el-tooltip>
        <el-tooltip content="圆形" placement="right" :show-after="500">
          <div class="demo-tool-item" :class="{ 'is-active': mode === 'C' }" @click="mode = 'C'">C</div>
        </el-tooltip>
        <el-tooltip content="文字" placement="right" :show-after="500">
          <div class="demo-tool-item" :class="{ 'is-active': mode === 'T' }" @click="mode = 'T'">T</div>
        </el-tooltip>
        <el-tooltip content="按钮" placement="right" :show-after="500">
          <div class="demo-tool-item" :class="{ 'is-active': mode === 'B' }" @click="mode = 'B'">B</div>
        </el-tooltip>
        <el-tooltip content="图片" placement="right" :show-after="500">
          <div class="demo-tool-item" @click="handleAddPictrue">P</div>
        </el-tooltip>
        <el-tooltip content="开关" placement="right" :show-after="500">
          <div class="demo-tool-item">S</div>
        </el-tooltip>
      </div>
      <div class="demo-main">
        <Editor
          ref="editor"
          v-model:mode="mode"
          v-model:selected="selected"
          is-edit
          scroll
          history
          :intersection
          :background
          :gridSize
          :gridFixed
          :lineTop
          :alignLineFlag
          :alignLineOnlySameType
          :alignLineFixed
          @click="(e) => console.log('click', e)"
          @select="(e) => console.log('select', e)"
          @keydown="onKeydown"
          @do="onDo"
          @dragmove="onDragMove"
          @message="onMessage"
        ></Editor>
      </div>
      <div class="demo-right-panel">
        <div class="demo-panel-content">
          <Operation
            ref="operation"
            v-model:intersection="intersection"
            v-model:gridSize="gridSize"
            v-model:gridFixed="gridFixed"
            v-model:alignLineFlag="alignLineFlag"
            v-model:alignLineOnlySameType="alignLineOnlySameType"
            v-model:alignLineFixed="alignLineFixed"
          ></Operation>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9fafb;
  color: #1f2937;
}

.demo-header {
  height: 48px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.demo-header-left {
  display: flex;
  align-items: center;
  gap: 16px
}

.demo-title {
  font-size: 14px;
  font-weight: 500;
}

.demo-divider {
  height: 16px;
  width: 1px;
  background-color: #e5e7eb;
}

.demo-his-btns {
  display: flex;
  gap: 6px;
}

.demo-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.demo-left-toolbar {
  width: 56px;
  background-color: #1f2937;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.demo-tool-item {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #374151;
  }

  &.is-active {
    background-color: #4b5563;
  }

  .el-icon {
    font-size: 20px;
  }
}

.demo-divider-horizontal {
  width: 80%;
  height: 1px;
  background-color: #4b5563;
  margin: 8px 0;
}

.demo-main {
  flex: 1;
}

.demo-right-panel {
  width: 256px;
  background-color: #FFFFFF;
  border-left: 1px solid #e5e7eb;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.demo-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;

  > h3 {
    font-size: 14px;
    font-weight: 500;
  }
}

.demo-panel-content {
  padding: 16px;
  overflow-y: auto;
}
</style>