const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)

// Add 3D model file support
config.resolver.assetExts.push('glb', 'gltf', 'obj', 'mtl');

module.exports = withNativeWind(config, { input: 'client/global.css' })