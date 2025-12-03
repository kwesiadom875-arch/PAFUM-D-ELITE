const Request = require('../models/Request');

exports.createRequest = async (req, res) => {
  try {
    const { userVibe, email, phone, brand, productName, aiRecommendation } = req.body;
    
    const newRequest = new Request({
        userId: req.user ? req.user._id : null,
        userName: req.body.name || email.split('@')[0],
        userEmail: email,
        perfumeName: productName || "Custom Request",
        description: userVibe || "No description provided",
        category: brand ? 'Standard Request' : 'Uncategorized',
        aiNotes: brand ? `Brand: ${brand}` : ''
    });

    await newRequest.save();
    res.json({ message: "Request logged. The concierge will look into it." });
  } catch (e) {
    console.error("Request Logging Error:", e);
    res.status(500).json({ error: "Could not log request." });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};
