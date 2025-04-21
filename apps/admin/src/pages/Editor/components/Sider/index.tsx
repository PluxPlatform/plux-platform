import React, { useState } from "react";
import shapes, { ShapeComponent } from "./shape";
import { DownOutlined, RightOutlined } from "@ant-design/icons";

const SiderMenu = () => {
  // 折叠状态，key为分组name，value为是否展开
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(shapes.map((s) => [s.name, true]))
  );

  const handleToggleGroup = (name: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // 拖拽事件处理
  const handleDragStart = (e: React.DragEvent, component: ShapeComponent) => {
    e.dataTransfer.setData("component", JSON.stringify(component));
  };

  return (
    <div className="w-60 p-3 bg-gray-50 h-full overflow-y-auto">
      {shapes.map((shape) => {
        const isOpen = openGroups[shape.name];
        return (
          <div
            key={shape.name}
            className="mb-4 rounded-xl border border-gray-200 bg-white shadow transition-shadow hover:shadow-md"
          >
            <div
              className="flex items-center font-semibold text-gray-700 px-4 py-2 border-b border-gray-100 bg-gray-100 rounded-t-xl cursor-pointer select-none"
              onClick={() => handleToggleGroup(shape.name)}
            >
              {isOpen ? (
                <DownOutlined className="mr-2 text-xs" />
              ) : (
                <RightOutlined className="mr-2 text-xs" />
              )}
              {shape.title}
            </div>
            {isOpen && (
              <div className="flex flex-col gap-2 px-4 py-3">
                {shape.components.map((component) => (
                  <div
                    key={component.label}
                    className="flex flex-row items-center gap-2 px-2 py-1 rounded-lg cursor-grab hover:bg-blue-50 active:bg-blue-100 transition border border-transparent hover:border-blue-200"
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                  >
                    <span className="text-lg text-blue-500">
                      {component.icon}
                    </span>
                    <span className="text-gray-800">{component.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SiderMenu;
