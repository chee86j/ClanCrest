/**
 * familyChartDataAdapter.js
 * Utility functions to transform data between our application format and family-chart format
 */

/**
 * Convert persons and relationships data to family-chart format
 * @param {Array} persons - Array of person objects
 * @param {Array} relationships - Array of relationship objects
 * @returns {Object} Data formatted for family-chart
 */
export const toFamilyChartFormat = (persons, relationships) => {
  if (!Array.isArray(persons) || !Array.isArray(relationships)) {
    return { data: [] };
  }

  // Create a map of person IDs to family-chart nodes
  const nodesMap = new Map();
  
  // First pass: create all nodes
  persons.forEach(person => {
    nodesMap.set(person.id.toString(), {
      id: person.id.toString(),
      gender: person.gender || 'other',
      name: person.name,
      nameZh: person.nameZh || '',
      notes: person.notes || '',
      imageUrl: person.imageUrl,
      rels: {}, // Will hold relationships
      data: { ...person } // Store original data
    });
  });

  // Second pass: process relationships
  relationships.forEach(rel => {
    const fromId = rel.fromId.toString();
    const toId = rel.toId.toString();
    const fromNode = nodesMap.get(fromId);
    const toNode = nodesMap.get(toId);
    
    if (!fromNode || !toNode) return;

    // Process relationship based on type
    switch (rel.type) {
      case 'spouse':
        // Add spouse relationship (bidirectional)
        if (!fromNode.rels.spouses) fromNode.rels.spouses = [];
        if (!toNode.rels.spouses) toNode.rels.spouses = [];
        
        if (!fromNode.rels.spouses.includes(toId)) {
          fromNode.rels.spouses.push(toId);
        }
        if (!toNode.rels.spouses.includes(fromId)) {
          toNode.rels.spouses.push(fromId);
        }
        break;
        
      case 'parent':
        // Add parent relationship
        if (!fromNode.rels.children) fromNode.rels.children = [];
        if (!toNode.rels.parents) toNode.rels.parents = [];
        
        if (!fromNode.rels.children.includes(toId)) {
          fromNode.rels.children.push(toId);
        }
        if (!toNode.rels.parents.includes(fromId)) {
          toNode.rels.parents.push(fromId);
        }
        break;
        
      case 'child':
        // Add child relationship (inverse of parent)
        if (!fromNode.rels.parents) fromNode.rels.parents = [];
        if (!toNode.rels.children) toNode.rels.children = [];
        
        if (!fromNode.rels.parents.includes(toId)) {
          fromNode.rels.parents.push(toId);
        }
        if (!toNode.rels.children.includes(fromId)) {
          toNode.rels.children.push(fromId);
        }
        break;
        
      case 'sibling':
        // Add sibling relationship (bidirectional)
        if (!fromNode.rels.siblings) fromNode.rels.siblings = [];
        if (!toNode.rels.siblings) toNode.rels.siblings = [];
        
        if (!fromNode.rels.siblings.includes(toId)) {
          fromNode.rels.siblings.push(toId);
        }
        if (!toNode.rels.siblings.includes(fromId)) {
          toNode.rels.siblings.push(fromId);
        }
        break;
    }
  });

  // Convert to array format expected by family-chart
  return {
    data: Array.from(nodesMap.values())
  };
};

/**
 * Convert family-chart data back to our application format
 * @param {Object} familyChartData - Data from family-chart
 * @returns {Object} Object containing persons and relationships arrays
 */
export const fromFamilyChartFormat = (familyChartData) => {
  const persons = [];
  const relationships = [];
  const processedRelationships = new Set();
  
  if (!familyChartData || !familyChartData.data || !Array.isArray(familyChartData.data)) {
    return { persons, relationships };
  }
  
  // First pass: extract persons
  familyChartData.data.forEach(node => {
    // Extract original person data if available, otherwise create from node data
    const person = node.data || {
      id: parseInt(node.id),
      name: node.name,
      nameZh: node.nameZh,
      gender: node.gender,
      notes: node.notes,
      imageUrl: node.imageUrl
    };
    
    persons.push(person);
  });
  
  // Second pass: extract relationships
  familyChartData.data.forEach(node => {
    const fromId = parseInt(node.id);
    
    // Process spouse relationships
    if (node.rels.spouses && Array.isArray(node.rels.spouses)) {
      node.rels.spouses.forEach(spouseId => {
        const toId = parseInt(spouseId);
        // Create a unique key to prevent duplicate relationships
        const relationshipKey = [Math.min(fromId, toId), Math.max(fromId, toId), 'spouse'].join('-');
        
        if (!processedRelationships.has(relationshipKey)) {
          relationships.push({
            fromId,
            toId,
            type: 'spouse'
          });
          processedRelationships.add(relationshipKey);
        }
      });
    }
    
    // Process parent-child relationships
    if (node.rels.children && Array.isArray(node.rels.children)) {
      node.rels.children.forEach(childId => {
        const toId = parseInt(childId);
        const relationshipKey = [fromId, toId, 'parent'].join('-');
        
        if (!processedRelationships.has(relationshipKey)) {
          relationships.push({
            fromId,
            toId,
            type: 'parent'
          });
          processedRelationships.add(relationshipKey);
        }
      });
    }
    
    // Process sibling relationships
    if (node.rels.siblings && Array.isArray(node.rels.siblings)) {
      node.rels.siblings.forEach(siblingId => {
        const toId = parseInt(siblingId);
        // Create a unique key to prevent duplicate relationships
        const relationshipKey = [Math.min(fromId, toId), Math.max(fromId, toId), 'sibling'].join('-');
        
        if (!processedRelationships.has(relationshipKey)) {
          relationships.push({
            fromId,
            toId,
            type: 'sibling'
          });
          processedRelationships.add(relationshipKey);
        }
      });
    }
  });
  
  return { persons, relationships };
};

/**
 * Find the root person to use as the starting point for the family tree
 * @param {Array} persons - Array of person objects
 * @param {Array} relationships - Array of relationship objects
 * @returns {Object|null} Root person or null if not found
 */
export const findRootPerson = (persons, relationships) => {
  if (!persons || persons.length === 0) return null;
  
  // Create a map of person IDs to their parent count
  const parentCountMap = new Map();
  
  // Initialize all persons with zero parents
  persons.forEach(person => {
    parentCountMap.set(person.id.toString(), 0);
  });
  
  // Count parents for each person
  relationships.forEach(rel => {
    if (rel.type === 'parent' || rel.type === 'child') {
      const childId = rel.type === 'parent' ? rel.toId.toString() : rel.fromId.toString();
      const count = parentCountMap.get(childId) || 0;
      parentCountMap.set(childId, count + 1);
    }
  });
  
  // Find persons with no parents (root candidates)
  const rootCandidates = persons.filter(person => 
    parentCountMap.get(person.id.toString()) === 0
  );
  
  if (rootCandidates.length === 0) {
    // If no root candidates, use the first person
    return persons[0];
  }
  
  // Find the root candidate with the most children
  let bestRoot = rootCandidates[0];
  let maxChildren = 0;
  
  rootCandidates.forEach(person => {
    const childCount = relationships.filter(rel => 
      (rel.type === 'parent' && rel.fromId === person.id) || 
      (rel.type === 'child' && rel.toId === person.id)
    ).length;
    
    if (childCount > maxChildren) {
      maxChildren = childCount;
      bestRoot = person;
    }
  });
  
  return bestRoot;
}; 