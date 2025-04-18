import shapes from "./shape";

const SiderMenu = () => {
  // 拖拽事件处理
  const handleDragStart = (e: React.DragEvent, component: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(component));
  };

  return (
    <div className="w-60 p-3 bg-gray-50 h-full overflow-y-auto">
      {shapes.map((shape) => {
        return (
          <div
            key={shape.name}
            className="mb-4 rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="font-semibold text-gray-700 px-4 py-2 border-b border-gray-100 bg-gray-100 rounded-t-lg">
              {shape.title}
            </div>
            <div className="flex flex-col gap-2 px-4 py-3">
              {shape.components.map((component) => {
                return (
                  <div
                    key={component.label}
                    className="flex items-center gap-2 px-2 py-1 rounded cursor-grab hover:bg-blue-50 active:bg-blue-100 transition"
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                  >
                    {/* 可根据需要展示icon */}
                    {component.icon && (
                      <span className="text-lg">{component.icon}</span>
                    )}
                    <span className="text-gray-800">{component.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SiderMenu;
