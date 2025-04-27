import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { SvgIcon } from 'src/components/SvgIcon';
import { useTheme } from 'src/context/ThemeContext';

interface HeaderProps {
    onRefresh: () => void;
    refreshing: boolean;
    scrollY: Animated.SharedValue<number>;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, refreshing, scrollY }) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    // Header animation
    const headerAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, 50], [1, 0.9], Extrapolate.CLAMP);
        const translateY = interpolate(scrollY.value, [0, 100], [0, -10], Extrapolate.CLAMP);
        return { opacity, transform: [{ translateY }] };
    }, []);

    return (
        <Animated.View
            style={[
                styles.header,
                { paddingTop: insets.top, backgroundColor: theme.backgroundColor },
                headerAnimatedStyle,
            ]}
        >
            <View style={styles.headerContent}>
                <TouchableOpacity style={styles.searchButton}>
                    <SvgIcon
                        path="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"
                        size={24}
                        color={theme.textColor}
                        stroke={0}
                    />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textColor }]}>Discover</Text>
                <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={onRefresh}
                    disabled={refreshing}
                >
                    <SvgIcon
                        path="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        size={20}
                        color={refreshing ? theme.primary : theme.textColor}
                        stroke={0}
                    />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    searchButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Header; 