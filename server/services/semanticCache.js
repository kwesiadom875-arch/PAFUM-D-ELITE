const { OpenAI } = require('openai');

/**
 * Semantic Cache Service
 * Stores AI responses and retrieves them based on vector similarity.
 * Uses NVIDIA NIM for generating embeddings (snowflake/arctic-embed-l).
 */

// Simple in-memory VECTOR store
// Structure: { embedding: number[], response: string, timestamp: number }
const cacheStore = [];
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
const SIMILARITY_THRESHOLD = 0.92; // High threshold for accuracy

// Initialize NVIDIA client for Embeddings
let nvidiaClient = null;
function getNvidiaEmbedClient() {
    if (!nvidiaClient) {
        if (process.env.NVIDIA_API_KEY) {
            nvidiaClient = new OpenAI({
                apiKey: process.env.NVIDIA_API_KEY,
                baseURL: 'https://integrate.api.nvidia.com/v1',
            });
        }
    }
    return nvidiaClient;
}

/**
 * Generate embedding for a text string
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
const axios = require('axios');

async function generateEmbedding(text) {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await axios.post(
            'https://integrate.api.nvidia.com/v1/embeddings',
            {
                input: [text],
                model: "nvidia/nv-embedqa-e5-v5",
                input_type: "query",
                encoding_format: "float"
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.data[0].embedding;
    } catch (error) {
        console.error("Embedding generation failed:", error.response ? error.response.data : error.message);
        return null;
    }
}

/**
 * Calculate Cosine Similarity between two vectors
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} similarity score (-1 to 1)
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Retrieve cached response if a semantic match is found
 * @param {string} query 
 * @returns {Promise<string|null>}
 */
async function getCachedResponse(query) {
    if (!query) return null;

    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) return null;

    // Find best match in cache
    let bestMatch = null;
    let highestScore = -1;

    const now = Date.now();

    for (const entry of cacheStore) {
        // Skip expired
        if (now - entry.timestamp > CACHE_TTL) continue;

        const score = cosineSimilarity(queryEmbedding, entry.embedding);
        if (score > highestScore) {
            highestScore = score;
            bestMatch = entry;
        }
    }

    if (highestScore >= SIMILARITY_THRESHOLD) {
        console.log(`⚡ Semantic Cache Hit! (Score: ${highestScore.toFixed(4)})`);
        return bestMatch.response;
    }

    return null;
}

/**
 * Store a new response in the cache
 * @param {string} query 
 * @param {string} response 
 */
async function cacheResponse(query, response) {
    if (!query || !response) return;

    const embedding = await generateEmbedding(query);
    if (embedding) {
        // Limit cache size to prevent memory issues
        if (cacheStore.length > 500) {
            cacheStore.shift(); // Remove oldest
        }

        cacheStore.push({
            embedding,
            response,
            timestamp: Date.now()
        });
        console.log("💾 Response cached semantically.");
    }
}

module.exports = {
    getCachedResponse,
    cacheResponse
};
