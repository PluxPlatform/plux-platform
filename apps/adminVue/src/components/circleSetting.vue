<script setup lang="ts">
import {
  reactive,
  watch,
  onMounted,
} from 'vue';
import useSetting from './useSetting.ts';
import Block from './block.vue';
import type { Nodes, Circle } from '@plux/editor';

const props = defineProps<{
  selected: Nodes<Circle>;
  showTitle: boolean;
}>();

type CircleSetting = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
};

const circleSetting = reactive<CircleSetting>({
  fill: '#d8d8d8',
  stroke: '#d8d8d8',
  strokeWidth: 1,
  radius: 50,
});

const { getValue, setValue } = useSetting<Circle>(() => props.selected);

const getFill = () => {
  circleSetting.fill = getValue((item) => item.getFill()) as string;
};

const getStroke = () => {
  circleSetting.stroke = getValue((item) => item.getStroke()) as string;
};

const getStrokeWidth = () => {
  circleSetting.strokeWidth = getValue((item) => item.getStrokeWidth()) as number;
};

const getRadius = () => {
  circleSetting.radius = getValue((item) => item.getRadius()) as number;
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

const setRadius = (val) => {
  setValue((item, groupId) => item.setRadius(val as number, groupId));
  getRadius();
};

const init = () => {
  getFill();
  getStroke();
  getStrokeWidth();
  getRadius();
};

watch(() => props.selected, init);

onMounted(init);
</script>

<template>
  <Block :title="props.showTitle ? '圆形' : ''">
    <el-form size="small" label-width="auto">
      <el-form-item label="填充颜色">
        <el-input
          class="demo-editor-color-picker"
          type="color"
          :model-value="circleSetting.fill"
          @update:model-value="setFill"
        ></el-input>
      </el-form-item>
      <el-form-item label="边框颜色">
        <el-input
          class="demo-editor-color-picker"
          type="color"
          :model-value="circleSetting.stroke"
          @update:model-value="setStroke"
        ></el-input>
      </el-form-item>
      <el-form-item label="边框宽度">
        <el-input-number
          :model-value="circleSetting.strokeWidth"
          :min="0"
          @change="setStrokeWidth"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="半径">
        <el-input-number
          :model-value="circleSetting.radius"
          :min="0"
          @change="setRadius"
        ></el-input-number>
      </el-form-item>
    </el-form>
  </Block>
</template>
