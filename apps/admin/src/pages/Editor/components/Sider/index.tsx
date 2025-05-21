import React from "react";
import { defaultShapes, ShapeInfoBase } from "@plux/konva-editor";

const SiderMenu = () => {
  // 拖拽事件处理
  const handleDragStart = (e: React.DragEvent, component: ShapeInfoBase) => {
    e.dataTransfer.setData("component", JSON.stringify(component));
  };

  return (
    <div className="w-60 p-4 bg-white h-full overflow-y-auto border-r border-gray-200 shadow-sm">
      <h3 className="text-lg font-medium text-gray-800 mb-4">组件库</h3>

      <div className="mb-6">
        <div className="flex items-center mb-3">
          <div className="text-sm font-medium text-gray-700">默认图形</div>
          <div className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
            可拖拽
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {defaultShapes.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-move transition-colors duration-200 border border-gray-200 hover:border-blue-300 hover:shadow-sm"
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
            >
              <div className="w-8 h-8 flex items-center justify-center mb-2 text-gray-500">
                {/* 这里可以放图标，暂时用文字代替 */}
                {item.type.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs text-gray-700 font-medium">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SiderMenu;
