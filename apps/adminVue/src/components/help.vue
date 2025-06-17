<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);

const open = () => {
  visible.value = true;
};

defineExpose({ open });

const list = [
  { key: 'A', title: '选择，可在“包含选择”和“相交选择”之间切换' },
  { key: 'E', title: '连线' },
  { key: 'R', title: '矩形' },
  { key: 'C', title: '圆形' },
  { key: 'T', title: '文字' },
  { key: 'B', title: '按钮' },
  { key: 'P', title: '图片' },
  { key: 'Ctrl+S', title: '保存' },
  { key: 'Ctrl+C', title: '复制' },
  { key: 'Ctrl+V', title: '粘贴' },
  { key: 'Ctrl+Z', title: '撤销' },
  { key: 'Ctrl+Y', title: '还原' },
  { key: 'Ctrl', title: '按住 Ctrl，多选元素（只能选择同组下的多个元素）' },
  { key: 'Ctrl+A', title: '全选' },
  { key: '↑+↓+←+→', title: '移动所选元素 1 像素' },
  { key: 'Ctrl+↑+↓+←+→', title: '移动所选元素 10 像素' },
  { key: 'Ctrl+G', title: '组合/取消组合' },
  { key: 'Del/Back', title: '删除所选元素' },
  { key: 'Space', title: '按住空格，支持左键拖动画布' },
  { key: 'Ctrl+鼠标滑轮', title: '按住 Ctrl，支持滑轮缩放画布' },
  { key: '鼠标滑轮', title: '垂直移动画布' },
  { key: 'Shift+鼠标滑轮', title: '按住 Shift，支持滑轮水平移动画布' },
];
</script>

<template>
  <el-dialog
    v-model="visible"
    title="帮助"
    width="800"
  >
    <table class="demo-editor-help">
      <tbody>
        <tr v-for="{ key, title } in list" :key>
          <th>
            <el-tag v-for="tag in key.split('+')" :key="tag" type="info">{{ tag }}</el-tag>
          </th>
          <td>{{ title }}</td>
        </tr>
      </tbody>
    </table>
  </el-dialog>
</template>

<style scoped lang="scss">
::v-deep(.el-tag) {
  margin-left: 2px;
  margin-right: 2px;
  cursor: pointer;
}
</style>