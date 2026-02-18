require('dotenv').config();
const axios = require('axios');

async function testEmbed() {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
        console.error("No API Key");
        return;
    }

    console.log("Testing Embedding API with Axios...");
    try {
        const payload = {
            input: ["What is the capital of France?"],
            model: "nvidia/nv-embedqa-e5-v5",
            input_type: "query",
            encoding_format: "float"
        };

        const res = await axios.post(
            'https://integrate.api.nvidia.com/v1/embeddings',
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Status:", res.status);
        console.log("Embedding length:", res.data.data[0].embedding.length);
        console.log("Success!");

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testEmbed();
