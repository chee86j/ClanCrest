import { useCallback, useEffect, useMemo, useState } from "react";
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
import KinshipFinder from "./KinshipFinder";
import NodeEditor from "./NodeEditor";

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

// Edge style based on DNA confirmation
const getEdgeStyle = (dnaConfirmed) => ({
  stroke: dnaConfirmed ? "#4caf50" : "#9e9e9e",
  strokeWidth: dnaConfirmed ? 2 : 1,
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

  // Find root nodes (persons without parents)
  const hasParent = new Set(
    relationships
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
    const childRelations = relationships.filter(
      (r) => r.fromId.toString() === id && r.type === "parent"
    );
    childRelations.forEach((r) => {
      queue.push({ id: r.toId.toString(), generation: generation + 1 });
    });

    // Add siblings to same generation
    const siblingRelations = relationships.filter(
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
      <div className="text-center p-2 rounded-lg" style={genderStyles[person.gender || "other"]}>
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
      {relationship.dnaConfirmed && (
        <span className="ml-1 text-green-600" title="DNA Confirmed">
          ✓
        </span>
      )}
    </div>
  ),
  type: "smoothstep",
  style: getEdgeStyle(relationship.dnaConfirmed),
  animated: relationship.dnaConfirmed,
  data: relationship, // Store the full relationship object for easy access
});

const FamilyTree = () => {
  const {
    persons = [],
    loading: personsLoading,
    error: personsError,
    updatePerson,
    deletePerson,
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

  // Calculate node positions
  const nodePositions = useMemo(
    () => calculateNodePositions(persons, relationships),
    [persons, relationships]
  );

  // Convert persons to nodes with calculated positions
  useEffect(() => {
    if (persons?.length > 0) {
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
    if (relationships?.length > 0) {
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
    return relationships.filter(
      (rel) => rel.fromId === selectedNode.id || rel.toId === selectedNode.id
    );
  }, [selectedNode, relationships]);

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
          No family members added yet. Add some people to start building your family tree!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div style={{ width: "100%", height: "500px" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
          <Panel position="top-left" className="bg-white p-2 rounded shadow">
            <div className="text-sm space-y-1">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-500 mr-2" />
                <span>Male</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-pink-100 border border-pink-500 mr-2" />
                <span>Female</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-500 mr-2" />
                <span>Other</span>
              </div>
              <div className="flex items-center mt-2">
                <div className="w-4 h-0 border-t-2 border-green-500 mr-2" />
                <span>DNA Confirmed</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

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
