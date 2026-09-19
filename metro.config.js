const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite uses a WebAssembly binary for its web worker.
config.resolver.assetExts.push('wasm');

module.exports = config;
