import { useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomEdge from "./CustomEdge";

// Custom edge types
const edgeTypes = {
  customEdge: CustomEdge,
};

// Default edge options
const edgeOptions = {
  type: 'customEdge',
  markerEnd: '',
  style: { 
    stroke: '#757575', 
    strokeWidth: 1.5 
  },
};

/**
 * FamilyTreeCanvas component for rendering the ReactFlow canvas
 * 
 * @param {Object} props - Component props
 * @param {Array} props.nodes - Array of nodes to render
 * @param {Array} props.edges - Array of edges to render
 * @param {Function} props.onNodesChange - Function called when nodes change
 * @param {Function} props.onEdgesChange - Function called when edges change
 * @param {Function} props.onNodeClick - Function called when a node is clicked
 * @param {Function} props.onNodeDragStop - Function called when a node drag stops
 * @param {Function} props.onNodeContextMenu - Function called when a node is right-clicked
 * @param {Function} props.onPaneContextMenu - Function called when the canvas is right-clicked
 * @param {Function} props.onInit - Function called when the canvas is initialized
 * @param {Object} props.genderStyles - Object containing gender-specific styles
 * @param {Function} props.fitView - Function to fit the view to show all nodes
 * @param {Function} props.resetLayout - Function to reset node positions
 * @param {Function} props.addPerson - Function to add a new person
 * @param {Function} props.onPaneClick - Function called when the canvas is clicked
 */
const FamilyTreeCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeDragStop,
  onNodeContextMenu,
  onPaneContextMenu,
  onInit,
  genderStyles,
  fitView,
  resetLayout,
  addPerson,
  onPaneClick,
}) => {
  // Handle zoom in
  const zoomIn = useCallback(() => {
    const instance = onInit.current;
    if (instance) {
      instance.zoomIn();
    }
  }, [onInit]);

  // Handle zoom out
  const zoomOut = useCallback(() => {
    const instance = onInit.current;
    if (instance) {
      instance.zoomOut();
    }
  }, [onInit]);

  return (
    <div className="family-tree-canvas relative w-full h-full rounded-lg overflow-hidden shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onClick={onPaneClick}
        onInit={onInit}
        fitView
        minZoom={0.2}
        maxZoom={4}
        defaultEdgeOptions={edgeOptions}
        connectionLineStyle={{ stroke: '#757575', strokeWidth: 2 }}
        style={{ 
          width: '100%', 
          height: '100%',
          background: '#f8f9fa'
        }}
        attributionPosition="bottom-left"
        edgeTypes={edgeTypes}
      >
        <Controls 
          showInteractive={true} 
          className="shadow-lg rounded-lg overflow-hidden"
          style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '4px'
          }}
        />
        <MiniMap 
          nodeStrokeColor={(n) => {
            const gender = n.data?.person?.gender || 'other';
            return genderStyles[gender].borderColor;
          }}
          nodeColor={(n) => {
            const gender = n.data?.person?.gender || 'other';
            return genderStyles[gender].backgroundColor;
          }}
          style={{ 
            display: 'none' // Hide minimap to match the example
          }}
          maskColor="rgba(240, 240, 240, 0.4)"
        />
        {/* Remove background dots */}

        <Panel position="top-right" className="space-y-2 p-2">
          <div className="flex flex-col gap-2">
            <button 
              onClick={fitView}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
              aria-label="Fit view to show all nodes"
            >
              <span className="material-icons text-sm">center_focus_strong</span>
              <span>Fit View</span>
            </button>
            <button 
              onClick={resetLayout}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
              aria-label="Reset node positions to automatic layout"
            >
              <span className="material-icons text-sm">grid_view</span>
              <span>Reset Layout</span>
            </button>
            <button 
              onClick={addPerson}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md"
              aria-label="Add a new person"
            >
              <span className="material-icons text-sm">person_add</span>
              <span>Add Person</span>
            </button>
          </div>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-right" className="hidden md:block p-2">
          <div className="bg-white p-3 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold mb-2">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: genderStyles.male.backgroundColor }}></div>
                <span className="text-xs">Male</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: genderStyles.female.backgroundColor }}></div>
                <span className="text-xs">Female</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: genderStyles.other.backgroundColor }}></div>
                <span className="text-xs">Other</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5" style={{ backgroundColor: '#757575', height: '2px' }}></div>
                <span className="text-xs">Spouse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 flex items-center justify-end" style={{ backgroundColor: '#9e9e9e' }}>
                  <div className="w-2 h-2 transform rotate-45" style={{ backgroundColor: '#9e9e9e' }}></div>
                </div>
                <span className="text-xs">Parent/Child</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Mobile controls */}
        <Panel position="bottom-center" className="md:hidden p-2">
          <div className="flex space-x-2 bg-white p-2 rounded-full shadow-lg">
            <button
              onClick={zoomIn}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 active:bg-gray-300 transition"
              aria-label="Zoom in"
            >
              <span className="material-icons">add</span>
            </button>
            <button
              onClick={zoomOut}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 active:bg-gray-300 transition"
              aria-label="Zoom out"
            >
              <span className="material-icons">remove</span>
            </button>
            <button
              onClick={fitView}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 active:bg-gray-300 transition"
              aria-label="Fit view"
            >
              <span className="material-icons">center_focus_strong</span>
            </button>
            <button
              onClick={addPerson}
              className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 active:bg-green-700 transition"
              aria-label="Add person"
            >
              <span className="material-icons">person_add</span>
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default FamilyTreeCanvas; 