import { useCallback, useEffect, useState, useRef } from "react";
import { usePersons } from "../../hooks/usePersons";
import { useRelationships } from "../../hooks/useRelationships";
import useContextMenu from "../../hooks/useContextMenu";
import KinshipFinder from "./KinshipFinder";
import NodeEditor from "./NodeEditor";
import ContextMenu from "./ContextMenu";
import { useLayoutData } from "../../hooks/useLayoutData";
import ReactFamilyTree from "react-family-tree";
import relatives from "relatives-tree";
import "./FamilyTree.css";

// Define node dimensions
const NODE_WIDTH = 120;
const NODE_HEIGHT = 100;

/**
 * FamilyTreeWithRelativesTree component
 * A family tree visualization using relatives-tree library
 */
const FamilyTreeWithRelativesTree = () => {
  const {
    persons = [],
    loading: personsLoading,
    error: personsError,
    updatePerson,
    deletePerson,
    createPerson,
  } = usePersons();

  const {
    relationships = [],
    loading: relationshipsLoading,
    error: relationshipsError,
    createRelationship,
    updateRelationship,
    deleteRelationship,
  } = useRelationships();

  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewPersonForm, setIsNewPersonForm] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [rootId, setRootId] = useState(null);
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const containerRef = useRef(null);

  // Process data into relatives-tree format
  useEffect(() => {
    if (!persons.length || !relationships.length) {
      console.log("No persons or relationships data available");
      return;
    }

    console.log("Processing data for relatives-tree:", {
      persons,
      relationships,
    });

    try {
      // Convert persons to nodes format
      const treeNodes = persons.map((person) => ({
        id: person.id.toString(),
        gender: person.gender || "other",
        parents: [],
        children: [],
        siblings: [],
        spouses: [],
        data: person,
      }));

      // Create a map for faster lookup
      const nodesMap = new Map(treeNodes.map((node) => [node.id, node]));

      // Process relationships to build the tree structure
      relationships.forEach((rel) => {
        const fromId = rel.fromId.toString();
        const toId = rel.toId.toString();

        const fromNode = nodesMap.get(fromId);
        const toNode = nodesMap.get(toId);

        if (!fromNode || !toNode) {
          console.warn(`Missing node for relationship: ${fromId} -> ${toId}`);
          return;
        }

        switch (rel.type) {
          case "spouse":
            if (!fromNode.spouses.includes(toId)) fromNode.spouses.push(toId);
            if (!toNode.spouses.includes(fromId)) toNode.spouses.push(fromId);
            break;

          case "parent":
            if (!fromNode.children.includes(toId)) fromNode.children.push(toId);
            if (!toNode.parents.includes(fromId)) toNode.parents.push(fromId);
            break;

          case "child":
            if (!fromNode.parents.includes(toId)) fromNode.parents.push(toId);
            if (!toNode.children.includes(fromId)) toNode.children.push(fromId);
            break;

          case "sibling":
            if (!fromNode.siblings.includes(toId)) fromNode.siblings.push(toId);
            if (!toNode.siblings.includes(fromId)) toNode.siblings.push(fromId);
            break;
        }
      });

      // Find a suitable root node
      let root = null;

      // First try: node with spouses but no parents
      root = treeNodes.find(
        (node) => node.spouses.length > 0 && node.parents.length === 0
      );

      // Second try: any node with no parents
      if (!root) {
        root = treeNodes.find((node) => node.parents.length === 0);
      }

      // Third try: any node with spouses
      if (!root) {
        root = treeNodes.find((node) => node.spouses.length > 0);
      }

      // Last resort: just use the first node
      if (!root && treeNodes.length > 0) {
        root = treeNodes[0];
      }

      const selectedRootId = root ? root.id : null;
      console.log("Selected root ID:", selectedRootId);

      if (selectedRootId) {
        // Process the tree with relatives-tree library
        const processed = relatives(treeNodes, { rootId: selectedRootId });
        console.log("Processed tree:", processed);
        setNodes(processed);
        setRootId(selectedRootId);
      }
    } catch (error) {
      console.error("Error processing family tree:", error);
    }
  }, [persons, relationships]);

  // Handle person click
  const handlePersonClick = useCallback((person) => {
    setSelectedNode(person);
    setIsEditorOpen(true);
    setIsNewPersonForm(false);
  }, []);

  // Handle canvas context menu
  const handleCanvasContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      openContextMenu(e.pageX, e.pageY, { type: "canvas" });
    },
    [openContextMenu]
  );

  // Handle node context menu
  const handleNodeContextMenu = useCallback(
    (e, person) => {
      e.preventDefault();
      e.stopPropagation();
      openContextMenu(e.pageX, e.pageY, { type: "node", data: person });
    },
    [openContextMenu]
  );

  // Get relationships for selected person
  const selectedPersonRelationships = selectedNode
    ? relationships.filter(
        (rel) => rel.fromId === selectedNode.id || rel.toId === selectedNode.id
      )
    : [];

  // Handle person form submission
  const handlePersonFormSubmit = async (personData) => {
    setIsLoading(true);
    try {
      if (isNewPersonForm) {
        await createPerson(personData);
      } else {
        await updatePerson(personData.id, personData);
      }
      setIsEditorOpen(false);
      setSelectedNode(null);
    } catch (error) {
      console.error("Error submitting person form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle person deletion
  const handleDeletePerson = async (personId) => {
    setIsLoading(true);
    try {
      await deletePerson(personId);
      setIsEditorOpen(false);
      setSelectedNode(null);
    } catch (error) {
      console.error("Error deleting person:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a relationship
  const handleAddRelationship = async (relationshipData) => {
    setIsLoading(true);
    try {
      await createRelationship(relationshipData);
    } catch (error) {
      console.error("Error adding relationship:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating a relationship
  const handleUpdateRelationship = async (relationshipId, updatedData) => {
    setIsLoading(true);
    try {
      await updateRelationship(relationshipId, updatedData);
    } catch (error) {
      console.error("Error updating relationship:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a relationship
  const handleDeleteRelationship = async (relationshipId) => {
    setIsLoading(true);
    try {
      await deleteRelationship(relationshipId);
    } catch (error) {
      console.error("Error deleting relationship:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new person
  const handleAddPerson = () => {
    setSelectedNode({
      name: "",
      nameZh: "",
      gender: "other",
      notes: "",
    });
    setIsNewPersonForm(true);
    setIsEditorOpen(true);
  };

  // Custom node renderer
  const renderNode = ({ node, isRoot }) => {
    const person = node.data;

    if (!person) {
      console.error("Missing person data for node:", node);
      return null;
    }

    const gender = person.gender || "other";
    const genderColors = {
      male: "#2196f3",
      female: "#e91e63",
      other: "#9c27b0",
    };
    const bgColor = genderColors[gender] || genderColors.other;
    const borderColor = isRoot ? "#ff9800" : bgColor;

    return (
      <div
        className="relatives-tree-node"
        style={{
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: `2px solid ${borderColor}`,
        }}
        onClick={() => handlePersonClick(person)}
        onContextMenu={(e) => handleNodeContextMenu(e, person)}
      >
        <div
          className="relatives-tree-node-avatar"
          style={{
            backgroundColor: bgColor,
            color: "white",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {person.imageUrl ? (
            <img
              src={person.imageUrl}
              alt={person.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          ) : (
            person.name.charAt(0).toUpperCase()
          )}
        </div>
        <div
          style={{
            fontWeight: "500",
            marginBottom: "4px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          {person.name}
        </div>
        {person.nameZh && (
          <div style={{ fontSize: "12px", color: "#666", textAlign: "center" }}>
            {person.nameZh}
          </div>
        )}
      </div>
    );
  };

  // Get context menu items based on context
  const getContextMenuItems = () => {
    if (contextMenu.data?.type === "node") {
      return [
        {
          label: "Edit Person",
          icon: "edit",
          onClick: () => {
            setSelectedNode(contextMenu.data.data);
            setIsEditorOpen(true);
            setIsNewPersonForm(false);
            closeContextMenu();
          },
        },
        {
          label: "Delete Person",
          icon: "trash",
          onClick: () => {
            handleDeletePerson(contextMenu.data.data.id);
            closeContextMenu();
          },
        },
        {
          label: "Center on Person",
          icon: "target",
          onClick: () => {
            setRootId(contextMenu.data.data.id.toString());
            closeContextMenu();
          },
        },
      ];
    } else {
      return [
        {
          label: "Add Person",
          icon: "user-plus",
          onClick: () => {
            handleAddPerson();
            closeContextMenu();
          },
        },
      ];
    }
  };

  // Loading state
  if (personsLoading || relationshipsLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading family tree...</div>
      </div>
    );
  }

  // Error state
  if (personsError || relationshipsError) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="text-lg text-red-600">
          Error loading family tree data. Please try again later.
        </div>
      </div>
    );
  }

  // Empty state
  if (persons.length === 0) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center">
        <div className="text-lg text-gray-600 mb-4">No family members yet</div>
        <button
          onClick={handleAddPerson}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Person
        </button>
      </div>
    );
  }

  // Debug info
  const debugInfo = {
    persons: persons.length,
    relationships: relationships.length,
    nodes: nodes.length,
    rootId: rootId,
  };

  return (
    <div className="family-tree-container relative w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden">
      {/* Debug info */}
      {process.env.NODE_ENV !== "production" && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "rgba(255,255,255,0.8)",
            padding: "5px",
            borderRadius: "4px",
            fontSize: "10px",
            zIndex: 1000,
          }}
        >
          Persons: {debugInfo.persons}, Relationships: {debugInfo.relationships}
          , Nodes: {debugInfo.nodes}, Root: {debugInfo.rootId}
        </div>
      )}

      {/* Family Tree Visualization */}
      <div
        ref={containerRef}
        className="family-tree-wrapper"
        onContextMenu={handleCanvasContextMenu}
      >
        {nodes.length > 0 && rootId && (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ReactFamilyTree
              nodes={nodes}
              rootId={rootId}
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              renderNode={renderNode}
              className="relatives-tree"
            />
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleAddPerson}
            className="p-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700"
            aria-label="Add person"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="16" y1="11" x2="22" y2="11"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Node Editor Modal */}
      {isEditorOpen && selectedNode && (
        <NodeEditor
          person={selectedNode}
          relationships={selectedPersonRelationships}
          allPersons={persons}
          isOpen={isEditorOpen}
          isLoading={isLoading}
          isNewPerson={isNewPersonForm}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedNode(null);
          }}
          onSubmit={handlePersonFormSubmit}
          onDelete={handleDeletePerson}
          onAddRelationship={handleAddRelationship}
          onUpdateRelationship={handleUpdateRelationship}
          onDeleteRelationship={handleDeleteRelationship}
        />
      )}

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={closeContextMenu}
        />
      )}

      {/* Kinship Finder - optional component for finding relationships between people */}
      <div className="absolute bottom-4 left-4">
        <KinshipFinder persons={persons} relationships={relationships} />
      </div>
    </div>
  );
};

export default FamilyTreeWithRelativesTree;
