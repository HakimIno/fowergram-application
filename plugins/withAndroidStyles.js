const { withAndroidStyles } = require('@expo/config-plugins');

module.exports = function withCustomAndroidStyles(config) {
  return withAndroidStyles(config, async (config) => {
    let styles = config.modResults;

    // Find AppTheme style
    const appThemeStyle = styles.resources.style.find(
      style => style.$.name === 'AppTheme'
    );

    if (appThemeStyle) {
      // Add or update navigation bar related items
      const items = appThemeStyle.item || [];
      const newItems = [
        {
          $: {
            name: 'android:statusBarColor',
          },
          _: '@android:color/transparent',
        },
        {
          $: {
            name: 'android:navigationBarColor',
          },
          _: '@android:color/transparent',
        },
        {
          $: {
            name: 'android:windowLightNavigationBar',
            'tools:targetApi': '27',
          },
          _: 'true',
        },
        {
          $: {
            name: 'android:windowTranslucentNavigation',
          },
          _: 'true',
        },
        {
          $: {
            name: 'android:enforceNavigationBarContrast',
            'tools:targetApi': '29',
          },
          _: 'false',
        },
        {
          $: {
            name: 'android:windowBackground',
          },
          _: '@null', // ป้องกัน background color จาก theme อื่น
        },
      ];

      // Remove existing items with same names if they exist
      const existingItemNames = new Set(newItems.map(item => item.$.name));
      appThemeStyle.item = items
        .filter(item => !existingItemNames.has(item.$.name))
        .concat(newItems);
    }

    return config;
  });
};