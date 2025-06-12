<script setup lang="ts">
import { ref, computed, watch, inject, onMounted, type Ref } from "vue";
import _ from "lodash";
import useSetting from "./useSetting";
import Block from "./block.vue";
import type { EditorInstance } from "./editor";
import { Group } from "@plux/editor";
import type { Node, Nodes } from "@plux/editor";

const editor = inject<Ref<EditorInstance>>("editor");

const selected = inject<Ref<Nodes<Node>>>("selected");

type ValueType = number | string | void | null;

const x = ref<ValueType>(0);

const y = ref<ValueType>(0);

const rotation = ref<ValueType>(0);

const scale = ref<ValueType>(100);

const width = ref<ValueType>(0);

const height = ref<ValueType>(0);

const { getValue, setValue } = useSetting(() => selected!.value, 1);

const showWidth = computed(() => !_.some(
  selected?.value,
  (item) => !_.includes(['Rect', 'Circle', 'Image'], item.className),
));

const showHeight = computed(() => !_.some(
  selected?.value,
  (item) => !_.includes(['Rect', 'Circle', 'Image'], item.className),
));

const showRotation = computed(
  () =>
    !_.some(selected?.value, (item) =>
      _.includes(["TextGroup", "Group"], item.className)
    )
);

const showScale = computed(
  () => !_.some(selected?.value, (item) => item.className === "Group")
);

const getX = () => {
  x.value = getValue((item) => item.getX()) as number;
};

const getY = () => {
  y.value = getValue((item) => item.getY()) as number;
};

const getRotation = () => {
  rotation.value = getValue((item) => item.getRotation()) as number;
};

const getScale = () => {
  scale.value = getValue((item) => item.getScale(), 2) as number;
};

const getWidth = () => {
  width.value = getValue((item) => item.getWidth()) as number;
};

const getHeight = () => {
  height.value = getValue((item) => item.getHeight()) as number;
};

const getPosition = () => {
  getX();
  getY();
  if (showRotation.value) {
    getRotation();
  }
  if (showScale.value) {
    getScale();
  }
  if (showWidth.value) {
    getWidth();
  }
  if (showHeight.value) {
    getHeight();
  }
};

const setX = (val) => {
  setValue((item, groupId) => item.setX(val as number, groupId));
  getX();
};

const setY = (val) => {
  setValue((item, groupId) => item.setY(val as number, groupId));
  getY();
};

const setRotation = (val) => {
  setValue((item, groupId) => item.setRotation(val as number, groupId));
  getRotation();
};

const setScale = (val) => {
  setValue((item, groupId) => item.setScale(val as number, groupId));
  getScale();
};

const setWidth = (val) => {
  setValue((item, groupId) => item.setWidth(val as number, groupId));
  getWidth();
};

const setHeight = (val) => {
  setValue((item, groupId) => item.setHeight(val as number, groupId));
  getHeight();
};

defineExpose({ getPosition });

const init = () => {
  getPosition();
};

watch(() => selected?.value, init);

onMounted(init);

const group = () => {
  editor?.value.group();
};

const cancelGroup = () => {
  editor?.value.cancelGroup();
};

const pull = () => {
  editor?.value.pull(selected!.value);
};
</script>

<template>
  <Block title="布局">
    <el-form size="small" label-width="auto">
      <el-form-item label="横坐标">
        <el-input-number
          :model-value="x ?? undefined"
          :precision="1"
          @change="setX"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="纵坐标">
        <el-input-number
          :model-value="y ?? undefined"
          :precision="1"
          @change="setY"
        ></el-input-number>
      </el-form-item>
      <template v-if="showRotation">
        <el-form-item label="角度" class="is-flex">
          <el-input-number
            :model-value="rotation ?? undefined"
            :precision="1"
            @change="setRotation"
          ></el-input-number>
        </el-form-item>
      </template>
      <template v-if="showScale">
        <el-form-item label="缩放比例">
          <el-input-number
            :model-value="scale ?? undefined"
            :min="10"
            :precision="2"
            addon-after="%"
            @change="setScale"
          ></el-input-number>
        </el-form-item>
      </template>
      <el-form-item v-if="showWidth" label="宽度">
        <el-input-number
          :model-value="width ?? undefined"
          :precision="1"
          @change="setWidth"
        ></el-input-number>
      </el-form-item>
      <el-form-item v-if="showHeight" label="高度">
        <el-input-number
          :model-value="height ?? undefined"
          :precision="1"
          @change="setHeight"
        ></el-input-number>
      </el-form-item>
      <el-form-item
        v-if="
          selected
          && (
            selected.length > 1
            || selected[0].className === 'Group'
            || (
              (selected[0].layer as Group).root
              && (selected[0].layer as Group).children.length !== 1
            )
          )
        "
        label="组合"
      >
        <el-space>
          <el-button type="primary" @click="cancelGroup">取消组合</el-button>
          <template
            v-if="
              (
                selected[0].layer instanceof Group
                && selected[0].layer.root
              )
              || selected.length !== (selected[0].layer as Group).children.length
            "
          >
            <el-button v-if="selected.length > 1" type="primary" @click="group"
              >组合</el-button
            >
            <el-button
              v-if="
                !(selected[0].layer instanceof Group && selected[0].layer.root)
              "
              @click="pull"
              >移出当前组</el-button
            >
          </template>
        </el-space>
      </el-form-item>
    </el-form>
  </Block>
</template>
