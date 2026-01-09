const User = require('../models/User');
const Product = require('../models/Product');

const NOTE_CATEGORIES = {
    'Woody': ['oud', 'sandalwood', 'cedar', 'vetiver', 'patchouli', 'pine', 'oakmoss', 'guaiac', 'birch'],
    'Floral': ['rose', 'jasmine', 'lavender', 'neroli', 'tuberose', 'ylang', 'peony', 'lily', 'violet', 'iris'],
    'Fresh': ['bergamot', 'lemon', 'orange', 'grapefruit', 'lime', 'mint', 'watery', 'sea', 'green', 'apple'],
    'Spicy': ['pepper', 'cinnamon', 'cardamom', 'ginger', 'clove', 'nutmeg', 'saffron'],
    'Sweet': ['vanilla', 'caramel', 'tonka', 'honey', 'chocolate', 'praline', 'sugar', 'coconut'],
    'Amber': ['amber', 'musk', 'incense', 'resin', 'myrrh', 'labdanum', 'tobacco', 'leather']
};

exports.getWardrobeStats = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const orderHistory = user.orderHistory || [];
        if (orderHistory.length === 0) {
            return res.json({ stats: [], totalItems: 0 });
        }

        // Get unique product IDs from orders
        const productIds = [...new Set(orderHistory.map(item => item.productId))];

        // Fetch product details for these IDs
        const products = await Product.find({ _id: { $in: productIds } });

        const categoryCounts = {
            'Woody': 0,
            'Floral': 0,
            'Fresh': 0,
            'Spicy': 0,
            'Sweet': 0,
            'Amber': 0
        };

        products.forEach(product => {
            const notes = (product.notes || "").toLowerCase();
            const category = product.category || "";

            // Check manual category first (optional)
            // But better to check notes for more granular profile
            Object.keys(NOTE_CATEGORIES).forEach(cat => {
                const keywords = NOTE_CATEGORIES[cat];
                const matches = keywords.some(k => notes.includes(k));
                if (matches) {
                    categoryCounts[cat]++;
                }
            });
        });

        // Convert to array for frontend charts
        const stats = Object.keys(categoryCounts).map(name => ({
            name,
            value: categoryCounts[name],
            fullMark: products.length
        }));

        res.json({
            stats,
            totalItems: products.length,
            username: user.username
        });

    } catch (error) {
        console.error("Wardrobe stats error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.checkInScent = async (req, res) => {
    try {
        const { productId, productName } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.lastCheckIn = {
            productId,
            productName,
            date: new Date()
        };

        // Award points for checking in
        user.points += 5;

        await user.save();
        res.json({ message: "Scent of the Day recorded!", lastCheckIn: user.lastCheckIn, points: user.points });

    } catch (error) {
        console.error("Check-in error:", error);
        res.status(500).json({ error: error.message });
    }
};
