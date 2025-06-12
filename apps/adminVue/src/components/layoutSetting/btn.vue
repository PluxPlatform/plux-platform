<script setup lang="ts">
import type { PropType } from 'vue';

export type BtnProps = {
  key: string;
  name: string;
  icon: string;
};

const props = defineProps<{
  data: BtnProps;
  disabled: boolean;
}>();

const emit = defineEmits<{
  click: [key: string];
}>();

const onClick = (key: string) => {
  if (!props.disabled) {
    emit('click', key);
  }
};
</script>

<template>
  <el-tooltip :content="props.data.name">
    <div
      class="demo-editor-operation-icon"
      :class="{ 'is-disabled': props.disabled }"
      @click="onClick(props.data.key)"
    >
      <i class="iconfont" :class="props.data.icon"></i>
    </div>
  </el-tooltip>
</template>

<style scoped lang="scss">
.demo-editor-operation-icon {
  width: 20px;
  height: 20px;
  background-color: #f3f3f3;
  line-height: 20px;
  text-align: center;
  cursor: pointer;

  > .iconfont {
    font-size: 18px;
  }

  &:hover {
    background-color: #e3d3d3;
    color: #333;
  }

  &.is-disabled:hover {
    background-color: inherit;
    cursor: not-allowed;
  }
}
</style>
