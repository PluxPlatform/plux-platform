<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue';
import useSetting from './useSetting.ts';
import Block from './block.vue';
import type { Nodes, Rect } from '@plux/editor';

const props = defineProps<{
  selected: Nodes<Rect>;
  showTitle: boolean;
}>();

type RectSetting = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
};

const rectSetting = reactive<RectSetting>({
  fill: '#d8d8d8',
  stroke: '#d8d8d8',
  strokeWidth: 1,
  cornerRadius: 0,
});

const { getValue, setValue } = useSetting<Rect>(() => props.selected);

const getFill = () => {
  rectSetting.fill = getValue((item) => item.getFill()) as string;
};

const getStroke = () => {
  rectSetting.stroke = getValue((item) => item.getStroke()) as string;
};

const getStrokeWidth = () => {
  rectSetting.strokeWidth = getValue((item) => item.getStrokeWidth()) as number;
};

const getCornerRadius = () => {
  rectSetting.cornerRadius = getValue((item) => item.getCornerRadius()) as number;
};

const setFill = (val: string) => {
  setValue((item, groupId) => item.setFill(val, groupId));
  getFill();
};

const setStroke = (val: string) => {
  setValue((item, groupId) => item.setStroke(val, groupId));
  getStroke();
};

const setStrokeWidth = (val) => {
  setValue((item, groupId) => item.setStrokeWidth(val as number, groupId));
  getStrokeWidth();
};

const setCornerRadius = (val) => {
  setValue((item, groupId) => item.setCornerRadius(val as number, groupId));
  getCornerRadius();
};

const init = () => {
  getFill();
  getStroke();
  getStrokeWidth();
  getCornerRadius();
};

watch(() => props.selected, init);

onMounted(init);
</script>

<template>
  <Block :title="props.showTitle ? '矩形' : ''">
    <el-form size="small" label-width="auto">
      <el-form-item label="填充颜色">
        <el-input
          class="demo-editor-color-picker"
          type="color"
          :model-value="rectSetting.fill"
          @update:model-value="setFill"
        ></el-input>
      </el-form-item>
      <el-form-item label="边框颜色">
        <el-input
          class="demo-editor-color-picker"
          type="color"
          :model-value="rectSetting.stroke"
          @update:model-value="setStroke"
        ></el-input>
      </el-form-item>
      <el-form-item label="边框宽度">
        <el-input-number
          :model-value="rectSetting.strokeWidth"
          :min="0"
          @change="setStrokeWidth"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="圆角">
        <el-input-number
          :model-value="rectSetting.cornerRadius"
          :min="0"
          @change="setCornerRadius"
        ></el-input-number>
      </el-form-item>
    </el-form>
  </Block>
</template>
