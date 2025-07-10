import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { usePersons } from "../../hooks/usePersons";
import { useRelationships } from "../../hooks/useRelationships";
import useContextMenu from "../../hooks/useContextMenu";
import KinshipFinder from "./KinshipFinder";
import NodeEditor from "./NodeEditor";
import ContextMenu from "./ContextMenu";
import FamilyTreeCanvas from "./FamilyTreeCanvas";
import CustomEdge from "./CustomEdge";
import { useLayoutData } from "../../hooks/useLayoutData";

// Style based on gender
const genderStyles = {
  male: {
    backgroundColor: "#2196f3", // Blue
    color: "#ffffff",
    borderColor: "#1976d2",
  },
  female: {
    backgroundColor: "#e91e63", // Pink
    color: "#ffffff",
    borderColor: "#c2185b",
  },
  other: {
    backgroundColor: "#9c27b0", // Purple
    color: "#ffffff",
    borderColor: "#7b1fa2",
  },
};

// Edge style based on relationship type
const getEdgeStyle = (type) => {
  const baseStyle = {
    strokeWidth: 1.5,
  };

  switch (type) {
    case 'parent':
    case 'child':
      return {
        ...baseStyle,
        stroke: '#757575',
        strokeWidth: 1.5,
      };
    case 'spouse':
      return {
        ...baseStyle,
        stroke: '#757575',
        strokeWidth: 1.5,
      };
    case 'sibling':
      return {
        ...baseStyle,
        stroke: '#9c27b0',
        strokeDasharray: '3,3',
      };
    default:
      return {
        ...baseStyle,
        stroke: '#757575',
      };
  }
};

/**
 * Calculate node positions based on relationships
 * @param {Array} persons - List of persons
 * @param {Array} relationships - List of relationships
 * @returns {Object} Map of node positions
 */
const calculateNodePositions = (persons, relationships) => {
  // Create a graph representation of the family tree
  const familyGraph = {
    nodes: {},    // Person data by ID
    spouses: {},  // Spouse relationships by person ID
    children: {}, // Children by parent ID
    parents: {},  // Parents by child ID
    siblings: {}, // Siblings by person ID
    generations: {} // Persons by generation level
  };
  
  // Ensure relationships is an array
  const relationshipsArray = Array.isArray(relationships) ? relationships : [];
  
  // Add all persons to the graph
  persons.forEach(person => {
    const id = person.id.toString();
    familyGraph.nodes[id] = person;
    familyGraph.spouses[id] = [];
    familyGraph.children[id] = [];
    familyGraph.parents[id] = [];
    familyGraph.siblings[id] = [];
  });
  
  // Process relationships to build the family graph
  relationshipsArray.forEach(rel => {
    const fromId = rel.fromId.toString();
    const toId = rel.toId.toString();
    
    switch (rel.type) {
      case 'spouse':
        // Add bidirectional spouse relationships
        if (!familyGraph.spouses[fromId].includes(toId)) {
          familyGraph.spouses[fromId].push(toId);
        }
        if (!familyGraph.spouses[toId].includes(fromId)) {
          familyGraph.spouses[toId].push(fromId);
        }
        break;
        
      case 'parent':
        // Add parent-child relationships
        if (!familyGraph.children[fromId].includes(toId)) {
          familyGraph.children[fromId].push(toId);
        }
        if (!familyGraph.parents[toId].includes(fromId)) {
          familyGraph.parents[toId].push(fromId);
        }
        break;
        
      case 'child':
        // Add child-parent relationships (inverse of parent)
        if (!familyGraph.parents[fromId].includes(toId)) {
          familyGraph.parents[fromId].push(toId);
        }
        if (!familyGraph.children[toId].includes(fromId)) {
          familyGraph.children[toId].push(fromId);
        }
        break;
        
      case 'sibling':
        // Add bidirectional sibling relationships
        if (!familyGraph.siblings[fromId].includes(toId)) {
          familyGraph.siblings[fromId].push(toId);
        }
        if (!familyGraph.siblings[toId].includes(fromId)) {
          familyGraph.siblings[toId].push(fromId);
        }
        break;
    }
  });
  
  // Assign generations using BFS
  const assignGenerations = () => {
    // Find root nodes (persons without parents)
    const rootIds = Object.keys(familyGraph.nodes).filter(id => 
      familyGraph.parents[id].length === 0
    );
    
    if (rootIds.length === 0 && persons.length > 0) {
      // If no root nodes found, use the first person as root
      rootIds.push(persons[0].id.toString());
    }
    
    // BFS to assign generations
    const queue = rootIds.map(id => ({ id, generation: 0 }));
    const visited = new Set();
    
    while (queue.length > 0) {
      const { id, generation } = queue.shift();
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      // Add to generation map
      if (!familyGraph.generations[generation]) {
        familyGraph.generations[generation] = [];
      }
      familyGraph.generations[generation].push(id);
      
      // Add children to queue with next generation
      familyGraph.children[id].forEach(childId => {
        if (!visited.has(childId)) {
          queue.push({ id: childId, generation: generation + 1 });
        }
      });
      
      // Add siblings to same generation
      familyGraph.siblings[id].forEach(siblingId => {
        if (!visited.has(siblingId)) {
          queue.push({ id: siblingId, generation });
        }
      });
      
      // Add spouses to same generation
      familyGraph.spouses[id].forEach(spouseId => {
        if (!visited.has(spouseId)) {
          queue.push({ id: spouseId, generation });
        }
      });
    }
    
    // Handle any unvisited nodes (disconnected components)
    Object.keys(familyGraph.nodes).forEach(id => {
      if (!visited.has(id)) {
        const generation = Object.keys(familyGraph.generations).length;
        if (!familyGraph.generations[generation]) {
          familyGraph.generations[generation] = [];
        }
        familyGraph.generations[generation].push(id);
      }
    });
  };
  
  assignGenerations();
  
  // Layout constants
  const HORIZONTAL_SPACING = 200;
  const VERTICAL_SPACING = 200;
  const SPOUSE_SPACING = 150;
  
  // Calculate positions
  const positions = {};
  
  // Process each generation
  Object.entries(familyGraph.generations).forEach(([genLevel, personIds]) => {
    const generation = parseInt(genLevel);
    const y = generation * VERTICAL_SPACING;
    
    // Group persons by family units (spouse groups)
    const families = [];
    const processed = new Set();
    
    // Find family units in this generation
    personIds.forEach(personId => {
      if (processed.has(personId)) return;
      
      const spouses = familyGraph.spouses[personId];
      const spousesInSameGen = spouses.filter(id => 
        familyGraph.generations[generation]?.includes(id) && !processed.has(id)
      );
      
      // Create a family unit with this person and their spouses
      const familyUnit = [personId, ...spousesInSameGen];
      families.push(familyUnit);
      
      // Mark all as processed
      familyUnit.forEach(id => processed.add(id));
    });
    
    // Position each family unit
    let currentX = 0;
    families.forEach(family => {
      // Calculate width needed for this family
      const familyWidth = (family.length - 1) * SPOUSE_SPACING;
      
      // Position each person in the family
      family.forEach((personId, index) => {
        positions[personId] = {
          x: currentX + (index * SPOUSE_SPACING),
          y
        };
      });
      
      // Position children of this family
      const allChildren = new Set();
      family.forEach(parentId => {
        familyGraph.children[parentId].forEach(childId => allChildren.add(childId));
      });
      
      if (allChildren.size > 0) {
        // Calculate center position of parents
        const familyCenter = currentX + (familyWidth / 2);
        
        // Calculate children positions in the next generation
        const childrenArray = Array.from(allChildren);
        const childrenWidth = (childrenArray.length - 1) * HORIZONTAL_SPACING;
        const childStartX = familyCenter - (childrenWidth / 2);
        
        // Position each child
        childrenArray.forEach((childId, index) => {
          // Only set position if not already set
          if (!positions[childId]) {
            positions[childId] = {
              x: childStartX + (index * HORIZONTAL_SPACING),
              y: y + VERTICAL_SPACING
            };
          }
        });
      }
      
      // Update current X for next family
      currentX += Math.max(familyWidth + HORIZONTAL_SPACING, HORIZONTAL_SPACING);
    });
  });
  
  // Ensure all persons have positions
  persons.forEach(person => {
    const id = person.id.toString();
    if (!positions[id]) {
      // Place unpositioned persons in a grid at the bottom
      const lastGeneration = Object.keys(familyGraph.generations).length;
      const y = (lastGeneration + 1) * VERTICAL_SPACING;
      
      // Find an empty spot
      let x = 0;
      while (Object.values(positions).some(pos => pos.x === x && pos.y === y)) {
        x += HORIZONTAL_SPACING;
      }
      
      positions[id] = { x, y };
    }
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
      <div className="flex flex-col items-center">
        <div
          className="rounded-full flex items-center justify-center mb-2"
          style={{
            ...genderStyles[person.gender || "other"],
            width: "60px",
            height: "60px",
          }}
        >
          {person.imageUrl ? (
            <img
              src={person.imageUrl}
              alt={person.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="text-xl font-bold text-white">
              {person.name.charAt(0).toUpperCase()}
              {person.name.indexOf(' ') > 0 ? person.name.split(' ')[1].charAt(0).toUpperCase() : ''}
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="font-medium text-sm whitespace-nowrap">{person.name}</div>
          {person.nameZh && (
            <div className="text-xs text-gray-600">{person.nameZh}</div>
          )}
          {person.relationship && (
            <div className="text-xs text-gray-500 uppercase font-semibold mt-1">{person.relationship}</div>
          )}
        </div>
      </div>
    ),
    person, // Store the full person object for easy access
  },
  position: position || { x: 0, y: 0 },
  style: {
    background: "transparent",
    border: "none",
    boxShadow: "none",
    width: 100,
    padding: 0,
  },
  draggable: true, // Enable dragging for all nodes
});

/**
 * Convert relationship data to ReactFlow edge format
 * @param {Array} relationships - Relationship data
 * @returns {Array} ReactFlow edges
 */
const createEdges = (relationships) => {
  if (!Array.isArray(relationships)) return [];

  // Track processed spouse relationships to avoid duplicates
  const processedSpouses = new Set();
  
  return relationships.map((rel) => {
    const fromId = rel.fromId.toString();
    const toId = rel.toId.toString();
    
    // For spouse relationships, create a unique ID to prevent duplicates
    // (since spouses are bidirectional)
    let id;
    if (rel.type === 'spouse') {
      // Sort IDs to ensure consistent edge ID regardless of direction
      const [smallerId, largerId] = [fromId, toId].sort();
      id = `spouse-${smallerId}-${largerId}`;
      
      // Skip if we've already processed this spouse pair
      const spousePairKey = `${smallerId}-${largerId}`;
      if (processedSpouses.has(spousePairKey)) {
        return null;
      }
      processedSpouses.add(spousePairKey);
    } else {
      id = `${rel.type}-${fromId}-${toId}`;
    }
    
    // Set edge style based on relationship type
    const style = getEdgeStyle(rel.type);
    
    // Configure edge based on relationship type
    let edgeConfig = {
      markerEnd: "",
    };
    
    if (rel.type === "parent") {
      // For parent relationships, add a marker at the end
      edgeConfig.markerEnd = `url(#arrow-${id})`;
    } else if (rel.type === "child") {
      // For child relationships, add a marker at the start
      edgeConfig.markerStart = `url(#arrow-${id})`;
    }
    
    return {
      id,
      source: fromId,
      target: toId,
      type: "customEdge",
      style,
      data: { type: rel.type },
      ...edgeConfig,
    };
  }).filter(edge => edge !== null); // Remove null edges (duplicates)
};

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

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewPersonForm, setIsNewPersonForm] = useState(false);
  const [layoutData, setLayoutData] = useState({});
  const { saveNodePositions, getLayoutData } = useLayoutData();

  // Load saved layout data on component mount
  useEffect(() => {
    const loadLayoutData = async () => {
      try {
        const savedLayout = await getLayoutData();
        if (savedLayout && Object.keys(savedLayout).length > 0) {
          console.log("Loaded saved layout:", savedLayout);
          setLayoutData(savedLayout);
        }
      } catch (error) {
        console.error("Error loading layout data:", error);
      }
    };
    
    loadLayoutData();
  }, [getLayoutData]);

  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const [selectedPerson, setSelectedPerson] = useState(null);

  // Initialize ReactFlow instance
  const reactFlowInstanceRef = useRef(null);
  const onInit = useCallback((instance) => {
    reactFlowInstanceRef.current = instance;
  }, []);

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

  // Update the useEffect that creates nodes and edges
  useEffect(() => {
    if (persons && persons.length > 0) {
      console.log("Persons data:", persons);
      
      // Get stored node positions or calculate new ones
      let nodePositions = {};
      
      if (layoutData && Object.keys(layoutData).length > 0) {
        // Use saved layout positions
        console.log("Using saved layout positions:", layoutData);
        nodePositions = layoutData;
      } else {
        // Calculate new positions
        console.log("Calculating new node positions");
        nodePositions = calculateNodePositions(persons, relationships);
        console.log("Calculated positions:", nodePositions);
      }
      
      // Create nodes with positions
      const personNodes = persons.map(person => {
        const position = nodePositions[person.id.toString()] || { x: 0, y: 0 };
        return createPersonNode(person, position);
      });
      
      console.log("Created nodes:", personNodes);
      setNodes(personNodes);
      
      // Create edges from relationships
      if (Array.isArray(relationships) && relationships.length > 0) {
        console.log("Creating edges from relationships:", relationships);
        const edges = createEdges(relationships);
        console.log("Created edges:", edges);
        setEdges(edges);
      } else {
        console.log("No relationships to create edges from");
        setEdges([]);
      }
    } else {
      console.log("No persons data available");
      setNodes([]);
      setEdges([]);
    }
  }, [persons, relationships, layoutData]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node drag events
  const onNodeDragStop = useCallback((event, node) => {
    console.log("Node dragged:", node);
    
    // Update node positions
    setNodePositions(prev => {
      const newPositions = {
        ...prev,
        [node.id]: {
          x: node.position.x,
          y: node.position.y
        }
      };
      
      // Save positions to backend
      saveNodePositions(newPositions)
        .then(() => console.log("Node positions saved"))
        .catch(error => console.error("Failed to save node positions:", error));
      
      return newPositions;
    });
  }, [saveNodePositions]);

  // Node click handler
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data.person);
    setIsNewPersonForm(false);
    setIsEditorOpen(true);
  }, []);

  // Fit view to show all nodes
  const fitView = useCallback(() => {
    if (reactFlowInstanceRef.current) {
      reactFlowInstanceRef.current.fitView({ padding: 0.2, includeHiddenNodes: false });
    }
  }, []);

  // Reset layout to automatic positioning
  const resetLayout = useCallback(() => {
    console.log("Resetting layout");
    
    // Calculate new positions
    const newPositions = calculateNodePositions(persons, relationships);
    setNodePositions(newPositions);
    
    // Save the new positions to backend
    saveNodePositions(newPositions)
      .then(() => console.log("Layout reset and saved"))
      .catch(error => console.error("Failed to save reset layout:", error));
        
    // Update nodes with new positions
    setNodes(nodes => 
      nodes.map(node => {
        const position = newPositions[node.id] || { x: 0, y: 0 };
        return {
          ...node,
          position
        };
      })
    );
  }, [persons, relationships, saveNodePositions]);

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

  // Handle person creation
  const handleCreatePerson = async (personData) => {
    try {
      setIsLoading(true);
      const newPerson = await createPerson(personData);
      setIsEditorOpen(false);
      return newPerson;
    } catch (error) {
      console.error("Failed to create person:", error);
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

  // Handle adding a new person
  const handleAddPerson = useCallback(() => {
    setSelectedNode(null);
    setIsNewPersonForm(true);
    setIsEditorOpen(true);
    // Clear any stored relationship target
    sessionStorage.removeItem('relationshipTarget');
  }, []);

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
            setSelectedNode(person);
            setIsNewPersonForm(false);
            setIsEditorOpen(true);
          },
          icon: <span className="material-icons text-blue-500">edit</span>,
        },
        {
          id: "add-parent",
          label: "Add Parent",
          onClick: async () => {
            // Open form for new person
            setSelectedNode(null);
            setIsNewPersonForm(true);
            setIsEditorOpen(true);
            
            // Store target for relationship
            sessionStorage.setItem('relationshipTarget', JSON.stringify({
              toId: person.id,
              type: "parent"
            }));
          },
          icon: (
            <span className="material-icons text-green-500">person_add</span>
          ),
        },
        {
          id: "add-child",
          label: "Add Child",
          onClick: async () => {
            // Open form for new person
            setSelectedNode(null);
            setIsNewPersonForm(true);
            setIsEditorOpen(true);
            
            // Store target for relationship
            sessionStorage.setItem('relationshipTarget', JSON.stringify({
              fromId: person.id,
              type: "child"
            }));
          },
          icon: (
            <span className="material-icons text-green-500">child_care</span>
          ),
        },
        {
          id: "add-spouse",
          label: "Add Spouse",
          onClick: async () => {
            // Open form for new person
            setSelectedNode(null);
            setIsNewPersonForm(true);
            setIsEditorOpen(true);
            
            // Store target for relationship
            sessionStorage.setItem('relationshipTarget', JSON.stringify({
              fromId: person.id,
              type: "spouse"
            }));
          },
          icon: <span className="material-icons text-red-500">favorite</span>,
        },
        {
          id: "add-sibling",
          label: "Add Sibling",
          onClick: async () => {
            // Open form for new person
            setSelectedNode(null);
            setIsNewPersonForm(true);
            setIsEditorOpen(true);
            
            // Store target for relationship
            sessionStorage.setItem('relationshipTarget', JSON.stringify({
              fromId: person.id,
              type: "sibling"
            }));
          },
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
          onClick: handleAddPerson,
          icon: (
            <span className="material-icons text-green-500">person_add</span>
          ),
        },
        {
          id: "center",
          label: "Fit View",
          onClick: fitView,
          icon: (
            <span className="material-icons text-blue-500">
              center_focus_strong
            </span>
          ),
        },
        {
          id: "reset-layout",
          label: "Reset Layout",
          onClick: resetLayout,
          icon: (
            <span className="material-icons text-blue-500">
              grid_view
            </span>
          ),
        },
      ];
    }

    return [];
  }, [contextMenu.data, fitView, resetLayout, handleDeletePerson, handleAddPerson]);

  // Handle person form submission
  const handlePersonFormSubmit = async (personData) => {
    try {
      if (isNewPersonForm) {
        // Create new person
        const newPerson = await handleCreatePerson(personData);
        
        // Check if we need to create a relationship
        const relationshipTarget = sessionStorage.getItem('relationshipTarget');
        if (relationshipTarget && newPerson) {
          const targetData = JSON.parse(relationshipTarget);
          
          // Create relationship with the new person
          if (targetData.fromId) {
            await handleAddRelationship({
              ...targetData,
              toId: newPerson.id
            });
          } else if (targetData.toId) {
            await handleAddRelationship({
              ...targetData,
              fromId: newPerson.id
            });
          }
          
          // Clear stored target
          sessionStorage.removeItem('relationshipTarget');
        }
      } else {
        // Update existing person
        await handleUpdatePerson(personData);
      }
    } catch (error) {
      console.error("Person form submission error:", error);
    }
  };

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
    <div className="w-full h-[600px] relative">
      <FamilyTreeCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        onPaneClick={closeContextMenu}
        onInit={onInit}
        genderStyles={genderStyles}
        fitView={fitView}
        resetLayout={resetLayout}
        addPerson={handleAddPerson}
      />

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

      {isEditorOpen && (
        <NodeEditor
          person={selectedNode}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedNode(null);
            sessionStorage.removeItem('relationshipTarget');
          }}
          onUpdatePerson={handlePersonFormSubmit}
          onDeletePerson={handleDeletePerson}
          onAddRelationship={handleAddRelationship}
          onUpdateRelationship={handleUpdateRelationship}
          onDeleteRelationship={handleDeleteRelationship}
          relationships={selectedPersonRelationships}
          isLoading={isLoading}
          isNewPerson={isNewPersonForm}
        />
      )}

      <div className="max-w-md mx-auto">
        <KinshipFinder persons={persons} />
      </div>
    </div>
  );
};

export default FamilyTree;
