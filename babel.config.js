module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Reanimated plugin intentionally omitted — the app uses the
    // React Native Animated API instead so it runs inside Expo Go
    // without the new-architecture runtime. Re-add
    // "react-native-reanimated/plugin" here (LAST in the list) if
    // the app is ever rebuilt against reanimated v4.
  };
};
