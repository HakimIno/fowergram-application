/* Filename: ./with-transparent-navigation-bar.js */

const { AndroidConfig, withAndroidStyles } = require('@expo/config-plugins');

const withModalVisibleNavigationBarColor = (config) => {
    return withAndroidStyles(config, async (config) => {
        config.modResults = await configureModalNavigationBarColor(config.modResults);

        return config;
    });
};

async function configureModalNavigationBarColor(styles) {
    const noActionBar = styles.resources.style.find((style) => style.$.name === 'AppTheme');

    if (noActionBar) {
        noActionBar.item = noActionBar.item.filter((item) => item.$.name !== 'android:navigationBarColor');

        noActionBar.item.push(
            AndroidConfig.Resources.buildResourceItem({
                name: 'android:navigationBarColor',
                value: '@android:color/transparent',
            }),
        );
    }

    return styles;
}