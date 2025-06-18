<script setup lang="ts">
import {
  useTemplateRef,
  inject,
  computed,
  type Ref,
} from 'vue';
import { useVModels } from '@vueuse/core';
import _ from 'lodash';
import LayoutSetting from './layoutSetting/index.vue';
import LayoutOptions from './layoutOptions.vue';
import Settings from './settings.vue';
import { getClassName } from './getClassName';
import type { EditorInstance } from './editor';

const editor = inject<Ref<EditorInstance>>('editor');
const selected = inject<any>('selected');

const props = defineProps<{
  intersection: boolean;
  gridSize: number;
  gridFixed: boolean;
  alignLineFlag: boolean;
  alignLineFixed: boolean;
  alignLineOnlySameType: boolean;
  background: string;
}>();

const emit = defineEmits<{
  'update:intersection': [intersection: boolean];
  'update:gridSize': [gridSize: number];
  'update:gridFixed': [gridFixed: boolean];
  'update:alignLineFlag': [alignLineFlag: boolean];
  'update:alignLineFixed': [alignLineFixed: boolean];
  'update:alignLineOnlySameType': [alignLineOnlySameType: boolean];
  'update:background': [background: string];
}>();

const {
  intersection,
  gridSize,
  gridFixed,
  alignLineFlag,
  alignLineFixed,
  alignLineOnlySameType,
  background,
} = useVModels(props, emit);

const isNode = computed(() => {
  if (selected?.value) {
    return !_.some(selected.value, (item) => item.className === 'Line');
  }
  return false;
});

const other = computed(() => {
  if (selected?.value) {
    return _.pick(_.groupBy(selected.value, 'className'), [
      'Text',
      'Rect',
      'Circle',
      'Button',
      'Line',
    ]);
  }
  return {};
});

const layoutOptions = useTemplateRef('layoutOptions');
const settings = useTemplateRef('settings');

const getPosition = () => {
  layoutOptions.value?.getPosition();
  _.each(settings.value, (setting) => {
    setting.getPosition();
  });
};

defineExpose({
  getPosition,
});

const customBack = computed({
  get() {
    return !!background.value;
  },
  set(val) {
    if (val) {
      background.value = '#000B29';
    } else {
      background.value = '';
    }
  },
});
</script>

<template>
  <el-form v-if="!selected" size="small">
    <el-form-item label="框选方式">
      <el-radio-group v-model="intersection">
        <el-radio-button :value="true">相交选择</el-radio-button>
        <el-radio-button :value="false">包含选择</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="背景色">
      <el-space>
        <el-switch
          v-model="customBack"
          active-text="自定义"
          inactive-text="透明"
          inline-prompt
          size="default"
        ></el-switch>
        <el-input v-if="customBack" v-model="background" type="color" style="width: 86px;"></el-input>
      </el-space>
    </el-form-item>
    <el-collapse :model-value="['grid', 'guide']">
      <el-collapse-item title="网格" name="grid">
        <el-form-item label="间距">
          <el-input-number v-model="gridSize" :min="0" :max="500" :precision="0"></el-input-number>
        </el-form-item>
        <el-form-item label="吸附">
          <el-switch v-model="gridFixed"></el-switch>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="辅助线" name="guide">
        <el-form-item label="对齐辅助线">
          <el-switch v-model="alignLineFlag"></el-switch>
        </el-form-item>
        <template v-if="alignLineFlag">
          <el-form-item label="吸附">
            <el-switch v-model="alignLineFixed"></el-switch>
          </el-form-item>
          <el-form-item label="仅同类型对齐">
            <el-checkbox v-model="alignLineOnlySameType"></el-checkbox>
          </el-form-item>
        </template>
      </el-collapse-item>
    </el-collapse>
  </el-form>
  <template v-else>
    <template v-if="isNode">
      <LayoutSetting @click="editor!.changeElementsPosition"></LayoutSetting>
      <LayoutOptions ref="layoutOptions"></LayoutOptions>
    </template>
    <template v-if="_.size(other) === 1">
      <Settings
        ref="settings"
        v-for="className in _.keys(other)"
        :key="className"
        :className
        :selected="other[className]"
        show-title
      ></Settings>
    </template>
    <el-tabs v-else-if="_.size(other) > 1">
      <el-tab-pane
        v-for="className in _.keys(other)"
        :key="className"
        :label="getClassName(className)"
      >
        <Settings
          ref="settings"
          :className
          :selected="other[className]"
        ></Settings>
      </el-tab-pane>
    </el-tabs>
  </template>
</template>