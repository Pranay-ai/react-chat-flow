// components/TextMessageNode.jsx
import React from "react";
import { Handle, Position } from "reactflow";
import { MessageCircle } from "lucide-react";

export const TextMessageNode = ({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-white min-w-[200px] max-w-[250px] cursor-move ${
        selected ? "border-blue-500 shadow-xl" : "border-gray-300"
      }`}
    >
      {/* Input Handle (Target) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 border-2 border-white hover:!bg-gray-600"
        isConnectable={true}
      />

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 pointer-events-none">
        <MessageCircle size={14} />
        <span>Send Message</span>
      </div>
      <div className="text-sm text-gray-800 break-words pointer-events-none">
        {data.message || "Click to edit message"}
      </div>

      {/* Output Handle (Source) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 border-2 border-white hover:!bg-blue-700"
        isConnectable={true}
      />
    </div>
  );
};
