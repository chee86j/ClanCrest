import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import FamilyChart from 'family-chart';
import { toFamilyChartFormat, fromFamilyChartFormat, findRootPerson } from '../../utils/familyChartDataAdapter';

/**
 * FamilyChartWrapper component
 * Wraps the family-chart library to integrate with our application
 */
const FamilyChartWrapper = React.forwardRef(({
  persons,
  relationships,
  onPersonClick,
  onPersonUpdate,
  onRelationshipCreate,
  onRelationshipUpdate,
  onRelationshipDelete,
  onLayoutChange,
  layoutData,
  className,
  style,
  onContextMenu
}, ref) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize family-chart when component mounts or data changes
  useEffect(() => {
    if (!containerRef.current || !persons || !relationships) return;

    // Convert our data format to family-chart format
    const familyChartData = toFamilyChartFormat(persons, relationships);
    
    // Find root person to use as starting point
    const rootPerson = findRootPerson(persons, relationships);
    const startId = rootPerson ? rootPerson.id.toString() : null;

    // If chart already exists, update data
    if (chartRef.current) {
      chartRef.current.update(familyChartData);
      return;
    }

    // Initialize family-chart
    const chart = new FamilyChart(containerRef.current, {
      data: familyChartData.data,
      startId: startId,
      // Configure family-chart options for traditional family tree layout
      nameFontSize: 14,
      // Increase vertical spacing for better generation separation
      levelGap: 100,
      // Adjust node padding and size
      nodePaddingX: 15,
      nodePaddingY: 10,
      nodeWidth: 120,
      nodeHeight: 100,
      // Traditional top-to-bottom layout
      orientation: 'top',
      // Increase sibling separation for better readability
      siblingSeparation: 50,
      // Ensure spouses are placed side by side
      spouseSeparation: 30,
      // Apply stored layout data if available
      layout: layoutData || {},
      // Enable compact layout for better use of space
      compact: true,
      // Configure tree alignment
      align: 'center',
      // Custom node template
      nodeTemplate: (data) => {
        const gender = data.gender || 'other';
        const genderColors = {
          male: '#2196f3',
          female: '#e91e63',
          other: '#9c27b0'
        };
        const bgColor = genderColors[gender] || genderColors.other;
        
        return `
          <div class="fc-node-content" style="text-align: center;">
            <div class="fc-node-avatar" style="
              background-color: ${bgColor};
              color: white;
              border-radius: 50%;
              width: 60px;
              height: 60px;
              margin: 0 auto 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: bold;
            ">
              ${data.imageUrl ? 
                `<img src="${data.imageUrl}" alt="${data.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />` : 
                data.name.charAt(0).toUpperCase()}
            </div>
            <div class="fc-node-name" style="font-weight: 500; margin-bottom: 4px;">${data.name}</div>
            ${data.nameZh ? `<div class="fc-node-name-zh" style="font-size: 12px; color: #666;">${data.nameZh}</div>` : ''}
          </div>
        `;
      },
      // Configure relationship lines
      linkTemplate: (data) => {
        // Default style for relationship lines
        let style = 'stroke: #757575; stroke-width: 1.5px;';
        
        // Different styles for different relationship types
        if (data.relationshipType === 'spouse') {
          style = 'stroke: #757575; stroke-width: 1.5px;';
        } else if (data.relationshipType === 'parent-child') {
          style = 'stroke: #757575; stroke-width: 1.5px;';
        } else if (data.relationshipType === 'sibling') {
          style = 'stroke: #9c27b0; stroke-width: 1.5px; stroke-dasharray: 3,3;';
        }
        
        return `<path d="${data.d}" style="${style}" />`;
      }
    });

    // Set up event handlers
    chart.on('node-click', (nodeId) => {
      const person = persons.find(p => p.id.toString() === nodeId);
      if (person && onPersonClick) {
        onPersonClick(person);
      }
    });

    chart.on('layout-change', (layout) => {
      if (onLayoutChange) {
        onLayoutChange(layout);
      }
    });

    // Store chart reference
    chartRef.current = chart;
    setIsInitialized(true);

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [persons, relationships, layoutData, onPersonClick, onLayoutChange]);

  // Add methods to interact with the chart
  const zoomIn = () => {
    if (chartRef.current) chartRef.current.zoomIn();
  };

  const zoomOut = () => {
    if (chartRef.current) chartRef.current.zoomOut();
  };

  const fitTree = () => {
    if (chartRef.current) chartRef.current.fit();
  };

  const centerOnPerson = (personId) => {
    if (chartRef.current && personId) {
      chartRef.current.centerNode(personId.toString());
    }
  };

  // Expose methods to parent component
  React.useImperativeHandle(
    ref,
    () => ({
      zoomIn,
      zoomOut,
      fitTree,
      centerOnPerson,
      getChart: () => chartRef.current
    }),
    [chartRef.current]
  );

  return (
    <div 
      className={`family-chart-container ${className || ''}`} 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '600px', 
        position: 'relative',
        overflow: 'hidden',
        ...style 
      }}
      onContextMenu={onContextMenu}
    >
      {!isInitialized && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: '#666'
        }}>
          Loading family tree...
        </div>
      )}
      
      <div className="family-chart-controls" style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 10
      }}>
        <button 
          onClick={zoomIn}
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          aria-label="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button 
          onClick={zoomOut}
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          aria-label="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button 
          onClick={fitTree}
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          aria-label="Fit tree"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6"></path>
            <path d="M9 21H3v-6"></path>
            <path d="M21 3l-7 7"></path>
            <path d="M3 21l7-7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
});

FamilyChartWrapper.propTypes = {
  persons: PropTypes.array.isRequired,
  relationships: PropTypes.array.isRequired,
  onPersonClick: PropTypes.func,
  onPersonUpdate: PropTypes.func,
  onRelationshipCreate: PropTypes.func,
  onRelationshipUpdate: PropTypes.func,
  onRelationshipDelete: PropTypes.func,
  onLayoutChange: PropTypes.func,
  onContextMenu: PropTypes.func,
  layoutData: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.object
};

export default FamilyChartWrapper; 