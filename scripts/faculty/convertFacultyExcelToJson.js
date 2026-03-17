const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const excelPath = path.join(process.cwd(), "faculty.xlsx");
const jsonDir = path.join(process.cwd(), "../../src", "jsons");
const jsonPath = path.join(jsonDir, "faculty.json");

if (!fs.existsSync(excelPath)) {
  console.error("Excel file not found:", excelPath);
  process.exit(1);
}

if (!fs.existsSync(jsonDir)) {
  fs.mkdirSync(jsonDir, { recursive: true });
}

const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

const output = rows
  .filter(row => {
    const name = String(row.Name || "").trim();
    const location = String(row["Office Location"] || "").trim();
    return name && location && location !== "-";
  })
  .map(row => ({
    faculty: String(row.Name).trim(),
    location: String(row["Office Location"]).trim()
  }));

fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), "utf8");

console.log("faculty.json generated");
console.log("Records:", output.length);
console.log("Path:", jsonPath);