<script setup lang="ts">
import {
  reactive,
  watch,
  onMounted,
  computed,
} from 'vue';
import useSetting from './useSetting.ts';
import Block from './block.vue';
import type { Nodes, Line } from '@plux/editor';

const props = defineProps<{
  selected: Nodes<Line>;
  showTitle: boolean;
}>();

type LineSetting = {
  points: number[];
  lineWidth: number;
};

const lineSetting = reactive<LineSetting>({
  points: [],
  lineWidth: 1,
});

const { getValue, setValue } = useSetting<Line>(() => props.selected);

const getPoints = () => {
  lineSetting.points = getValue((item) => item.getPoints()) as number[];
};

const getLineWidth = () => {
  lineSetting.lineWidth = getValue((item) => item.getLineWidth()) as number;
};

const points = computed({
  get() {
    return lineSetting.points && lineSetting.points.length > 4;
  },
  set() {
    setValue((item) => item.togglePoints());
    getPoints();
  },
});

const setLineWidth = (val) => {
  setValue((item) => item.setLineWidth(val as number));
  getLineWidth();
};

const init = () => {
  getPoints();
  getLineWidth();
};

watch(() => props.selected, init);

onMounted(init);
</script>

<template>
  <Block :title="props.showTitle ? '管路' : ''">
    <el-form size="small" label-width="auto">
      <el-form-item v-if="lineSetting.points" label="样式">
        <el-radio-group v-model="points">
          <el-radio-button :value="false" label="直线"></el-radio-button>
          <el-radio-button :value="true" label="折线"></el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="宽度">
        <el-input-number
          :model-value="lineSetting.lineWidth"
          :min="1"
          @change="setLineWidth"
        ></el-input-number>
      </el-form-item>
    </el-form>
  </Block>
</template>
