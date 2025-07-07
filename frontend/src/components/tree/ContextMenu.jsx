import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * A reusable context menu component that follows accessibility guidelines
 * and provides clear visual feedback for user interactions.
 */
const ContextMenu = ({
  x,
  y,
  isOpen,
  onClose,
  items,
  title,
  className = '',
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate position to ensure menu stays within viewport
  const calculatePosition = () => {
    if (!menuRef.current) return { left: x, top: y };

    const { width, height } = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const left = x + width > viewportWidth ? x - width : x;
    const top = y + height > viewportHeight ? y - height : y;

    return {
      left: Math.max(0, left),
      top: Math.max(0, top),
    };
  };

  const position = calculatePosition();

  return (
    <div
      ref={menuRef}
      className={`absolute z-50 min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 ${className}`}
      style={{
        left: position.left,
        top: position.top,
      }}
      role="menu"
      aria-label={title}
    >
      {title && (
        <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
          {title}
        </div>
      )}
      <div className="py-1">
        {items.map((item, index) => (
          <button
            key={item.id || index}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`w-full text-left px-4 py-2 text-sm ${
              item.disabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600'
            } focus:outline-none transition-colors duration-150 flex items-center gap-2`}
            disabled={item.disabled}
            role="menuitem"
            tabIndex={0}
          >
            {item.icon && (
              <span className="w-5 h-5 flex items-center justify-center">
                {item.icon}
              </span>
            )}
            {item.label}
            {item.description && (
              <span className="ml-2 text-xs text-gray-400">{item.description}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

ContextMenu.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool,
      icon: PropTypes.node,
      description: PropTypes.string,
    })
  ).isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
};

export default ContextMenu; 