// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const os = require('os');
const resolveFrom = require('resolve-from');

// Polyfill for os.availableParallelism which is not available in older Node.js versions
if (!os.availableParallelism) {
  os.availableParallelism = () => Math.max(os.cpus().length - 1, 1);
}

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Add any custom configuration here
});

// Configure hot module reloading
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.watchFolders = [__dirname];
config.resetCache = false;
config.maxWorkers = os.availableParallelism();
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];
config.transformer.minifierConfig = {
  compress: {
    drop_console: false,
  },
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.startsWith("event-target-shim") &&
    context.originModulePath.includes("react-native-webrtc")
  ) {
    const eventTargetShimPath = resolveFrom(
      context.originModulePath,
      moduleName
    );

    return {
      filePath: eventTargetShimPath,
      type: "sourceFile",
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
