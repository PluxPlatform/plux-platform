<script setup lang="ts">
import {
  inject,
  ref,
  computed,
  watch,
} from 'vue';
import { useVModels } from '@vueuse/core';

const editor = inject('editor');
const selected = inject('selected');

const props = defineProps<{
  intersection: boolean;
}>();

const emit = defineEmits<{
  'update:intersection': [intersection: boolean];
}>();

const {
  intersection,
} = useVModels(props, emit);
</script>

<template>
  <el-form v-if="!selected" size="small">
    <el-form-item label="框选方式">
      <el-radio-group v-model="intersection">
        <el-radio-button :value="true">相交选择</el-radio-button>
        <el-radio-button :value="false">包含选择</el-radio-button>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>