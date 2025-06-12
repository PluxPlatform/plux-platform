<script setup lang="ts">
import {
  reactive,
  watch,
  onMounted,
} from 'vue';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
} from '@ant-design/icons-vue';
import _ from 'lodash';
import FontSelect from './fontSelect.vue';
import Block from './block.vue';
import useSetting from './useSetting.ts';
import type { Nodes, Text, TextDecoration } from '@plux/editor';

const props = defineProps<{
  selected: Nodes<Text>;
  showTitle: boolean;
}>();

type TextSetting = {
  text: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  textDecoration: string;
  fontSize: number;
  fill: string;
};

const textSetting = reactive<TextSetting>({
  text: '文本',
  fontFamily: 'Arial',
  bold: false,
  italic: false,
  textDecoration: '',
  fontSize: 14,
  fill: '#000000',
});

const { getValue, setValue } = useSetting<Text>(() => props.selected);

const getText = () => {
  textSetting.text = getValue((item) => item.getText()) as string;
};

const getFontFamily = () => {
  textSetting.fontFamily = getValue((item) => item.getFontFamily()) as string;
};

const getBold = () => {
  textSetting.bold = getValue((item) => item.getBold()) as boolean;
};

const getItalic = () => {
  textSetting.italic = getValue((item) => item.getItalic()) as boolean;
};

const getTextDecoration = () => {
  textSetting.textDecoration = getValue((item) => item.getTextDecoration()) as string;
};

const getFontSize = () => {
  textSetting.fontSize = getValue((item) => item.getFontSize()) as number;
};

const getFill = () => {
  textSetting.fill = getValue((item) => item.getFill()) as string;
};

const setText = (val: string) => {
  setValue((item, groupId) => item.setText(val, groupId));
  getText();
};

const checkText = () => {
  if (!_.trim(textSetting.text)) {
    setText('文本');
  }
};

const setFontFamily = (val: string) => {
  setValue((item, groupId) => item.setFontFamily(val, groupId));
  getFontFamily();
};

const toggleBold = () => {
  setValue((item, groupId) => item.setBold(!textSetting.bold, groupId));
  getBold();
};

const toggleItalic = () => {
  setValue((item, groupId) => item.setItalic(!textSetting.italic, groupId));
  getItalic();
};

const setTextDecoration = (val: TextDecoration) => {
  const v = textSetting.textDecoration === val ? '' : val;
  setValue((item, groupId) => item.setTextDecoration(v, groupId));
  getTextDecoration();
};

const setFontSize = (val) => {
  setValue((item, groupId) => item.setFontSize(val as number, groupId));
  getFontSize();
};

const setFill = (val) => {
  setValue((item, groupId) => item.setFill(val, groupId));
  getFill();
};

const init = () => {
  getText();
  getFontFamily();
  getBold();
  getItalic();
  getTextDecoration();
  getFontSize();
  getFill();
};

watch(() => props.selected, init);

onMounted(init);
</script>

<template>
  <Block :title="props.showTitle ? '文字' : ''">
    <el-form size="small" label-width="auto">
      <el-form-item label="文本">
        <el-input
          type="textarea"
          :model-value="textSetting.text"
          @update:model-value="setText"
          @blur="checkText"
        ></el-input>
      </el-form-item>
      <el-form-item label="字体">
        <FontSelect
          :model-value="textSetting.fontFamily"
          :prefix-options="[{ label: '默认', value: 'Arial' }]"
          @change="setFontFamily"
        ></FontSelect>
        <el-button-group class="demo-editor-custom-label-button" style="margin-top: 5px;">
          <el-button
            :type="textSetting.bold ? 'primary' : 'default'"
            :icon="BoldOutlined"
            @click="toggleBold"
          ></el-button>
          <el-button
            :type="textSetting.italic ? 'primary' : 'default'"
            :icon="ItalicOutlined"
            @click="toggleItalic"
          ></el-button>
          <el-button
            :type="textSetting.textDecoration === 'underline' ? 'primary' : 'default'"
            :icon="UnderlineOutlined"
            @click="setTextDecoration('underline')"
          ></el-button>
          <el-button
            :type="textSetting.textDecoration === 'line-through' ? 'primary' : 'default'"
            :icon="StrikethroughOutlined"
            @click="setTextDecoration('line-through')"
          ></el-button>
        </el-button-group>
      </el-form-item>
      <el-form-item label="字体大小">
        <el-input-number
          :model-value="textSetting.fontSize"
          :min="6"
          :max="40"
          @change="setFontSize"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="颜色">
        <el-input
          class="demo-editor-color-picker"
          type="color"
          :model-value="textSetting.fill"
          @update:model-value="setFill"
        ></el-input>
      </el-form-item>
    </el-form>
  </Block>
</template>
