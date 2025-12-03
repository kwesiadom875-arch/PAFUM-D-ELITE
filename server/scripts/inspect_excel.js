const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Parfum_D_Elite_With_Supplier_Prices.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('Sheet Names:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const rowCount = range.e.r + 1;
    console.log(`Sheet "${sheetName}" has ${rowCount} rows.`);
    
    // valid rows check
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(`Sheet "${sheetName}" has ${data.length} valid JSON rows.`);
});

// Get first 5 rows of data to see format
const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }).slice(0, 5);
console.log('First 5 rows:', JSON.stringify(data, null, 2));
