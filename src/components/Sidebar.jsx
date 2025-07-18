// components/Sidebar.jsx
import React from "react";
import { MessageCircle, ArrowLeft } from "lucide-react";

export const Sidebar = ({ isOpen, onToggle }) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={`bg-white border-l border-gray-200 transition-all duration-300 ${
        isOpen ? "w-64" : "w-0"
      } overflow-hidden`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Nodes Panel</h3>
          <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div
          className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-colors"
          onDragStart={(event) => onDragStart(event, "textMessage")}
          draggable
        >
          <MessageCircle size={32} className="text-blue-500" />
          <span className="text-sm font-medium text-gray-700">Message</span>
          <span className="text-xs text-gray-500 text-center">
            Drag to add to canvas
          </span>
        </div>
      </div>
    </div>
  );
};
