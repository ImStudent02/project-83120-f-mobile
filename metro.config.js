// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for react-native-webrtc event-target-shim conflict with Expo SDK 50+
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
