import { useState, useCallback } from 'react';

/**
 * Custom hook for managing context menu state and position
 * @returns {Object} Context menu state and handlers
 */
const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    data: null,
  });

  const openContextMenu = useCallback((event, data = null) => {
    event.preventDefault();
    setContextMenu({
      isOpen: true,
      x: event.clientX,
      y: event.clientY,
      data,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isOpen: false,
      x: 0,
      y: 0,
      data: null,
    });
  }, []);

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
  };
};

export default useContextMenu; 