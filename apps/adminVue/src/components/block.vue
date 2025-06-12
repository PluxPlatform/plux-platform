<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div class="demo-block">
    <div class="demo-block-title">
      <slot name="title">
        {{ props.title }}
      </slot>
    </div>
    <div class="demo-block-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.demo-block-title {
  color: #a4aabf;
  font-size: 12px;
}

.demo-block-content {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>