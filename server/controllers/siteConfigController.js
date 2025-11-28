const SiteConfig = require('../models/SiteConfig');

exports.getConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const config = await SiteConfig.findOne({ key });
    if (!config) {
      return res.status(404).json({ message: 'Config not found' });
    }
    res.json(config.value);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching config', error: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const config = await SiteConfig.findOneAndUpdate(
      { key },
      { value, updatedAt: Date.now() },
      { new: true, upsert: true } // Create if not exists
    );

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error updating config', error: error.message });
  }
};
