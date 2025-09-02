#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔧 Ejecutando verificaciones pre-build...");

// Cargar variables de entorno desde .env
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const envLines = envContent.split("\n");

  envLines.forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/"/g, "");
    }
  });
}

// Variables de entorno ya no son necesarias para la versión sin autenticación
console.log(
  "ℹ️ Saltando verificación de variables de entorno (modo sin autenticación)"
);

// Verificar que existan los archivos de assets
const requiredAssets = [
  "assets/images/Icon.png",
  "assets/images/adaptive-icon.png",
  "assets/images/splash-icon.png",
  "assets/images/favicon.png",
];

const missingAssets = requiredAssets.filter((assetPath) => {
  const fullPath = path.join(__dirname, "..", assetPath);
  return !fs.existsSync(fullPath);
});

if (missingAssets.length > 0) {
  console.error("❌ Assets faltantes:", missingAssets.join(", "));
  process.exit(1);
}

console.log("✅ Todas las verificaciones pre-build pasaron correctamente");
