import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { StatusBar, StyleSheet, Dimensions, ViewStyle, View } from 'react-native';
import { MMKVStorage } from '../util/MMKVStorage';
import Animated, {
    withTiming,
    useSharedValue,
    SharedValue,
    interpolateColor,
    useAnimatedStyle,
    withSpring,
    Easing
} from 'react-native-reanimated';

export type Theme = {
    backgroundColor: string;
    textColor: string;
    headerBackground: string;
    cardBackground: string;
    primary: string;
    secondary: string;
    textMessage: string;
}

export const lightTheme: Theme = {
    backgroundColor: '#FFFFFF',
    textColor: '#1a1a1a',
    headerBackground: '#FFFFFF',
    cardBackground: '#FFFFFF',
    primary: '#4f46e5',
    secondary: '#2563eb',
    textMessage: '#eff6ff'
};

export const darkTheme: Theme = {
    backgroundColor: '#0a0a0a',
    textColor: '#FFFFFF',
    headerBackground: '#242424',
    cardBackground: '#0a0a0a',
    primary: '#4f46e5',
    secondary: '#2563eb',
    textMessage: '#eff6ff'
};

type ThemeContextType = {
    isDarkMode: boolean;
    toggleTheme: (x: number, y: number) => void;
    theme: Theme;
    animatedValue: SharedValue<number>;
    circleSize: SharedValue<number>;
    circleX: SharedValue<number>;
    circleY: SharedValue<number>;
}

// สร้าง initial context value
const initialValue: ThemeContextType = {
    isDarkMode: false,
    toggleTheme: () => { },
    theme: lightTheme,
    animatedValue: { value: 0 } as SharedValue<number>,
    circleSize: { value: 0 } as SharedValue<number>,
    circleX: { value: 0 } as SharedValue<number>,
    circleY: { value: 0 } as SharedValue<number>
};

// สร้าง context ด้วย initial value
export const ThemeContext = createContext<ThemeContextType>(initialValue);

// สร้าง custom hook สำหรับใช้ theme
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const animatedValue = useSharedValue(0);
    const circleScale = useSharedValue(0);
    const circleX = useSharedValue(0);
    const circleY = useSharedValue(0);

    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
    // คำนวณขนาดวงกลมให้ใหญ่พอที่จะครอบคลุมหน้าจอ
    const maxSize = Math.sqrt(Math.pow(SCREEN_WIDTH, 2) + Math.pow(SCREEN_HEIGHT, 2)) * 2;

    const backgroundStyle = useAnimatedStyle(() => ({
        ...StyleSheet.absoluteFillObject,
        backgroundColor: interpolateColor(
            animatedValue.value,
            [0, 1],
            [lightTheme.backgroundColor, darkTheme.backgroundColor]
        ),
    }));

    const circleStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            width: maxSize,
            height: maxSize,
            borderRadius: maxSize / 2,
            backgroundColor: !isDarkMode ?
                lightTheme.backgroundColor :
                darkTheme.backgroundColor,
            transform: [
                { translateX: circleX.value - maxSize / 2 },
                { translateY: circleY.value - maxSize / 2 },
                { scale: circleScale.value }
            ],
            // opacity: withTiming(animatedValue.value, {
            //     duration: 300,
            //     easing: Easing.bezier(1, 1, 1, 1),
            // }),
        };
    });

    // Add useEffect to load the theme preference when component mounts
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedTheme = MMKVStorage.getItem('@theme_mode');
                if (savedTheme) {
                    const isDark = savedTheme === 'dark';
                    setIsDarkMode(isDark);
                    animatedValue.value = isDark ? 1 : 0;
                    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
                }
            } catch (error) {
                console.error('Error loading theme preference:', error);
            }
        };

        loadThemePreference();
    }, []);

    const toggleTheme = useCallback(async (x: number, y: number) => {
        try {
            const newThemeMode = !isDarkMode;

            // รั้งค่าตำแหน่งเริ่มต้น
            circleX.value = x;
            circleY.value = y;

            // เริ่ม animation วงกลมขยายออก
            circleScale.value = 0;
            circleScale.value = withTiming(1, {
                duration: 500,
                easing: Easing.bezier(0.2, 0, 0.2, 1),
            }, () => {
                // หลังจากวงกลมขยายเต็มที่ ให้ทำ animation กลับ
                circleScale.value = withTiming(0, {
                    duration: 300,
                    easing: Easing.bezier(0.2, 0, 0.2, 1),
                });
            });

            // เปลี่ยนสีพื้นหลังพร้อมกับวงกลมขยาย
            animatedValue.value = withTiming(newThemeMode ? 1 : 0, {
                duration: 500,
                easing: Easing.bezier(0.2, 0, 0.2, 1),
            });

            setIsDarkMode(newThemeMode);
            MMKVStorage.setItem('@theme_mode', newThemeMode ? 'dark' : 'light');
            StatusBar.setBarStyle(newThemeMode ? 'light-content' : 'dark-content', true);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                toggleTheme,
                theme: isDarkMode ? darkTheme : lightTheme,
                animatedValue,
                circleSize: circleScale,
                circleX,
                circleY
            }}
        >
            <View style={styles.container}>
                <Animated.View style={backgroundStyle} />
                <Animated.View
                    style={[styles.circleOverlay, circleStyle]}
                    pointerEvents="none"
                />
                <View style={styles.content}>
                    {children}
                </View>
            </View>
        </ThemeContext.Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    circleOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    content: {
        flex: 1,
        backgroundColor: 'transparent',
    }
});