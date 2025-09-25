const { Pinecone } = require("@pinecone-database/pinecone");
const { generateEmbedding } = require("../services/ai.service");
const pc = new Pinecone({ apiKey: process.env.TINU_AI });
const index = pc.index("tinu-ai");

async function saveMemory(userId, content) {
  try {
    const embedding = await generateEmbedding(content);
    await index.upsert([
      {
        id: `${userId}-${Date.now()}`,
        values: embedding,
        metadata: {
          user_id: userId,
          text: content,
          timestamp: Date.now(),
        },
      },
    ]);
  } catch (error) {
    console.error("Error saving memory to Pinecone:", error);
  }
}

async function retrieveMemory(userId, content) {
  try {
    const embedding = await generateEmbedding(content);
    const queryResult = await index.query({
      vector: embedding,
      topK: 3,
      filter: { user_id: { $eq: userId } },
      includeMetadata: true,
    });

    let context = "";
    if (queryResult.matches.length > 0) {
      context = "Previous conversations for context:\n";
      queryResult.matches.forEach((match) => {
        context += `${match.metadata.text}\n`;
      });
    }
    return context;
  } catch (error) {
    console.error("Error retrieving memory:", error);
    return "";
  }
}

module.exports = {
  saveMemory,
  retrieveMemory,
};
