import Konva from "konva";
import { getSelector } from "../Select";

// 删除元素
export const DeleteEvent = (stage: Konva.Stage) => {
  const container = stage.container();
  container.addEventListener("mouseout", () => {
    container.tabIndex = 1;
  });
  container.addEventListener("mouseover", () => {
    container.tabIndex = -1;
  });
  document.body.addEventListener("keydown", (e) => {
    // 我需要知道编辑器当前是否获取焦点
    if (container.tabIndex !== -1) return;
    // 按下delete键
    if (e.keyCode === 8 || e.keyCode === 46) {
      // 找到当前选中的元素
      const activeNode = getSelector(stage)[0];
      if (activeNode && activeNode.getNode()) {
        // 删除当前选中的元素
        activeNode.getNode().destroy();
        activeNode.destroy();
      }
    }
    e.preventDefault();
  });
};
