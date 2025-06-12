<script setup lang="ts">
import RectSetting from './rectSetting.vue';
import TextSetting from './textSetting.vue';
import CircleSetting from './circleSetting.vue';
import type {
  Nodes,
  Node,
  Rect,
  Text,
  Circle,
} from '@plux/editor';

const props = withDefaults(defineProps<{
  className: string;
  selected: Nodes<Node>;
  showTitle?: boolean;
}>(), {
  showTitle: false,
});
</script>

<template>
  <RectSetting
    v-if="props.className === 'Rect'"
    :selected="(props.selected as Nodes<Rect>)"
    :showTitle
  ></RectSetting>
  <TextSetting
    v-else-if="props.className === 'Text'"
    :selected="(props.selected as Nodes<Text>)"
    :showTitle
  ></TextSetting>
  <CircleSetting
    v-else-if="props.className === 'Circle'"
    :selected="(props.selected as Nodes<Circle>)"
    :showTitle
  ></CircleSetting>
</template>
