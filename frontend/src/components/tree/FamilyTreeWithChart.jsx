import { useCallback, useEffect, useState, useRef } from "react";
import { usePersons } from "../../hooks/usePersons";
import { useRelationships } from "../../hooks/useRelationships";
import useContextMenu from "../../hooks/useContextMenu";
import KinshipFinder from "./KinshipFinder";
import NodeEditor from "./NodeEditor";
import ContextMenu from "./ContextMenu";
import FamilyChartWrapper from "./FamilyChartWrapper";
import { useLayoutData } from "../../hooks/useLayoutData";

/**
 * FamilyTreeWithChart component
 * A family tree visualization using family-chart library
 */
const FamilyTreeWithChart = () => {
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

  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewPersonForm, setIsNewPersonForm] = useState(false);
  const [layoutData, setLayoutData] = useState({});
  const { saveNodePositions, getLayoutData } = useLayoutData();
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const [selectedPerson, setSelectedPerson] = useState(null);
  const chartRef = useRef(null);

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

  // Handle person click
  const handlePersonClick = useCallback((person) => {
    setSelectedNode(person);
    setIsEditorOpen(true);
    setIsNewPersonForm(false);
  }, []);

  // Handle context menu for canvas
  const handleCanvasContextMenu = useCallback((e) => {
    e.preventDefault();
    openContextMenu(e.pageX, e.pageY, { type: "canvas" });
  }, [openContextMenu]);

  // Handle node context menu
  const handleNodeContextMenu = useCallback((e, person) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(e.pageX, e.pageY, { type: "node", data: person });
  }, [openContextMenu]);

  // Handle layout change
  const handleLayoutChange = useCallback((layout) => {
    // Debounce layout saving to prevent too many API calls
    const debouncedSave = setTimeout(() => {
      saveNodePositions(layout);
    }, 1000);
    
    return () => clearTimeout(debouncedSave);
  }, [saveNodePositions]);

  // Get relationships for selected person
  const selectedPersonRelationships = selectedNode 
    ? relationships.filter(rel => 
        rel.fromId === selectedNode.id || rel.toId === selectedNode.id
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
            if (chartRef.current) {
              chartRef.current.centerOnPerson(contextMenu.data.data.id);
            }
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
        {
          label: "Fit Tree",
          icon: "maximize",
          onClick: () => {
            if (chartRef.current) {
              chartRef.current.fitTree();
            }
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

  return (
    <div className="w-full h-[600px] relative">
      <FamilyChartWrapper
        ref={chartRef}
        persons={persons}
        relationships={relationships}
        onPersonClick={handlePersonClick}
        onLayoutChange={handleLayoutChange}
        layoutData={layoutData}
        onContextMenu={handleCanvasContextMenu}
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

      <div className="max-w-md mx-auto mt-4">
        <KinshipFinder persons={persons} />
      </div>
    </div>
  );
};

export default FamilyTreeWithChart; 