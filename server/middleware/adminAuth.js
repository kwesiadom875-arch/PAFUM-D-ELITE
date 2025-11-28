const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    // Auto-promote Super Admin (Self-healing)
    if (user && user.email === 'agyakwesiadom@gmail.com') {
        if (!user.isAdmin || !user.isSuperAdmin) {
            user.isAdmin = true;
            user.isSuperAdmin = true;
            await user.save();
        }
    }

    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden: Admins only" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = adminAuth;
