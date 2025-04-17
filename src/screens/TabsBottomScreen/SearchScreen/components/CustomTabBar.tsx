import React, { useCallback } from 'react';
import { SceneRendererProps, NavigationState, TabBar } from '../../../../components/TabView';
import { styles } from '../styles';
import { Route } from '../types';
import { CustomTabBarProps } from '../types';

const CustomTabBar = ({ props, isLoadingMore, refreshing, isDarkMode, theme }: CustomTabBarProps) => {
    const handleTabPress = useCallback(({ route, preventDefault }: { route: Route; preventDefault: () => void }) => {
        if (isLoadingMore || refreshing) {
            preventDefault();
        }
    }, [isLoadingMore, refreshing]);

    const backgroundColor = isDarkMode ? theme?.backgroundColor || '#1a1a1a' : 'white';
    const inactiveColor = isDarkMode ? '#d4d4d4' : '#1a1a1a';
    const activeColor = theme?.primary || '#8cc63f';

    return (
        <TabBar
            {...props}
            scrollEnabled
            style={[styles.tabBar, { backgroundColor }]}
            tabStyle={styles.tabItem}
            indicatorStyle={[styles.tabIndicator, { backgroundColor: activeColor,  }]}
            pressColor={isDarkMode ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)"}
            inactiveColor={inactiveColor}
            activeColor={activeColor}
            onTabPress={handleTabPress}
        />
    );
};

export default CustomTabBar; 