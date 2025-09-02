const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Configuración para mejorar la estabilidad en producción
config.resolver.platforms = ["native", "android", "ios", "web"];

// Configuración para manejar mejor los assets
config.resolver.assetExts.push("db", "mp3", "ttf", "obj", "png", "jpg");

// Configuración para transformar archivos
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
