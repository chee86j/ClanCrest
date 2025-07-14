import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import FamilyTree from "../components/tree/FamilyTree";
import KinshipFinder from "../components/tree/KinshipFinder";
import KinshipChatbot from "../components/tree/KinshipChatbot";
import PersonForm from "../components/person/PersonForm";
import RelationshipForm from "../components/person/RelationshipForm";
import personService from "../services/personService";
import relationshipService from "../services/relationshipService";
import { convertToTreeData, generateUniqueId } from "../utils/treeDataAdapter";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const Dashboard = () => {
  const [persons, setPersons] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [treeData, setTreeData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [rootPersonId, setRootPersonId] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // For development without backend, use sample data
        if (import.meta.env.DEV && import.meta.env.VITE_USE_API !== "true") {
          loadSampleData();
        } else {
          try {
            // Fetch from API
            const personsData = await personService.getAllPersons();
            const relationshipsData =
              await relationshipService.getAllRelationships();

            setPersons(personsData);
            setRelationships(relationshipsData);

            // Convert to tree data
            const tree = convertToTreeData(personsData, relationshipsData);
            setTreeData(tree);

            // Set root person if available
            if (personsData.length > 0) {
              setRootPersonId(tree.id);
            }
          } catch (err) {
            console.error("Error connecting to backend:", err);
            setError(
              "Failed to connect to backend. Using offline mode with sample data."
            );
            setIsOfflineMode(true);
            loadSampleData();
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load family tree data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadSampleData = () => {
    // Sample data
    const samplePersons = [
      {
        id: "1",
        firstName: "John",
        lastName: "Smith",
        chineseName: "约翰·史密斯",
        gender: "male",
        birthDate: "1970-01-01",
      },
      {
        id: "2",
        firstName: "Mary",
        lastName: "Smith",
        chineseName: "玛丽·史密斯",
        gender: "female",
        birthDate: "1995-05-15",
      },
      {
        id: "3",
        firstName: "Robert",
        lastName: "Smith",
        chineseName: "罗伯特·史密斯",
        gender: "male",
        birthDate: "1998-08-20",
      },
      {
        id: "4",
        firstName: "Emma",
        lastName: "Smith",
        chineseName: "艾玛·史密斯",
        gender: "female",
        birthDate: "2020-03-10",
      },
    ];

    const sampleRelationships = [
      {
        id: "r1",
        fromId: "1",
        toId: "2",
        type: "parent",
      },
      {
        id: "r2",
        fromId: "1",
        toId: "3",
        type: "parent",
      },
      {
        id: "r3",
        fromId: "3",
        toId: "4",
        type: "parent",
      },
    ];

    setPersons(samplePersons);
    setRelationships(sampleRelationships);

    // Convert to tree data
    const tree = convertToTreeData(samplePersons, sampleRelationships);
    setTreeData(tree);
    setRootPersonId("1");
  };

  const handleNodeClick = (nodeData) => {
    setSelectedNode(nodeData);
  };

  const handleAddPerson = () => {
    setEditingPerson(null);
    setShowPersonForm(true);
    setShowRelationshipForm(false);
  };

  const handleEditPerson = () => {
    if (!selectedNode) return;

    const personToEdit = persons.find((p) => p.id === selectedNode.id);
    if (personToEdit) {
      setEditingPerson(personToEdit);
      setShowPersonForm(true);
      setShowRelationshipForm(false);
    }
  };

  const handleAddRelative = () => {
    setShowRelationshipForm(true);
    setShowPersonForm(false);
  };

  const handlePersonFormSubmit = async (personData) => {
    try {
      let updatedPerson;

      if (isOfflineMode) {
        // Handle offline mode
        if (personData.id) {
          // Update existing person in local state
          updatedPerson = { ...personData };
          setPersons((prevPersons) =>
            prevPersons.map((p) => (p.id === personData.id ? updatedPerson : p))
          );
        } else {
          // Create new person in local state with generated ID
          updatedPerson = { ...personData, id: generateUniqueId() };
          setPersons((prevPersons) => [...prevPersons, updatedPerson]);
        }
      } else {
        if (personData.id) {
          // Update existing person
          updatedPerson = await personService.updatePerson(
            personData.id,
            personData
          );

          // Update local state
          setPersons((prevPersons) =>
            prevPersons.map((p) =>
              p.id === updatedPerson.id ? updatedPerson : p
            )
          );
        } else {
          // Create new person
          updatedPerson = await personService.createPerson(personData);

          // Update local state
          setPersons((prevPersons) => [...prevPersons, updatedPerson]);
        }
      }

      // Close form
      setShowPersonForm(false);
      setEditingPerson(null);

      // Update tree data
      const newTreeData = convertToTreeData(
        [
          ...persons.filter((p) => p.id !== (updatedPerson?.id || null)),
          updatedPerson,
        ],
        relationships,
        rootPersonId
      );
      setTreeData(newTreeData);
    } catch (err) {
      console.error("Error saving person:", err);
      setError("Failed to save person. Please try again.");
    }
  };

  const handleRelationshipFormSubmit = async (relationshipData) => {
    try {
      let newRelationship;

      if (isOfflineMode) {
        // Handle offline mode
        newRelationship = { ...relationshipData, id: generateUniqueId() };
        setRelationships((prevRelationships) => [
          ...prevRelationships,
          newRelationship,
        ]);
      } else {
        // Create new relationship
        newRelationship = await relationshipService.createRelationship(
          relationshipData
        );

        // Update local state
        setRelationships((prevRelationships) => [
          ...prevRelationships,
          newRelationship,
        ]);
      }

      // Close form
      setShowRelationshipForm(false);

      // Update tree data
      const newTreeData = convertToTreeData(
        persons,
        [...relationships, newRelationship],
        rootPersonId
      );
      setTreeData(newTreeData);
    } catch (err) {
      console.error("Error creating relationship:", err);
      setError("Failed to create relationship. Please try again.");
    }
  };

  const handleDeletePerson = async () => {
    if (!selectedNode || !selectedNode.id) return;

    if (
      window.confirm(`Are you sure you want to delete ${selectedNode.name}?`)
    ) {
      try {
        if (!isOfflineMode) {
          await personService.deletePerson(selectedNode.id);
        }

        // Update local state
        setPersons((prevPersons) =>
          prevPersons.filter((p) => p.id !== selectedNode.id)
        );

        // Remove relationships involving this person
        const updatedRelationships = relationships.filter(
          (r) => r.fromId !== selectedNode.id && r.toId !== selectedNode.id
        );
        setRelationships(updatedRelationships);

        // Clear selected node
        setSelectedNode(null);

        // Update tree data
        const newTreeData = convertToTreeData(
          persons.filter((p) => p.id !== selectedNode.id),
          updatedRelationships,
          rootPersonId === selectedNode.id ? null : rootPersonId
        );
        setTreeData(newTreeData);
      } catch (err) {
        console.error("Error deleting person:", err);
        setError("Failed to delete person. Please try again.");
      }
    }
  };

  const handleExportTree = async () => {
    try {
      const treeContainer = document.querySelector(".tree-container");
      if (!treeContainer) return;

      const canvas = await html2canvas(treeContainer);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("family-tree.pdf");
    } catch (err) {
      console.error("Error exporting tree:", err);
      setError("Failed to export family tree. Please try again.");
    }
  };

  const handleCenterTree = () => {
    // This functionality is handled by the FamilyTree component
    // We can trigger a re-render to recenter
    setTreeData({ ...treeData });
  };

  // Add a toggle function for the chatbot
  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Family Tree Dashboard</h1>
        <p className="text-gray-600">
          Visualize and manage your family connections
        </p>
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="w-full h-[600px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
              <p className="text-gray-500">Loading family tree...</p>
            </div>
          ) : treeData ? (
            <div className="tree-container">
              <FamilyTree data={treeData} onNodeClick={handleNodeClick} />
            </div>
          ) : (
            <div className="w-full h-[600px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center flex-col">
              <p className="text-gray-500 mb-4">
                No family tree data available
              </p>
              <button
                onClick={handleAddPerson}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md"
              >
                Add First Person
              </button>
            </div>
          )}
        </div>

        <div>
          {showPersonForm ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingPerson ? "Edit Person" : "Add New Person"}
              </h2>
              <PersonForm
                person={editingPerson}
                onSubmit={handlePersonFormSubmit}
                onCancel={() => {
                  setShowPersonForm(false);
                  setEditingPerson(null);
                }}
              />
            </div>
          ) : showRelationshipForm ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Add Relationship</h2>
              <RelationshipForm
                persons={persons}
                selectedPerson={
                  selectedNode
                    ? persons.find((p) => p.id === selectedNode.id)
                    : null
                }
                onSubmit={handleRelationshipFormSubmit}
                onCancel={() => setShowRelationshipForm(false)}
              />
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <h2 className="text-xl font-semibold mb-4">Selected Person</h2>
                {selectedNode ? (
                  <div>
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <h3 className="font-bold text-lg">{selectedNode.name}</h3>
                      {selectedNode.chineseName && (
                        <p className="text-gray-600">
                          {selectedNode.chineseName}
                        </p>
                      )}
                      <p className="text-gray-600 mt-2">
                        Gender: {selectedNode.gender || "Not specified"}
                      </p>
                      {selectedNode.attributes?.birthDate && (
                        <p className="text-gray-600">
                          Birth Year:{" "}
                          {new Date(
                            selectedNode.attributes.birthDate
                          ).getFullYear()}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={handleEditPerson}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleAddRelative}
                        className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Add Relative
                      </button>
                      <button
                        onClick={handleDeletePerson}
                        className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Select a person to view details
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <h2 className="text-xl font-semibold mb-4">Actions</h2>
                <div className="space-y-2">
                  <button
                    onClick={handleAddPerson}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center"
                  >
                    <span className="material-icons mr-2">person_add</span>
                    Add New Person
                  </button>
                  <button
                    onClick={handleExportTree}
                    className="w-full bg-white border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-md flex items-center"
                  >
                    <span className="material-icons mr-2">file_download</span>
                    Export Tree
                  </button>
                  <button
                    onClick={handleCenterTree}
                    className="w-full bg-white border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-md flex items-center"
                  >
                    <span className="material-icons mr-2">
                      center_focus_strong
                    </span>
                    Center Tree
                  </button>
                  <button
                    onClick={toggleChatbot}
                    className="w-full bg-white border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-md flex items-center"
                  >
                    <span className="material-icons mr-2">chat</span>
                    {showChatbot ? "Hide Chatbot" : "Show Chatbot"}
                  </button>
                </div>
              </div>
            </>
          )}

          {!showPersonForm && !showRelationshipForm && (
            <>
              {showChatbot ? (
                <KinshipChatbot persons={persons} />
              ) : (
                <KinshipFinder
                  persons={persons}
                  relationships={relationships}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
