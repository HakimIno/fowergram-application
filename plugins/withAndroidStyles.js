
const { withAndroidStyles, AndroidConfig } = require('@expo/config-plugins');


module.exports = function withCustomAndroidStyles(config) {
  return withAndroidStyles(config, async (config) => {
    const styles = config.modResults;

    let appThemeStyle = styles.resources.style.find(
      style => style.$.name === 'AppTheme'
    );

    if (!appThemeStyle) {
      appThemeStyle = {
        $: { name: 'AppTheme', parent: 'Theme.AppCompat.Light.NoActionBar' },
        item: []
      };
      styles.resources.style.push(appThemeStyle);
    }

    appThemeStyle.item = appThemeStyle.item || [];

    const newItems = [
      {
        $: { name: 'android:statusBarColor' },
        _: '@android:color/transparent'
      },
      {
        $: { name: 'android:navigationBarColor' },
        _: '@android:color/transparent'
      },
      {
        $: {
          name: 'android:windowLightNavigationBar',
          'tools:targetApi': '27'
        },
        _: 'true'
      },
      {
        $: { name: 'android:windowTranslucentNavigation' },
        _: 'false'
      },
      {
        $: {
          name: 'android:enforceNavigationBarContrast',
          'tools:targetApi': '29'
        },
        _: 'false'
      },
      {
        $: {
          name: 'android:windowLightStatusBar',
          'tools:targetApi': '23' // Changed to API 23 which introduced this feature
        },
        _: 'true'
      },
      {
        $: {
          name: 'android:windowDrawsSystemBarBackgrounds',
        },
        _: 'true'
      }
    ];

    const existingItemNames = new Set(newItems.map(item => item.$.name));
    appThemeStyle.item = appThemeStyle.item
      .filter(item => !existingItemNames.has(item.$.name))
      .concat(newItems);

    if (!styles.resources.$) {
      styles.resources.$ = {};
    }
    if (!styles.resources.$['xmlns:tools']) {
      styles.resources.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    return config;
  });
};