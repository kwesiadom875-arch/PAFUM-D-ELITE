const { analyzeImage } = require('../services/aiHelpers');

/**
 * Handle Visual Search Request
 * Expects a base64 string or file upload (handled by middleware)
 */
exports.searchByImage = async (req, res) => {
    try {
        let imageBase64 = null;

        if (req.body.image) {
            // Direct base64 string
            imageBase64 = req.body.image.replace(/^data:image\/\w+;base64,/, "");
        } else if (req.file) {
            // File upload via multer
            imageBase64 = req.file.buffer.toString('base64');
        }

        if (!imageBase64) {
            return res.status(400).json({ error: "No image provided" });
        }

        const analysis = await analyzeImage(imageBase64);

        if (!analysis) {
            return res.status(500).json({ error: "Visual search failed" });
        }

        res.json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error("Visual Search Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
