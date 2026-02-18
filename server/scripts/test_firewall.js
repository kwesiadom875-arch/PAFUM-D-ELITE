require('dotenv').config();
const aiSecurity = require('../middleware/aiSecurity');

// Mock Express objects
const mockReq = (body) => ({
    method: 'POST',
    path: '/api/reviews',
    body
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const mockNext = () => {
    console.log("✅ Request allowed (Next called)");
};

async function testFirewall() {
    console.log("🛡️ Testing AI Security Firewall...");

    // 1. Test Safe Request
    console.log("\n1. Testing Safe Request...");
    const safeReq = mockReq({ review: "This perfume smells amazing! I love the vanilla notes." });
    const safeRes = mockRes();
    await aiSecurity(safeReq, safeRes, mockNext);

    // 2. Test Malicious Request (SQL Injection)
    console.log("\n2. Testing Malicious Request (SQLi)...");
    const unsafeReq = mockReq({ review: "Nice perfume'; DROP TABLE users; --" });
    const unsafeRes = mockRes();

    // Override next to fail test if called
    const failNext = () => console.error("❌ Test Failed: Malicious request was allowed!");

    await aiSecurity(unsafeReq, unsafeRes, failNext);

    if (unsafeRes.statusCode === 403) {
        console.log("✅ Request blocked correctly.");
        console.log("Reason:", unsafeRes.data.reason);
    } else {
        // If status isn't 403 and next wasn't called (which logs error), something else happened
        if (!unsafeRes.statusCode) console.log("⚠️  Middleware finished without blocking or calling next (Check logs)");
    }
}

testFirewall();
