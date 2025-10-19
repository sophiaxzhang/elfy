const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)

// Add GLB file support
config.resolver.assetExts.push('glb', 'gltf');

module.exports = withNativeWind(config, { input: 'client/global.css' })