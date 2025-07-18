import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Settings, Save } from "lucide-react";

// Import components from separate files
import { TextMessageNode } from "./components/TextMessageNode";
import { Sidebar } from "./components/Sidebar";
import { SettingsPanel } from "./components/SettingsPanel";

// Node types configuration
const nodeTypes = {
  textMessage: TextMessageNode,
};

// Main Flow Builder Component
const FlowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  // LocalStorage keys
  const STORAGE_KEYS = {
    NODES: "chatbot-flow-nodes",
    EDGES: "chatbot-flow-edges",
    LAST_SAVED: "chatbot-flow-last-saved",
  };

  // Load saved flow on component mount
  React.useEffect(() => {
    try {
      const savedNodes = localStorage.getItem(STORAGE_KEYS.NODES);
      const savedEdges = localStorage.getItem(STORAGE_KEYS.EDGES);

      if (savedNodes && savedEdges) {
        const nodes = JSON.parse(savedNodes);
        const edges = JSON.parse(savedEdges);

        setNodes(nodes);
        setEdges(edges);

        console.log("Flow restored from localStorage");
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    }
  }, [setNodes, setEdges]);

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    setSelectedNode(node);
    setSelectedEdges([]); // Clear edge selection
    setShowSettings(true);
    setShowSidebar(false);
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdges([edge]);
    setSelectedNode(null); // Clear node selection
    setShowSettings(false);
    setShowSidebar(false);
  }, []);

  // Handle selection change (for both nodes and edges)
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }) => {
      if (selectedEdges.length > 0) {
        setSelectedEdges(selectedEdges);
        setSelectedNode(null);
        setShowSettings(false);
      } else if (selectedNodes.length > 0) {
        setSelectedNode(selectedNodes[0]);
        setSelectedEdges([]);
        setShowSettings(true);
        setShowSidebar(false);
      } else {
        setSelectedNode(null);
        setSelectedEdges([]);
        setShowSettings(false);
      }
    },
    []
  );

  // Handle edge connection with validation
  const onConnect = useCallback(
    (params) => {
      // Check if source already has an outgoing edge
      const sourceHasEdge = edges.some((edge) => edge.source === params.source);
      if (sourceHasEdge) {
        alert("Each node can only have one outgoing connection");
        return;
      }

      // Add the edge
      const newEdge = {
        ...params,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2 },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [edges, setEdges]
  );

  // Handle canvas click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdges([]);
    setShowSettings(false);
    if (!showSidebar) {
      setShowSidebar(true);
    }
  }, [showSidebar]);

  // Handle drag and drop from sidebar
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          message: "New message",
        },
        draggable: true,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  // Update node data
  const onUpdateNode = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node
        )
      );
    },
    [setNodes]
  );

  // Delete node and its connected edges
  const onDeleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  // Handle edge deletion when selected and delete key pressed
  const onEdgesDelete = useCallback(
    (edgesToDelete) => {
      setEdges((eds) =>
        eds.filter((edge) => !edgesToDelete.find((e) => e.id === edge.id))
      );
      setSelectedEdges([]);
    },
    [setEdges]
  );

  // Handle keyboard shortcuts
  const onKeyDown = useCallback(
    (event) => {
      // Only handle delete when not focused on input elements
      if (
        event.target.tagName !== "TEXTAREA" &&
        event.target.tagName !== "INPUT"
      ) {
        if (event.key === "Delete" || event.key === "Backspace") {
          if (selectedEdges.length > 0) {
            event.preventDefault();
            onEdgesDelete(selectedEdges);
          }
        }
      }
    },
    [selectedEdges, onEdgesDelete]
  );

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  // Validate and save flow
  const onSave = useCallback(() => {
    if (nodes.length === 0) {
      alert("Please add at least one node before saving.");
      return;
    }

    // Check for nodes with no incoming edges (except if there's only one node)
    if (nodes.length > 1) {
      const nodeIds = nodes.map((node) => node.id);
      const targetNodes = edges.map((edge) => edge.target);
      const nodesWithoutIncoming = nodeIds.filter(
        (id) => !targetNodes.includes(id)
      );

      if (nodesWithoutIncoming.length > 1) {
        alert(
          "Error: Cannot save flow. More than one node has empty target handles."
        );
        return;
      }
    }

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
      localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());

      console.log("Flow saved to localStorage");
      alert("Flow saved successfully!");
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      alert("Failed to save flow. Please try again.");
    }
  }, [nodes, edges, STORAGE_KEYS]);

  // Close settings panel
  const onCloseSettings = useCallback(() => {
    setShowSettings(false);
    setSelectedNode(null);
    setSelectedEdges([]);
    setShowSidebar(true);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Flow Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Chatbot Flow Builder
              </h1>
              {localStorage.getItem(STORAGE_KEYS.LAST_SAVED) && (
                <p className="text-sm text-gray-500 mt-1">
                  Last saved:{" "}
                  {new Date(
                    localStorage.getItem(STORAGE_KEYS.LAST_SAVED)
                  ).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {!showSidebar && !showSettings && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings size={20} />
                  <span>Nodes</span>
                </button>
              )}
              <button
                onClick={onSave}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
              >
                <Save size={20} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>

        {/* React Flow */}
        <div className="flex-1" ref={reactFlowWrapper}>
          {/* Status indicator */}
          {(selectedNode || selectedEdges.length > 0) && (
            <div className="absolute top-4 left-4 z-10 bg-blue-100 border border-blue-300 text-blue-800 px-3 py-2 rounded-lg shadow-sm">
              {selectedNode && (
                <span className="text-sm font-medium">
                  📝 Selected: Node "
                  {selectedNode.data.message?.slice(0, 30) || "New message"}..."
                </span>
              )}
              {selectedEdges.length > 0 && (
                <span className="text-sm font-medium">
                  🔗 Selected: {selectedEdges.length} edge
                  {selectedEdges.length > 1 ? "s" : ""} (Press Delete to remove)
                </span>
              )}
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges.map((edge) => ({
              ...edge,
              style: {
                stroke: selectedEdges.some(
                  (selectedEdge) => selectedEdge.id === edge.id
                )
                  ? "#ef4444"
                  : "#3b82f6",
                strokeWidth: selectedEdges.some(
                  (selectedEdge) => selectedEdge.id === edge.id
                )
                  ? 4
                  : 2,
              },
              animated: selectedEdges.some(
                (selectedEdge) => selectedEdge.id === edge.id
              )
                ? true
                : false,
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onEdgesDelete={onEdgesDelete}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            edgesFocusable={true}
            deleteKeyCode={null} // We handle delete manually
            multiSelectionKeyCode={["Meta", "Ctrl"]}
            selectNodesOnDrag={false}
            fitView
            snapToGrid={true}
            snapGrid={[15, 15]}
            attributionPosition="top-right"
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: false,
              style: { stroke: "#3b82f6", strokeWidth: 2 },
              focusable: true,
            }}
          >
            <Background variant="dots" gap={20} size={1} />
            <Controls />
            <MiniMap
              style={{
                height: 120,
              }}
              zoomable
              pannable
              nodeColor={(node) => {
                if (node.type === "textMessage") return "#3b82f6";
                return "#ff0072";
              }}
            />
          </ReactFlow>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && !showSettings && (
        <Sidebar isOpen={showSidebar} onToggle={() => setShowSidebar(false)} />
      )}

      {/* Settings Panel */}
      {showSettings && selectedNode && (
        <SettingsPanel
          selectedNode={selectedNode}
          onUpdateNode={onUpdateNode}
          onDeleteNode={onDeleteNode}
          onClose={onCloseSettings}
        />
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  );
};

export default App;
