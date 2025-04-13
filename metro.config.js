// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const os = require('os');

// Polyfill for os.availableParallelism which is not available in older Node.js versions
if (!os.availableParallelism) {
  os.availableParallelism = () => Math.max(os.cpus().length - 1, 1);
}

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
