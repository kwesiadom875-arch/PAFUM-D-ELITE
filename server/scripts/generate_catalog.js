const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = path.join(__dirname, '../Parfum_D_Elite_With_Supplier_Prices.xlsx');
const outputPath = path.join(__dirname, '../data/catalog.json');
const dataDir = path.dirname(outputPath);

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const rawData = XLSX.utils.sheet_to_json(sheet, { range: 2 });

const catalog = rawData.map(row => {
    let brand = row['BRAND'];
    if (brand && typeof brand === 'string') {
        brand = brand.trim();
    }

    const name = row['PRODUCT NAME '];
    
    if (!brand || !name) return null;

    if (name.toLowerCase().includes('tester')) return null;

    return {
        brand: brand,
        name: name.trim(),
        fullName: name.trim(),
        price: 0
    };
}).filter(item => item !== null);

const uniqueCatalog = [];
const seen = new Set();
catalog.forEach(item => {
    if (!seen.has(item.fullName)) {
        seen.add(item.fullName);
        uniqueCatalog.push(item);
    }
});

fs.writeFileSync(outputPath, JSON.stringify(uniqueCatalog, null, 2));
console.log(`Generated catalog with ${uniqueCatalog.length} items at ${outputPath}`);
