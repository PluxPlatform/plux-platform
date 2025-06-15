<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue';
import _ from 'lodash';
import Block from './block.vue';
import useSetting from './useSetting';
import type { Nodes, Button } from '@plux/editor';

const props = defineProps<{
  selected: Nodes<Button>;
  showTitle: boolean;
}>();

type ButtonSetting = {
  text: string;
  type: string;
  backgroundColor: string;
  color: string;
};

const buttonSetting = reactive<ButtonSetting>({
  text: '按钮',
  type: 'primary',
  backgroundColor: '',
  color: '',
});

const { getValue, setValue } = useSetting<Button>(() => props.selected);

const getText = () => {
  buttonSetting.text = getValue((item) => item.getText()) as string;
};

const setText = (val: string) => {
  setValue((item, groupId) => item.setText(val, groupId));
  getText();
};

const getType = () => {
  buttonSetting.type = getValue((item) => item.getType()) as string;
};

const setType = (val: string) => {
  setValue((item, groupId) => item.setType(val, groupId));
};

const init = () => {
  getText();
  getType();
};

watch(() => props.selected, init);

onMounted(init);
</script>

<template>
  <Block :title="props.showTitle ? '按钮' : ''">
    <el-form size="small" label-width="auto">
      <el-form-item label="文字">
        <el-input :model-value="buttonSetting.text" @update:model-value="setText"></el-input>
      </el-form-item>
      <el-form-item label="类型">
        <el-select :model-value="buttonSetting.type" @update:model-value="setType">
          <el-option value="default" label="Default"></el-option>
          <el-option value="primary" label="Primary"></el-option>
          <el-option value="success" label="Success"></el-option>
          <el-option value="warning" label="Warning"></el-option>
          <el-option value="danger" label="Danger"></el-option>
          <el-option value="info" label="Info"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </Block>
</template>