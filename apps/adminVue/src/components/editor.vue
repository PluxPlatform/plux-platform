<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  onMounted,
} from 'vue';
import { useElementSize } from '@vueuse/core';
import _ from 'lodash';
import Editor from '@plux/editor';

import type {
  EditorMode,
  SelectEvent,
  ImageSrc,
  NodeId,
  PositionEnum,
} from '@plux/editor';

const props = withDefaults(defineProps<{
  background?: string;
  isEdit?: boolean;
  mode?: EditorMode;
  intersection?: boolean;
  scroll?: boolean;
  touch?: boolean;
  history?: boolean;
  selected?: SelectEvent;
  gridSize?: number;
  gridFixed?: boolean;
  lineTop?: boolean;
  alignLineFlag?: boolean;
  alignLineOnlySameType?: boolean;
  alignLineFixed?: boolean;
}>(), {
  background: '',
  isEdit: false,
  mode: 'A',
  intersection: false,
  scroll: false,
  touch: false,
  history: false,
  selected: null,
  gridSize: 30,
  gridFixed: false,
  lineTop: false,
  alignLineFlag: false,
  alignLineOnlySameType: false,
  alignLineFixed: false,
});

const emit = defineEmits([
  'click',
  'drop',
  'select',
  'dragmove',
  'update:selected',
  'update:mode',
  'modeChange',
  'keydown',
  'createLine',
  'remove',
  'message',
  'do',
  'touch',
]);

let editor: Editor;

const editorRef = ref();

const { width, height } = useElementSize(editorRef);

const debounceToFit = _.debounce(() => {
  editor.fitStage();
}, 300);

watch([width, height], debounceToFit);

const modeComputed = computed({
  get() {
    return props.mode;
  },
  set(val) {
    emit('update:mode', val);
    emit('modeChange', val);
  },
});

const selectedComputed = computed({
  get() {
    return props.selected;
  },
  set(val) {
    emit('update:selected', val);
    emit('select', val);
  },
});

const init = () => {
  if (!editor) {
    editor = new Editor(editorRef.value, {
      isEdit: props.isEdit,
      mode: props.mode,
      intersection: props.intersection,
      scroll: props.scroll,
      touch: props.touch,
      history: props.history,
      lineTop: props.lineTop,
      grid: {
        size: props.gridSize,
        fixed: props.gridFixed,
      },
      guideLine: {
        enable: props.alignLineFlag,
        sameType: props.alignLineOnlySameType,
        fixed: props.alignLineFixed,
      },
      onKeydown: (event) => {
        emit('keydown', event);
      },
      onModeChange: (mode) => {
        modeComputed.value = mode;
      },
      onClick: (event) => {
        emit('click', event);
      },
      onDrop: (event) => {
        emit('drop', event);
      },
      onSelect: (event) => {
        selectedComputed.value = event;
      },
      onDragmove: () => {
        emit('dragmove');
      },
      onRemove: () => {
        emit('remove');
      },
      onMessage: (message) => {
        emit('message', message);
      },
      onDo: (event) => {
        emit('do', event);
      },
      onTouch: () => {
        emit('touch');
      },
      onContextMenu: (x, y, menuList) => {
        console.log(x, y, menuList);
      },
    })
  }
};

onMounted(() => {
  init();
});

watch(() => props.gridSize, (val) => {
  if (val === 0) {
    editor.setGrid(false);
  } else {
    editor.setGrid({
      size: val,
      fixed: props.gridFixed,
    });
  }
});

watch(() => props.gridFixed, (val) => {
  editor.setGrid({
    size: props.gridSize,
    fixed: val,
  });
});

watch(() => [props.alignLineFlag, props.alignLineOnlySameType, props.alignLineFixed], () => {
  editor.setGuideLine({
    enable: props.alignLineFlag,
    sameType: props.alignLineOnlySameType,
    fixed: props.alignLineFixed,
  });
});

watch(() => props.lineTop, (val) => {
  editor.setLineTop(val);
});

watch(() => props.scroll, (val) => {
  editor.enableScroll(val);
});

watch(() => props.touch, (val) => {
  editor.enableTouch(val);
});

const fit = () => editor.fit();

const exportPNG = () => editor.exportPNG();

const exportData = () => editor.exportData();

const destroy = () => {
  editor.destroy();
};

const dropImage = (src: ImageSrc, offsetX: number, offsetY: number) => {
  editor.dropImage(src, offsetX, offsetY);
};

const addImage = (url) => {
  editor.addImage(url);
};

const setMode = (mode: EditorMode) => editor.setMode(mode);

watch(() => props.mode, (mode) => {
  setMode(mode);
});

const setIntersection = (inter: boolean) => {
  editor.options.intersection = inter;
};

watch(() => props.intersection, (inter) => {
  setIntersection(inter);
});

const findNode = (nodeId: NodeId) => editor.findNode(nodeId);

const getAllNodes = () => editor.nodeIds;

const changeElementsPosition = (type: PositionEnum) => {
  editor.changeElementsPosition(type);
};

const group = () => editor.group();

const cancelGroup = () => {
  const group = selectedComputed.value.length === 1
    ? selectedComputed.value[0]
    : selectedComputed.value[0].layer;
  editor.cancelGroup(group);
};

const editorWrap = ref();

const pull = (group) => editor.pull(group);

const undo = () => editor.undo();

const redo = () => editor.redo();

const centerX = (nodes) => {
  editor.tr.setList(nodes);
  editor.tr.centerX();
  editor.tr.clear();
};

const selectAllType = (type: string) => {
  editor.selectAllType(type);
};

defineExpose({
  fit,
  // resetTexts,
  destroy,
  dropImage,
  addImage,
  setMode,
  exportPNG,
  exportData,
  findNode,
  getAllNodes,
  changeElementsPosition,
  group,
  cancelGroup,
  pull,
  undo,
  redo,
  centerX,
  selectAllType,
});

watch(() => props.background, (val) => {
  editor.changeBackground(val);
});
</script>

<template>
  <div ref="editorWrap" class="editor-wrap" style="height: 100%;">
    <div ref="editorRef" class="editor-main" style="height: 100%; outline: none;"></div>
  </div>
</template>
