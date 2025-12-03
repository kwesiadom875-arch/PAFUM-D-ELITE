const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../data/catalog.json');

let catalog = [];
try {
    const data = fs.readFileSync(catalogPath, 'utf8');
    catalog = JSON.parse(data);
} catch (err) {
    console.error("Error loading catalog:", err);
}

exports.getBrands = (req, res) => {
    try {
        const brands = [...new Set(catalog.map(item => item.brand))].sort();
        res.json(brands);
    } catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).json({ error: "Failed to fetch brands" });
    }
};

exports.getProductsByBrand = (req, res) => {
    try {
        const { brand } = req.query;
        if (!brand) {
            return res.status(400).json({ error: "Brand parameter is required" });
        }

        const products = catalog.filter(item => item.brand === brand);
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};
