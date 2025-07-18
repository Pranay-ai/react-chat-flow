// components/SettingsPanel.jsx
import React, { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";

export const SettingsPanel = ({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onClose,
}) => {
  const [message, setMessage] = useState(selectedNode?.data?.message || "");

  const handleSave = () => {
    onUpdateNode(selectedNode.id, { message });
    onClose();
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this node? This action cannot be undone."
      )
    ) {
      onDeleteNode(selectedNode.id);
      onClose();
    }
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Message Settings
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Text
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            rows={4}
            placeholder="Enter your message..."
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <Trash2 size={16} />
            Delete Node
          </button>
        </div>
      </div>
    </div>
  );
};
