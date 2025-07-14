import React, { useRef, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import Tree from "react-d3-tree";
import CustomNode from "./CustomNode";

const FamilyTree = ({ data, onNodeClick = () => {} }) => {
  const treeContainerRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Calculate dimensions and center the tree
  const calculateDimensions = useCallback(() => {
    if (treeContainerRef.current) {
      const { width, height } =
        treeContainerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      setTranslate({ x: width / 2, y: 100 });
    }
  }, []);

  // Calculate dimensions on mount and window resize
  useEffect(() => {
    calculateDimensions();
    const handleResize = () => calculateDimensions();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateDimensions]);

  // Custom node renderer
  const renderCustomNode = ({ nodeDatum, toggleNode }) => (
    <CustomNode
      nodeData={nodeDatum}
      onNodeClick={(nodeData) => {
        toggleNode();
        onNodeClick(nodeData);
      }}
    />
  );

  return (
    <div
      ref={treeContainerRef}
      className="w-full h-[600px] bg-gray-50 rounded-lg border border-gray-200"
    >
      {dimensions.width > 0 && (
        <Tree
          data={data}
          orientation="vertical"
          pathFunc="elbow"
          translate={translate}
          nodeSize={{ x: 200, y: 150 }}
          separation={{ siblings: 1, nonSiblings: 1.5 }}
          renderCustomNodeElement={renderCustomNode}
          enableLegacyTransitions
          zoomable
        />
      )}
    </div>
  );
};

FamilyTree.propTypes = {
  data: PropTypes.object.isRequired,
  onNodeClick: PropTypes.func,
};

export default FamilyTree;
