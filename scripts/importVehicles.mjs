import fs from "fs";
import path from "path";

const csvPath = path.join(process.cwd(), "data", "vehicles.csv");
const outputPath = path.join(process.cwd(), "data", "vehicles.ts");

const csvContent = fs.readFileSync(csvPath, "utf8").trim();

const lines = csvContent.split(/\r?\n/);
const headers = lines[0].split(",").map((header) => header.trim());
const requiredHeaders = [
  "brand",
  "model",
  "version",
  "year",
  "price",
  "kilometers",
  "province",
  "city",
  "fuel",
  "transmission",
  "color",
  "score",
  "images",
];

const numericFields = ["year", "price", "kilometers", "score"];
const missingHeaders = requiredHeaders.filter(
  (header) => !headers.includes(header)
);

if (missingHeaders.length > 0) {
  console.error("Error: faltan columnas obligatorias en el CSV:");
  console.error(missingHeaders.join(", "));
  process.exit(1);
}
const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (const character of line) {
    if (character === '"') {
      insideQuotes = !insideQuotes;
    } else if (character === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current.trim());
  return values;
};

const escapeText = (value) => String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const errors = [];

const vehicles = lines.slice(1).map((line, index) => {
  const rowNumber = index + 2;
  const values = parseCsvLine(line);

  const vehicle = headers.reduce((acc, header, valueIndex) => {
    acc[header] = values[valueIndex] ?? "";
    return acc;
  }, {});

  for (const header of requiredHeaders) {
    if (!vehicle[header]?.trim()) {
      errors.push(`Fila ${rowNumber}: falta el dato "${header}"`);
    }
  }

  for (const field of numericFields) {
    if (vehicle[field] && Number.isNaN(Number(vehicle[field]))) {
      errors.push(`Fila ${rowNumber}: "${field}" debe ser un número`);
    }
  }

  return {
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version,
    year: Number(vehicle.year),
    price: Number(vehicle.price),
    kilometers: Number(vehicle.kilometers),
    province: vehicle.province,
    city: vehicle.city,
    fuel: vehicle.fuel,
    transmission: vehicle.transmission,
    color: vehicle.color,
    score: Number(vehicle.score),
    images: vehicle.images
  ? vehicle.images.split("|").map((image) => image.trim()).filter(Boolean)
  : [],
  };
});

if (errors.length > 0) {
  console.error("Error: el CSV tiene problemas y no se importó.");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
const fileContent = `import type { Vehicle } from "../types/vehicle";

export const vehicles: Vehicle[] = [
${vehicles
  .map(
    (car) => `  {
    brand: "${escapeText(car.brand)}",
    model: "${escapeText(car.model)}",
    version: "${escapeText(car.version)}",
    year: ${car.year},
    price: ${car.price},
    kilometers: ${car.kilometers},
    province: "${escapeText(car.province)}",
    city: "${escapeText(car.city)}",
    fuel: "${escapeText(car.fuel)}",
    transmission: "${escapeText(car.transmission)}",
    color: "${escapeText(car.color)}",
    score: ${car.score},
    images: ${JSON.stringify(car.images)},
  }`
  )
  .join(",\n")}
];
`;

fs.writeFileSync(outputPath, fileContent, "utf8");

console.log(`Importación completada: ${vehicles.length} vehículos cargados.`);
console.log(`Archivo actualizado: ${outputPath}`);
