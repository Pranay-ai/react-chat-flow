// utils/flowValidation.js

/**
 * Validates the chatbot flow according to BiteSpeed requirements
 * @param {Array} nodes - Array of flow nodes
 * @param {Array} edges - Array of flow edges
 * @returns {Object} - Validation result with isValid boolean and message
 */
export const validateFlow = (nodes, edges) => {
  // Check if there are any nodes
  if (nodes.length === 0) {
    return { 
      isValid: false, 
      message: "Please add at least one node before saving." 
    };
  }

  // For flows with multiple nodes, check the target handle rule
  if (nodes.length > 1) {
    const nodeIds = nodes.map((node) => node.id);
    const targetNodes = edges.map((edge) => edge.target);
    const nodesWithoutIncoming = nodeIds.filter((id) => !targetNodes.includes(id));

    // More than one node should not have empty target handles
    if (nodesWithoutIncoming.length > 1) {
      return { 
        isValid: false, 
        message: "Error: Cannot save flow. More than one node has empty target handles." 
      };
    }
  }

  return { 
    isValid: true, 
    message: "Flow is valid" 
  };
};

/**
 * Validates edge connection rules
 * @param {Object} connectionParams - New connection parameters
 * @param {Array} existingEdges - Current edges in the flow
 * @returns {Object} - Validation result
 */
export const validateConnection = (connectionParams, existingEdges) => {
  // Check if source already has an outgoing edge
  const sourceHasEdge = existingEdges.some((edge) => edge.source === connectionParams.source);
  
  if (sourceHasEdge) {
    return {
      isValid: false,
      message: "Each node can only have one outgoing connection"
    };
  }

  return {
    isValid: true,
    message: "Connection is valid"
  };
};

/**
 * Gets flow statistics for display
 * @param {Array} nodes - Array of flow nodes
 * @param {Array} edges - Array of flow edges
 * @returns {Object} - Flow statistics
 */
export const getFlowStats = (nodes, edges) => {
  const nodeIds = nodes.map(node => node.id);
  const targetNodes = edges.map(edge => edge.target);
  const sourceNodes = edges.map(edge => edge.source);
  
  const startNodes = nodeIds.filter(id => !targetNodes.includes(id));
  const endNodes = nodeIds.filter(id => !sourceNodes.includes(id));
  
  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    startNodes: startNodes.length,
    endNodes: endNodes.length,
    connectedNodes: [...new Set([...sourceNodes, ...targetNodes])].length
  };
};