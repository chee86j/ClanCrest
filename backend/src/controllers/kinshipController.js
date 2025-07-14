const { PrismaClient } = require("@prisma/client");
const {
  findRelationshipPath,
  mapPathToKinshipTerm,
} = require("../utils/kinshipResolver");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

/**
 * Find relationship path between two persons
 */
const findRelationship = async (req, res, next) => {
  try {
    const { fromId, toId, language = "en" } = req.body;

    // Validate required fields
    if (!fromId || !toId) {
      return res.status(400).json({
        message: "From ID and To ID are required",
      });
    }

    // Get all persons and relationships
    const persons = await prisma.person.findMany();
    const relationships = await prisma.relationship.findMany();

    // Find the path
    const path = findRelationshipPath(persons, relationships, fromId, toId);

    // Map to kinship term
    const kinship = mapPathToKinshipTerm(path, language);

    // Get person details
    const fromPerson = await prisma.person.findUnique({
      where: { id: fromId },
    });
    const toPerson = await prisma.person.findUnique({ where: { id: toId } });

    if (!fromPerson || !toPerson) {
      return res.status(404).json({ message: "One or both persons not found" });
    }

    res.status(200).json({
      path,
      kinship,
      fromPerson,
      toPerson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ask OpenAI about a kinship relationship
 */
const askKinshipQuestion = async (req, res, next) => {
  try {
    const { question } = req.body;

    // Validate required fields
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(200).json({
        answer: `This is a placeholder response for: "${question}". Configure OPENAI_API_KEY in .env to enable AI responses.`,
      });
    }

    // In a real implementation, we would call the OpenAI API here
    // For now, return a placeholder response

    // Sample implementation (commented out until OpenAI API key is configured)
    /*
    const { Configuration, OpenAIApi } = require("openai");
    
    const configuration = new Configuration({
      apiKey: openaiApiKey,
    });
    
    const openai = new OpenAIApi(configuration);
    
    // Get all persons for context
    const persons = await prisma.person.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        gender: true,
      }
    });
    
    // Get all relationships for context
    const relationships = await prisma.relationship.findMany();
    
    // Format data for the prompt
    const personsData = persons.map(p => 
      `${p.firstName} ${p.lastName} (ID: ${p.id}, Gender: ${p.gender})`
    ).join('\n');
    
    const relationshipsData = relationships.map(r => {
      const from = persons.find(p => p.id === r.fromId);
      const to = persons.find(p => p.id === r.toId);
      return `${from.firstName} ${from.lastName} is ${r.type} of ${to.firstName} ${to.lastName}`;
    }).join('\n');
    
    // Create prompt
    const prompt = `
    I have a family tree with the following people:
    ${personsData}
    
    And these relationships:
    ${relationshipsData}
    
    Based on this information, please answer the following question:
    ${question}
    `;
    
    // Call OpenAI API
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
    });
    
    const answer = response.data.choices[0].text.trim();
    */

    // Placeholder response
    const answer = `This is a placeholder response for: "${question}". Configure OPENAI_API_KEY in .env to enable AI responses.`;

    res.status(200).json({ answer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  findRelationship,
  askKinshipQuestion,
};
