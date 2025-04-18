import Konva from "konva";

/**
 * 在 Konva 的 Stage 上渲染原生 HTML 元素，并与节点同步
 * @param stage Konva.Stage 实例
 * @param node 任意 Konva 节点
 * @param html 一段 HTML 字符串
 * @returns { element, update, destroy }
 */
export function createHtmlOverlay(
  stage: Konva.Stage,
  node: Konva.Node,
  html: string
): {
  element: HTMLDivElement;
  update: () => void;
  destroy: () => void;
} {
  // 获取 Konva 容器
  const container = stage.container();

  // 创建 overlay div
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.pointerEvents = "auto";
  overlay.innerHTML = html;
  overlay.style.transformOrigin = "top left";
  overlay.style.zIndex = "10";

  // 插入到 Konva 容器
  container.appendChild(overlay);

  // 计算并同步 overlay 位置和缩放
  function update() {
    // 节点左上角在舞台容器中的位置
    const scale = stage.scale() || { x: 1, y: 1 };
    const rotation = node.getAbsoluteRotation();

    // 节点的宽高（如果有）
    const width = (node as any).width ? (node as any).width() : 0;
    const height = (node as any).height ? (node as any).height() : 0;

    // 计算节点左上角相对于容器的像素坐标
    const transform = node.getAbsoluteTransform().copy();
    const topLeft = transform.point({ x: 0, y: 0 });

    overlay.style.left = `${topLeft.x}px`;
    overlay.style.top = `${topLeft.y}px`;

    // 缩放和旋转
    overlay.style.transform = `scale(${scale.x},${scale.y}) rotate(${rotation}deg)`;

    // 可选：设置 overlay 尺寸（如果需要和节点一致）
    if (width && height) {
      overlay.style.width = `${width}px`;
      overlay.style.height = `${height}px`;
    }
  }
  overlay.onmousedown = (e) => {
    e.preventDefault();
    // 获取容器的边界
    const containerRect = stage.container().getBoundingClientRect();
    let startPointer = { x: e.clientX - containerRect.left, y: e.clientY - containerRect.top };
    const origAbsPos = node.getAbsolutePosition();

    function onMouseMove(ev: MouseEvent) {
      // 当前鼠标在容器内的坐标
      const currPointer = { x: ev.clientX - containerRect.left, y: ev.clientY - containerRect.top };
      const dx = currPointer.x - startPointer.x;
      const dy = currPointer.y - startPointer.y;
      const stageDx = dx / stage.scaleX();
      const stageDy = dy / stage.scaleY();
      node.setAbsolutePosition({
        x: origAbsPos.x + stageDx,
        y: origAbsPos.y + stageDy,
      });
      stage.batchDraw();
      update(); // 立即同步 overlay 位置
    }
    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };
  // 事件同步
  const updateHandler = () => update();
  node.on("dragmove", updateHandler);
  node.on("transform", updateHandler);
  node.on("transformend", updateHandler);
  stage.on("move dragmove", updateHandler);

  // 监听舞台缩放（兼容代码和交互）
  stage.on("scaleXChange scaleYChange", updateHandler);
  // 监听鼠标滚轮缩放
  stage.container().addEventListener("wheel", updateHandler);

  // 初始化位置
  update();

  // 销毁函数
  function destroy() {
    node.off("dragmove", updateHandler);
    node.off("transform", updateHandler);
    node.off("transformend", updateHandler);
    stage.off("move dragmove", updateHandler);
    stage.off("scaleXChange scaleYChange", updateHandler);
    stage.container().removeEventListener("wheel", updateHandler);
    overlay.remove();
  }

  return {
    element: overlay,
    update,
    destroy,
  };
}
