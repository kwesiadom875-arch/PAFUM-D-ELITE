const { callAI } = require('../services/aiHelpers');

/**
 * AI Security Middleware
 * Analyzes request body for malicious content using Llama 3.1 8B
 */
const aiSecurity = async (req, res, next) => {
    // Skip for non-POST/PUT requests or empty bodies
    if (!['POST', 'PUT', 'PATCH'].includes(req.method) || !req.body || Object.keys(req.body).length === 0) {
        return next();
    }

    // Skip for admin routes or specific trusted endpoints if necessary
    if (req.path.startsWith('/api/admin')) {
        return next();
    }

    try {
        const payload = JSON.stringify(req.body).substring(0, 1000); // Limit analysis to first 1000 chars

        const systemPrompt = `You are an AI Security Firewall. Analyze the following JSON payload for:
    1. SQL Injection (SQLi)
    2. Cross-Site Scripting (XSS)
    3. Toxicity / Hate Speech
    
    Respond with ONLY a JSON object:
    {
      "safe": boolean,
      "reason": "short explanation if unsafe"
    }`;

        // Use a fast model for middleware
        const response = await callAI(systemPrompt, payload, 0.1, 100, true);

        let analysis;
        try {
            analysis = JSON.parse(response);
        } catch (e) {
            // If JSON parse fails, assume safe to avoid blocking legitimate traffic due to AI error
            console.warn("AI Security JSON parse failed, allowing request.");
            return next();
        }

        if (!analysis.safe) {
            console.warn(`🚫 AI Firewall Blocked Request: ${analysis.reason}`);
            return res.status(403).json({
                error: "Request blocked by AI Security Firewall",
                reason: analysis.reason
            });
        }

        // Add analysis result to request object for logging if needed
        req.aiSecurity = analysis;
        next();

    } catch (error) {
        console.error("AI Security Middleware Error:", error);
        // Fail open (allow request) so security service downtime doesn't break the app
        next();
    }
};

module.exports = aiSecurity;
