// hooks/useLocalStorage.js
import { useCallback } from 'react';

export const useLocalStorage = () => {
  const STORAGE_KEYS = {
    NODES: 'chatbot-flow-nodes',
    EDGES: 'chatbot-flow-edges',
    VIEWPORT: 'chatbot-flow-viewport',
    LAST_SAVED: 'chatbot-flow-last-saved'
  };

  const saveToLocalStorage = useCallback((nodes, edges, viewport = null) => {
    try {
      localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
      localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
      
      if (viewport) {
        localStorage.setItem(STORAGE_KEYS.VIEWPORT, JSON.stringify(viewport));
      }
      
      console.log('Flow saved to localStorage');
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedNodes = localStorage.getItem(STORAGE_KEYS.NODES);
      const savedEdges = localStorage.getItem(STORAGE_KEYS.EDGES);
      const lastSaved = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);

      if (savedNodes && savedEdges) {
        return {
          nodes: JSON.parse(savedNodes),
          edges: JSON.parse(savedEdges),
          lastSaved
        };
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  }, []);

  const clearLocalStorage = useCallback(() => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }, []);

  const getLastSaved = useCallback(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
  }, []);

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    getLastSaved
  };
};