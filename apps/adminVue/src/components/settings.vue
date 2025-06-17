<script setup lang="ts">
import RectSetting from './rectSetting.vue';
import TextSetting from './textSetting.vue';
import CircleSetting from './circleSetting.vue';
import ButtonSetting from './buttonSetting.vue';
import LineSetting from './lineSetting.vue';
import type {
  Nodes,
  Node,
  Rect,
  Text,
  Circle,
  Button,
  Line,
} from '@plux/editor';

const props = withDefaults(defineProps<{
  className: string;
  selected: Nodes<Node>;
  showTitle?: boolean;
}>(), {
  showTitle: false,
});

const getPosition = () => {
  console.log('getPosition');
};

defineExpose({
  getPosition,
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
  <ButtonSetting
    v-else-if="props.className === 'Button'"
    :selected="(props.selected as Nodes<Button>)"
    :showTitle
  ></ButtonSetting>
  <LineSetting
    v-else-if="props.className === 'Line'"
    :selected="(props.selected as Nodes<Line>)"
    :showTitle
  ></LineSetting>
</template>
