import React from 'react';
import PropTypes from 'prop-types';

/**
 * Custom edge component for family relationships
 * Creates traditional family tree connections
 */
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  // Default style
  const edgeStyle = {
    strokeWidth: 1.5,
    stroke: '#757575',
    ...style,
  };

  // Get relationship type from data
  const relationType = data?.type || 'default';

  // Determine path based on relationship type
  let edgePath;
  
  if (relationType === 'spouse') {
    // For spouse relationships, use a straight horizontal line
    edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  } else if (relationType === 'parent' || relationType === 'child') {
    // For parent-child relationships, create a T-shaped connection
    
    // Determine if this is a vertical parent-child connection
    const isVertical = Math.abs(sourceY - targetY) > Math.abs(sourceX - targetX);
    
    if (isVertical) {
      // For vertical parent-child connections (traditional family tree)
      const midY = (sourceY + targetY) / 2;
      
      // If parent is above child (normal case)
      if (sourceY < targetY) {
        edgePath = `M ${sourceX} ${sourceY} 
                    L ${sourceX} ${midY} 
                    L ${targetX} ${midY} 
                    L ${targetX} ${targetY}`;
      } else {
        // If child is above parent (unusual but possible)
        edgePath = `M ${sourceX} ${sourceY} 
                    L ${sourceX} ${midY} 
                    L ${targetX} ${midY} 
                    L ${targetX} ${targetY}`;
      }
    } else {
      // For horizontal parent-child connections (less common)
      const midX = (sourceX + targetX) / 2;
      
      edgePath = `M ${sourceX} ${sourceY} 
                  L ${midX} ${sourceY} 
                  L ${midX} ${targetY} 
                  L ${targetX} ${targetY}`;
    }
  } else if (relationType === 'sibling') {
    // For sibling relationships, use a curved line
    const controlPointX = (sourceX + targetX) / 2;
    const controlPointY = sourceY - 50; // Control point above the siblings
    
    edgePath = `M ${sourceX} ${sourceY} 
                Q ${controlPointX} ${controlPointY} ${targetX} ${targetY}`;
  } else {
    // For other relationships, use a straight line
    edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  }

  return (
    <g>
      <path
        d={edgePath}
        style={edgeStyle}
        fill="none"
        markerEnd={markerEnd}
      />
      
      {/* Add arrow marker for parent-child relationships */}
      {(relationType === 'parent' || relationType === 'child') && (
        <marker
          id={`arrow-${id}`}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={edgeStyle.stroke} />
        </marker>
      )}
    </g>
  );
};

CustomEdge.propTypes = {
  id: PropTypes.string,
  sourceX: PropTypes.number,
  sourceY: PropTypes.number,
  targetX: PropTypes.number,
  targetY: PropTypes.number,
  sourcePosition: PropTypes.string,
  targetPosition: PropTypes.string,
  style: PropTypes.object,
  markerEnd: PropTypes.string,
  data: PropTypes.object,
};

export default CustomEdge; 