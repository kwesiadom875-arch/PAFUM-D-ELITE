require('dotenv').config();
const { callAI } = require('../services/aiHelpers');

async function testCache() {
    console.log("🧠 Testing Semantic Caching...");

    const system = "You are a helpful assistant.";
    const query1 = "Tell me a short joke about perfumes.";
    const query2 = "Tell me a quick joke about fragrance."; // Semantically similar

    // 1. First Call (Miss)
    console.log("\n1. First Call (Should hit API)...");
    const start1 = Date.now();
    const res1 = await callAI(system, query1, 0.7, 50);
    const time1 = Date.now() - start1;
    console.log(`Response 1: ${res1}`);
    console.log(`Time 1: ${time1}ms`);

    // 2. Second Call (Should hit Cache)
    console.log("\n2. Second Call (Should hit Cache)...");
    const start2 = Date.now();
    const res2 = await callAI(system, query2, 0.7, 50);
    const time2 = Date.now() - start2;
    console.log(`Response 2: ${res2}`);
    console.log(`Time 2: ${time2}ms`);

    if (time2 < time1 && time2 < 1000) {
        console.log("\n✅ Cache/Semantic Search verified! (Second call was near instant)");
    } else {
        console.log("\n⚠️ Cache might not have hit. Check similarity threshold.");
    }
}

testCache();
