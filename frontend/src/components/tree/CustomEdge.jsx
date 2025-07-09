import React from 'react';
import { getBezierPath, BaseEdge } from 'reactflow';
import PropTypes from 'prop-types';

/**
 * Custom edge component for family relationships
 * Provides different styles based on relationship type
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
    strokeWidth: 2,
    stroke: '#9e9e9e',
    ...style,
  };

  // Get relationship type from data
  const relationType = data?.type || 'default';

  // Determine path based on relationship type
  let edgePath;
  
  if (relationType === 'spouse') {
    // For spouse relationships, use a straight line
    edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  } else if (relationType === 'parent' || relationType === 'child') {
    // For parent-child relationships, create a path that goes down and then horizontally
    // This creates the T-shaped connection seen in the example
    const midY = (sourceY + targetY) / 2;
    
    // Check if this is a vertical connection (parent above child)
    if (Math.abs(sourceY - targetY) > Math.abs(sourceX - targetX)) {
      const centerX = (sourceX + targetX) / 2;
      edgePath = `M ${sourceX} ${sourceY} 
                  L ${sourceX} ${midY} 
                  L ${targetX} ${midY} 
                  L ${targetX} ${targetY}`;
    } else {
      // For horizontal connections, use a simple bezier curve
      const [path] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });
      edgePath = path;
    }
  } else {
    // For other relationships, use a bezier path
    const [path] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    edgePath = path;
  }

  // Don't render any labels to match the example
  return (
    <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
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