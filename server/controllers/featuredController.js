const Featured = require('../models/Featured');

exports.getFeatured = async (req, res) => {
  try {
    const featured = await Featured.findOne().sort({ _id: -1 });
    res.json(featured || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateFeatured = async (req, res) => {
  try {
    await Featured.deleteMany({}); 
    const newFeatured = new Featured(req.body);
    await newFeatured.save();
    res.json(newFeatured);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
