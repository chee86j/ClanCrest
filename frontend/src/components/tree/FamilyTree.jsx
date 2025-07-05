import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { usePersons } from "../../hooks/usePersons";
import { useRelationships } from "../../hooks/useRelationships";
import KinshipFinder from "./KinshipFinder";

/**
 * Convert person data to ReactFlow node format
 * @param {Object} person - Person data
 * @returns {Object} ReactFlow node
 */
const createPersonNode = (person) => ({
  id: person.id.toString(),
  type: "default",
  data: {
    label: (
      <div className="text-center">
        <div className="font-medium">{person.name}</div>
        {person.nameZh && (
          <div className="text-sm text-gray-500">{person.nameZh}</div>
        )}
      </div>
    ),
  },
  position: { x: Math.random() * 500, y: Math.random() * 500 }, // TODO: Implement proper layout algorithm
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
  label: relationship.type,
  type: "default",
});

const FamilyTree = () => {
  const {
    persons,
    loading: personsLoading,
    error: personsError,
  } = usePersons();
  const {
    relationships,
    loading: relationshipsLoading,
    error: relationshipsError,
  } = useRelationships();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert persons to nodes
  useEffect(() => {
    if (persons.length > 0) {
      const personNodes = persons.map(createPersonNode);
      setNodes(personNodes);
    }
  }, [persons, setNodes]);

  // Convert relationships to edges
  useEffect(() => {
    if (relationships.length > 0) {
      const relationshipEdges = relationships.map(createRelationshipEdge);
      setEdges(relationshipEdges);
    }
  }, [relationships, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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

  return (
    <div className="space-y-8">
      <div style={{ width: "100%", height: "500px" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>

      <div className="max-w-md mx-auto">
        <KinshipFinder persons={persons} />
      </div>
    </div>
  );
};

export default FamilyTree;
