/**
 * relativesTreeDataAdapter.js
 * Utility functions to transform data between our application format and relatives-tree format
 */

/**
 * Convert persons and relationships data to relatives-tree format
 * @param {Array} persons - Array of person objects
 * @param {Array} relationships - Array of relationship objects
 * @returns {Object} Data formatted for relatives-tree with nodes and rootId
 */
export const toRelativesTreeFormat = (persons, relationships) => {
  if (!Array.isArray(persons) || !Array.isArray(relationships)) {
    return { nodes: [], rootId: null };
  }

  console.log("Converting to relatives-tree format:", {
    persons,
    relationships,
  });

  // Create a map of person IDs to relatives-tree nodes
  const nodesMap = new Map();

  // First pass: create all nodes with basic structure
  persons.forEach((person) => {
    const id = person.id.toString();
    nodesMap.set(id, {
      id,
      gender: person.gender || "other",
      parents: [],
      children: [],
      siblings: [],
      spouses: [],
      // Store original data for reference
      data: { ...person },
    });
  });

  // Second pass: process relationships
  relationships.forEach((rel) => {
    const fromId = rel.fromId.toString();
    const toId = rel.toId.toString();
    const fromNode = nodesMap.get(fromId);
    const toNode = nodesMap.get(toId);

    if (!fromNode || !toNode) {
      console.warn(
        `Missing node for relationship: ${fromId} -> ${toId}, type: ${rel.type}`
      );
      return;
    }

    // Process relationship based on type
    switch (rel.type) {
      case "spouse":
        // Add spouse relationship (bidirectional)
        if (!fromNode.spouses.includes(toId)) {
          fromNode.spouses.push(toId);
        }
        if (!toNode.spouses.includes(fromId)) {
          toNode.spouses.push(fromId);
        }
        break;

      case "parent":
        // Add parent relationship
        if (!fromNode.children.includes(toId)) {
          fromNode.children.push(toId);
        }
        if (!toNode.parents.includes(fromId)) {
          toNode.parents.push(fromId);
        }
        break;

      case "child":
        // Add child relationship (inverse of parent)
        if (!fromNode.parents.includes(toId)) {
          fromNode.parents.push(toId);
        }
        if (!toNode.children.includes(fromId)) {
          toNode.children.push(fromId);
        }
        break;

      case "sibling":
        // Add sibling relationship (bidirectional)
        if (!fromNode.siblings.includes(toId)) {
          fromNode.siblings.push(toId);
        }
        if (!toNode.siblings.includes(fromId)) {
          toNode.siblings.push(fromId);
        }
        break;
    }
  });

  // Find root person (person without parents or the first person if all have parents)
  let rootPerson = findRootPerson(persons, relationships);
  let rootId = rootPerson ? rootPerson.id.toString() : null;

  // If we have a spouse relationship but no parent/child relationships,
  // make sure we use one of the spouses as root
  if (!rootId && persons.length > 0) {
    // Default to first person
    rootId = persons[0].id.toString();

    // Check for spouse relationships
    const spouseRels = relationships.filter((rel) => rel.type === "spouse");
    if (spouseRels.length > 0) {
      // Use the first person in a spouse relationship as root
      rootId = spouseRels[0].fromId.toString();
    }
  }

  // Log the final nodes and rootId
  const finalNodes = Array.from(nodesMap.values());
  console.log("Final nodes:", finalNodes);
  console.log("Root ID:", rootId);

  // Convert to array format expected by relatives-tree
  return {
    nodes: finalNodes,
    rootId,
  };
};

/**
 * Convert relatives-tree data back to our application format
 * @param {Array} nodes - Nodes from relatives-tree
 * @returns {Object} Object containing persons and relationships arrays
 */
export const fromRelativesTreeFormat = (nodes) => {
  const persons = [];
  const relationships = [];
  const processedRelationships = new Set();

  if (!Array.isArray(nodes)) {
    return { persons, relationships };
  }

  // Extract persons from nodes
  nodes.forEach((node) => {
    // Extract original person data if available, otherwise create from node data
    const person = node.data || {
      id: parseInt(node.id),
      name: node.name || "",
      nameZh: node.nameZh || "",
      gender: node.gender || "other",
      notes: node.notes || "",
      imageUrl: node.imageUrl || "",
    };

    persons.push(person);
  });

  // Extract relationships from nodes
  nodes.forEach((node) => {
    const fromId = parseInt(node.id);

    // Process spouse relationships
    if (node.spouses && Array.isArray(node.spouses)) {
      node.spouses.forEach((spouseId) => {
        const toId = parseInt(spouseId);
        // Create a unique key to prevent duplicate relationships
        const relationshipKey = [
          Math.min(fromId, toId),
          Math.max(fromId, toId),
          "spouse",
        ].join("-");

        if (!processedRelationships.has(relationshipKey)) {
          relationships.push({
            fromId,
            toId,
            type: "spouse",
          });
          processedRelationships.add(relationshipKey);
        }
      });
    }

    // Process parent-child relationships
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((childId) => {
        const toId = parseInt(childId);
        const relationshipKey = [fromId, toId, "parent"].join("-");

        if (!processedRelationships.has(relationshipKey)) {
          relationships.push({
            fromId,
            toId,
            type: "parent",
          });
          processedRelationships.add(relationshipKey);
        }
      });
    }

    // Process sibling relationships
    if (node.siblings && Array.isArray(node.siblings)) {
      node.siblings.forEach((siblingId) => {
        const toId = parseInt(siblingId);
        // Create a unique key to prevent duplicate relationships
        // Use consistent ordering (smaller ID first) to avoid duplicates
        const relationshipKey = [
          Math.min(fromId, toId),
          Math.max(fromId, toId),
          "sibling",
        ].join("-");

        if (!processedRelationships.has(relationshipKey)) {
          relationships.push({
            fromId: Math.min(fromId, toId),
            toId: Math.max(fromId, toId),
            type: "sibling",
          });
          processedRelationships.add(relationshipKey);
        }
      });
    }
  });

  return { persons, relationships };
};

/**
 * Find a suitable root person for the family tree
 * @param {Array} persons - Array of person objects
 * @param {Array} relationships - Array of relationship objects
 * @returns {Object|null} Root person or null if no persons exist
 */
export const findRootPerson = (persons, relationships) => {
  if (!Array.isArray(persons) || persons.length === 0) {
    return null;
  }

  // Create a map to track parent relationships
  const hasParents = new Map();
  persons.forEach((person) => {
    hasParents.set(person.id.toString(), false);
  });

  // Mark persons who have parents
  relationships.forEach((rel) => {
    if (rel.type === "child" || rel.type === "parent") {
      const childId =
        rel.type === "child" ? rel.fromId.toString() : rel.toId.toString();
      hasParents.set(childId, true);
    }
  });

  // Find persons without parents
  const rootCandidates = persons.filter(
    (person) => !hasParents.get(person.id.toString())
  );

  // Return the first person without parents, or the first person if all have parents
  return rootCandidates.length > 0 ? rootCandidates[0] : persons[0];
};

/**
 * Calculate node positions based on family structure
 * @param {Array} nodes - Nodes in relatives-tree format
 * @param {String} rootId - ID of the root node
 * @returns {Object} Map of node positions by ID
 */
export const calculateNodePositions = (nodes, rootId) => {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return {};
  }

  const positions = {};
  const HORIZONTAL_SPACING = 200;
  const VERTICAL_SPACING = 150;

  // Simple positioning algorithm - can be enhanced for better layout
  const positionNode = (nodeId, x, y, visited = new Set()) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    positions[nodeId] = { x, y };

    // Position children below
    let childX = x - ((node.children.length - 1) * HORIZONTAL_SPACING) / 2;
    node.children.forEach((childId) => {
      positionNode(childId, childX, y + VERTICAL_SPACING, visited);
      childX += HORIZONTAL_SPACING;
    });

    // Position spouses to the right
    let spouseX = x + HORIZONTAL_SPACING;
    node.spouses.forEach((spouseId) => {
      if (!visited.has(spouseId)) {
        positionNode(spouseId, spouseX, y, visited);
        spouseX += HORIZONTAL_SPACING;
      }
    });

    // Position siblings to the left and right
    let leftSiblingX = x - HORIZONTAL_SPACING;
    let rightSiblingX = x + HORIZONTAL_SPACING;
    node.siblings.forEach((siblingId) => {
      if (!visited.has(siblingId)) {
        // Alternate positioning siblings left and right
        if (leftSiblingX < x) {
          positionNode(siblingId, leftSiblingX, y, visited);
          leftSiblingX -= HORIZONTAL_SPACING;
        } else {
          positionNode(siblingId, rightSiblingX, y, visited);
          rightSiblingX += HORIZONTAL_SPACING;
        }
      }
    });
  };

  // Start positioning from root node
  if (rootId) {
    positionNode(rootId, 0, 0);
  } else if (nodes.length > 0) {
    positionNode(nodes[0].id, 0, 0);
  }

  return positions;
};
