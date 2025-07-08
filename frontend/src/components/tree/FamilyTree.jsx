import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { usePersons } from "../../hooks/usePersons";
import { useRelationships } from "../../hooks/useRelationships";
import useContextMenu from "../../hooks/useContextMenu";
import KinshipFinder from "./KinshipFinder";
import NodeEditor from "./NodeEditor";
import ContextMenu from "./ContextMenu";

// Node style based on gender
const genderStyles = {
  male: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
  female: {
    backgroundColor: "#fce4ec",
    borderColor: "#e91e63",
  },
  other: {
    backgroundColor: "#f3e5f5",
    borderColor: "#9c27b0",
  },
};

// Edge style
const getEdgeStyle = () => ({
  stroke: "#9e9e9e",
  strokeWidth: 1,
});

/**
 * Calculate node positions based on relationships
 * @param {Array} persons - List of persons
 * @param {Array} relationships - List of relationships
 * @returns {Object} Map of node positions
 */
const calculateNodePositions = (persons, relationships) => {
  const positions = {};
  const generations = {};
  const processed = new Set();

  // Ensure relationships is an array
  const relationshipsArray = Array.isArray(relationships) ? relationships : [];

  // Find root nodes (persons without parents)
  const hasParent = new Set(
    relationshipsArray
      .filter((r) => r.type === "child")
      .map((r) => r.fromId.toString())
  );

  const rootNodes = persons
    .filter((p) => !hasParent.has(p.id.toString()))
    .map((p) => p.id.toString());

  // BFS to assign generations
  const queue = rootNodes.map((id) => ({ id, generation: 0 }));
  while (queue.length > 0) {
    const { id, generation } = queue.shift();
    if (processed.has(id)) continue;

    processed.add(id);
    if (!generations[generation]) generations[generation] = [];
    generations[generation].push(id);

    // Add children to queue
    const childRelations = relationshipsArray.filter(
      (r) => r.fromId.toString() === id && r.type === "parent"
    );
    childRelations.forEach((r) => {
      queue.push({ id: r.toId.toString(), generation: generation + 1 });
    });

    // Add siblings to same generation
    const siblingRelations = relationshipsArray.filter(
      (r) => r.fromId.toString() === id && r.type === "sibling"
    );
    siblingRelations.forEach((r) => {
      queue.push({ id: r.toId.toString(), generation });
    });
  }

  // Calculate positions
  const VERTICAL_SPACING = 150;
  const HORIZONTAL_SPACING = 200;

  Object.entries(generations).forEach(([gen, nodeIds]) => {
    const y = parseInt(gen) * VERTICAL_SPACING;
    nodeIds.forEach((id, index) => {
      const x = (index - (nodeIds.length - 1) / 2) * HORIZONTAL_SPACING;
      positions[id] = { x, y };
    });
  });

  return positions;
};

/**
 * Convert person data to ReactFlow node format
 * @param {Object} person - Person data
 * @param {Object} position - Node position
 * @returns {Object} ReactFlow node
 */
const createPersonNode = (person, position) => ({
  id: person.id.toString(),
  type: "default",
  data: {
    label: (
      <div
        className="text-center p-2 rounded-lg"
        style={genderStyles[person.gender || "other"]}
      >
        <div className="font-medium">{person.name}</div>
        {person.nameZh && (
          <div className="text-sm text-gray-500">{person.nameZh}</div>
        )}
        {person.gender && (
          <div className="text-xs text-gray-500 mt-1">
            {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}
          </div>
        )}
      </div>
    ),
    person, // Store the full person object for easy access
  },
  position: position || { x: 0, y: 0 },
  style: {
    background: "transparent",
    border: "none",
  },
  draggable: true, // Enable dragging for all nodes
});

/**
 * Convert relationship data to ReactFlow edge format
 * @param {Object} relationship - Relationship data
 * @returns {Object} ReactFlow edge
 */
const createRelationshipEdge = (relationship) => ({
  id: relationship.id.toString(),
  source: relationship.fromId.toString(),
  target: relationship.toId.toString(),
  label: (
    <div className="bg-white px-2 py-1 rounded shadow-sm">
      <span>{relationship.type}</span>
    </div>
  ),
  type: "smoothstep",
  style: getEdgeStyle(),
  data: relationship,
});

// Debounce function to limit API calls during dragging
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const FamilyTree = () => {
  const {
    persons = [],
    loading: personsLoading,
    error: personsError,
    updatePerson,
    deletePerson,
    updatePersonPosition,
  } = usePersons();
  const {
    relationships = [],
    loading: relationshipsLoading,
    error: relationshipsError,
    createRelationship,
    updateRelationship,
    deleteRelationship,
  } = useRelationships();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const [selectedPerson, setSelectedPerson] = useState(null);

  // Create a ref for the debounced save function
  const debouncedSaveRef = useRef(
    debounce((nodeId, position) => {
      const personId = parseInt(nodeId);
      updatePersonPosition(personId, {
        positionX: position.x,
        positionY: position.y,
      });
    }, 500) // 500ms debounce delay
  );

  // Calculate node positions
  const nodePositions = useMemo(() => {
    // Ensure persons is an array
    const personsArray = Array.isArray(persons) ? persons : [];

    // Create a map of saved positions from persons data
    const savedPositions = {};
    personsArray.forEach((person) => {
      if (person.positionX !== null && person.positionY !== null) {
        savedPositions[person.id.toString()] = {
          x: person.positionX,
          y: person.positionY,
        };
      }
    });

    // Calculate default positions
    const calculatedPositions = calculateNodePositions(
      personsArray,
      relationships
    );

    // Merge saved positions with calculated ones (saved take precedence)
    return {
      ...calculatedPositions,
      ...savedPositions,
    };
  }, [persons, relationships]);

  // Convert persons to nodes with calculated positions
  useEffect(() => {
    // Ensure persons is an array and nodePositions is an object
    if (Array.isArray(persons) && persons.length > 0 && nodePositions) {
      const personNodes = persons.map((person) =>
        createPersonNode(person, nodePositions[person.id.toString()])
      );
      setNodes(personNodes);
    } else {
      setNodes([]);
    }
  }, [persons, nodePositions, setNodes]);

  // Convert relationships to edges
  useEffect(() => {
    // Ensure relationships is an array
    if (Array.isArray(relationships) && relationships.length > 0) {
      const relationshipEdges = relationships.map(createRelationshipEdge);
      setEdges(relationshipEdges);
    } else {
      setEdges([]);
    }
  }, [relationships, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node drag
  const handleNodeDragStop = useCallback((event, node) => {
    if (node && node.id && node.position) {
      // Save the node position to the backend
      debouncedSaveRef.current(node.id, node.position);
    }
  }, []);

  // Node click handler
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data.person);
    setIsEditorOpen(true);
  }, []);

  // Handle person updates
  const handleUpdatePerson = async (updatedData) => {
    try {
      setIsLoading(true);
      await updatePerson(selectedNode.id, updatedData);
      setIsEditorOpen(false);
      setSelectedNode(null);
    } catch (error) {
      console.error("Failed to update person:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle person deletion
  const handleDeletePerson = async (personId) => {
    try {
      setIsLoading(true);
      await deletePerson(personId);
      setIsEditorOpen(false);
      setSelectedNode(null);
    } catch (error) {
      console.error("Failed to delete person:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle relationship creation
  const handleAddRelationship = async (relationshipData) => {
    try {
      setIsLoading(true);
      await createRelationship(relationshipData);
    } catch (error) {
      console.error("Failed to create relationship:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle relationship updates
  const handleUpdateRelationship = async (relationshipId, updatedData) => {
    try {
      setIsLoading(true);
      await updateRelationship(relationshipId, updatedData);
    } catch (error) {
      console.error("Failed to update relationship:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle relationship deletion
  const handleDeleteRelationship = async (relationshipId) => {
    try {
      setIsLoading(true);
      await deleteRelationship(relationshipId);
    } catch (error) {
      console.error("Failed to delete relationship:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get relationships for selected person
  const selectedPersonRelationships = useMemo(() => {
    if (!selectedNode) return [];
    if (!Array.isArray(relationships)) return [];

    return relationships.filter(
      (rel) => rel.fromId === selectedNode.id || rel.toId === selectedNode.id
    );
  }, [selectedNode, relationships]);

  // Handle node context menu
  const handleNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      setSelectedPerson(node.data.person);
      openContextMenu(event, { type: "node", node });
    },
    [openContextMenu]
  );

  // Handle canvas context menu
  const handlePaneContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      openContextMenu(event, { type: "pane", position });
    },
    [openContextMenu]
  );

  // Generate context menu items based on context
  const getContextMenuItems = useCallback(() => {
    if (!contextMenu.data) return [];

    if (contextMenu.data.type === "node") {
      const person = contextMenu.data.node.data.person;
      return [
        {
          id: "edit",
          label: "Edit Person",
          onClick: () => {
            setSelectedNode(contextMenu.data.node);
            setIsEditorOpen(true);
          },
          icon: <span className="material-icons text-blue-500">edit</span>,
        },
        {
          id: "add-parent",
          label: "Add Parent",
          onClick: () =>
            handleAddRelationship({
              toId: person.id,
              type: "parent",
            }),
          icon: (
            <span className="material-icons text-green-500">person_add</span>
          ),
        },
        {
          id: "add-child",
          label: "Add Child",
          onClick: () =>
            handleAddRelationship({
              fromId: person.id,
              type: "child",
            }),
          icon: (
            <span className="material-icons text-green-500">child_care</span>
          ),
        },
        {
          id: "add-spouse",
          label: "Add Spouse",
          onClick: () =>
            handleAddRelationship({
              fromId: person.id,
              type: "spouse",
            }),
          icon: <span className="material-icons text-red-500">favorite</span>,
        },
        {
          id: "add-sibling",
          label: "Add Sibling",
          onClick: () =>
            handleAddRelationship({
              fromId: person.id,
              type: "sibling",
            }),
          icon: <span className="material-icons text-purple-500">people</span>,
        },
        {
          id: "delete",
          label: "Delete Person",
          onClick: () => handleDeletePerson(person.id),
          icon: <span className="material-icons text-red-500">delete</span>,
        },
      ];
    }

    if (contextMenu.data.type === "pane") {
      return [
        {
          id: "add-person",
          label: "Add New Person",
          onClick: () => {
            setSelectedNode(null);
            setIsEditorOpen(true);
          },
          icon: (
            <span className="material-icons text-green-500">person_add</span>
          ),
        },
        {
          id: "center",
          label: "Center View",
          onClick: () => {
            // TODO: Implement center view functionality
          },
          icon: (
            <span className="material-icons text-blue-500">
              center_focus_strong
            </span>
          ),
        },
      ];
    }

    return [];
  }, [contextMenu.data, handleAddRelationship, handleDeletePerson]);

  // Loading state
  if (personsLoading || relationshipsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading family tree...</div>
      </div>
    );
  }

  // Error state
  if (personsError || relationshipsError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-600">
          Error loading family tree. Please try again later.
        </div>
      </div>
    );
  }

  // Empty state
  if (!persons?.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">
          No family members added yet. Add some people to start building your
          family tree!
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        onClick={closeContextMenu}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={onNodeClick}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />

        <ContextMenu
          isOpen={contextMenu.isOpen}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          items={getContextMenuItems()}
          title={
            contextMenu.data?.type === "node"
              ? "Person Actions"
              : "Tree Actions"
          }
        />
      </ReactFlow>

      {isEditorOpen && selectedNode && (
        <NodeEditor
          person={selectedNode}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedNode(null);
          }}
          onUpdatePerson={handleUpdatePerson}
          onDeletePerson={handleDeletePerson}
          onAddRelationship={handleAddRelationship}
          onUpdateRelationship={handleUpdateRelationship}
          onDeleteRelationship={handleDeleteRelationship}
          relationships={selectedPersonRelationships}
          isLoading={isLoading}
        />
      )}

      <div className="max-w-md mx-auto">
        <KinshipFinder persons={persons} />
      </div>
    </div>
  );
};

export default FamilyTree;
