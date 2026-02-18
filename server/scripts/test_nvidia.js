require('dotenv').config();
const { callAI } = require('../services/aiHelpers');

async function testNvidia() {
    console.log("Testing NVIDIA NIM Integration...");
    try {
        const response = await callAI(
            "You are a helpful assistant.",
            "What is the capital of France?",
            0.7,
            100
        );
        console.log("\nResponse received:");
        console.log(response);
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testNvidia();
