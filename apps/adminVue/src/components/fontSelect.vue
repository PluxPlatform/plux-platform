<script setup lang="ts">
import { computed } from 'vue';
import _ from 'lodash';

type Option = {
  label: string;
  value: string;
};

const props = withDefaults(defineProps<{
  modelValue: string;
  suffixOptions?: Option[];
  prefixOptions?: Option[];
}>(), {
  suffixOptions: () => [],
  prefixOptions: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
}>();

const value = computed({
  get: () => props.modelValue,
  set: (val: string) => {
    emit('update:modelValue', val);
    emit('change', val);
  },
});

const options = computed(() => _.concat(
  props.prefixOptions,
  [
    { label: '微软雅黑', value: 'Microsoft YaHei' },
    { label: '宋体', value: 'Calibri' },
    { label: '优设标题黑', value: 'YouSheBiaoTiHei' },
    { label: 'DINPro light', value: 'DINPro-Light' },
    { label: 'DINPro Regular', value: 'DINPro-Regular' },
    { label: 'DINPro Medium', value: 'DINPro-Medium' },
    { label: 'DINPro Bold', value: 'DINPro-Bold' },
    { label: 'DINPro Black', value: 'DINPro-Black' },
    { label: '普惠体 Light', value: 'Alibaba-PuHuiTi-Light' },
    { label: '普惠体 Regular', value: 'Alibaba-PuHuiTi-Regular' },
    { label: '普惠体 Medium', value: 'Alibaba-PuHuiTi-Medium' },
    { label: '普惠体 Bold', value: 'Alibaba-PuHuiTi-Bold' },
    { label: '普惠体 Heavy', value: 'Alibaba-PuHuiTi-Heavy' },
    { label: '思源黑体 ExtraLight', value: 'SourceHanSansCN-ExtraLight' },
    { label: '思源黑体 Light', value: 'SourceHanSansCN-Light' },
    { label: '思源黑体 Regular', value: 'SourceHanSansCN-Regular' },
    { label: '思源黑体 Normal ', value: 'SourceHanSansCN-Normal' },
    { label: '思源黑体 Medium', value: 'SourceHanSansCN-Medium' },
    { label: '思源黑体 Bold', value: 'SourceHanSansCN-Bold' },
    { label: '思源黑体 Heavy', value: 'SourceHanSansCN-Heavy' },
  ],
  props.suffixOptions,
));
</script>

<template>
  <el-select
    v-bind="$attrs"
    v-model="value"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    ></el-option>
  </el-select>
</template>
