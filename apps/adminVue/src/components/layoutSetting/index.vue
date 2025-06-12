<script setup lang="ts">
import { inject, type Ref } from 'vue';
import _ from 'lodash';
import Block from '../block.vue';
import Btn, { type BtnProps } from './btn.vue';
import type { SelectEvent } from '@plux/editor';

const selected = inject<Ref<SelectEvent>>('selected');

const emit = defineEmits<{
  click: [key: string];
}>();

const levels: BtnProps[] = [
  { key: 'moveUp', name: '上层', icon: 'icon-gongyituguanli_cengji_shangyiceng' },
  { key: 'moveDown', name: '下层', icon: 'icon-gongyituguanli_cengji_xiayiceng' },
  { key: 'moveToTop', name: '置于顶层', icon: 'icon-gongyituguanli_cengji_zhiyudingceng' },
  { key: 'moveToBottom', name: '置于底层', icon: 'icon-gongyituguanli_cengji_zhiyudiceng' },
];

const positioning = [
  { key: 'flipX', name: '水平翻转', icon: 'icon-icon_yewulei_wulianpingtai_kaifazhezhongxin_wumoxingguanli_gongyituguanli_cengji_shuipingjingxiang' },
  { key: 'flipY', name: '垂直翻转', icon: 'icon-icon_yewulei_wulianpingtai_kaifazhezhongxin_wumoxingguanli_gongyituguanli_cengji_chuizhijingxiang' },
];

const tools = [
  { key: 'left', name: '左对齐', icon: 'icon-gongyituguanli_duiqi_zuoduiqi' },
  { key: 'right', name: '右对齐', icon: 'icon-gongyituguanli_duiqi_youduiqi' },
  { key: 'top', name: '顶对齐', icon: 'icon-gongyituguanli_duiqi_dingduiqi' },
  { key: 'bottom', name: '底对齐', icon: 'icon-gongyituguanli_duiqi_diduiqi' },
  { key: 'centerX', name: '水平居中对齐', icon: 'icon-gongyituguanli_duiqi_chuizhijuzhong' },
  { key: 'centerY', name: '垂直居中对齐', icon: 'icon-gongyituguanli_duiqi_shuipingjuzhong' },
  { key: 'distributionX', name: '水平分布对齐', icon: 'icon-shuipingfenbuduiqi' },
  { key: 'distributionY', name: '垂直分布对齐', icon: 'icon-chuizhifenbuduiqi' },
];

const isDisabled = (key: string, needCheckMulti = false) => {
  if (selected?.value) {
    if (needCheckMulti) {
      if (key === 'distributionX' || key === 'distributionY') {
        return selected.value.length < 3;
      }
      return selected.value.length < 2;
    }
    return (key === 'flipX' || key === 'flipY') && _.some(selected?.value, (item) => (
      !item.isNode
      && item.className !== 'Image'
    ));
  }
  return true;
};
</script>

<template>
  <Block title="对齐与排列">
    <div class="demo-editor-line">
      <Btn
        v-for="item in levels"
        :key="item.key"
        :data="item"
        :disabled="isDisabled(item.key)"
        @click="emit('click', item.key)"
      ></Btn>
      <el-divider direction="vertical"></el-divider>
      <Btn
        v-for="item in positioning"
        :key="item.key"
        :data="item"
        :disabled="isDisabled(item.key)"
        @click="emit('click', item.key)"
      ></Btn>
    </div>
    <div class="demo-editor-line">
      <Btn
        v-for="item in tools"
        :key="item.key"
        :data="item"
        :disabled="isDisabled(item.key, true)"
        @click="emit('click', item.key)"
      ></Btn>
    </div>
  </Block>
</template>

<style scoped lang="scss">
.demo-editor-line {
  display: flex;
  align-items: center;
  justify-content: space-between;

  + .demo-editor-line {
    margin-top: 10px;
  }
}
</style>
