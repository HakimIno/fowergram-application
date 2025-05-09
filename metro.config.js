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

// Fix for react-native-webrtc event-target-shim dependency conflicts
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    // If the bundle is resolving "event-target-shim" from a module that is part of "react-native-webrtc"
    moduleName.startsWith("event-target-shim") &&
    context.originModulePath.includes("react-native-webrtc")
  ) {
    // Resolve event-target-shim relative to the react-native-webrtc package to use v6
    // React Native requires v5 which is not compatible with react-native-webrtc
    const eventTargetShimPath = resolveFrom(
      context.originModulePath,
      moduleName
    );

    return {
      filePath: eventTargetShimPath,
      type: "sourceFile",
    };
  }

  // Ensure you call the default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
