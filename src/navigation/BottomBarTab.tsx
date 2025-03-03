import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { BottomBarParamList } from './types'
import { HomeScreen, SettingScreen, ChatScreen, Transaction } from '../screens/TabsBottomScreen'
import { AnimatedTabBar } from '../components/TabBar/AnimatedTabBar'
import { SvgIcon } from 'src/components/SvgIcon'
import { useTheme } from 'src/context/ThemeContext'

const CreateNewPlaceholder = () => {
    const { theme } = useTheme();
    return <View style={{ flex: 1, backgroundColor: theme.backgroundColor }} />
}

const BottomBar = createBottomTabNavigator<BottomBarParamList>()

const BottomBarTab = () => {
    const { isDarkMode, toggleTheme, theme, animatedValue } = useTheme();

    return (
        <BottomBar.Navigator
            initialRouteName="bottom_bar_home"
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: isDarkMode ? theme.backgroundColor : '#FFFFFF',
                    height: 55,
                    zIndex: 1,
                    paddingTop: 10,
                    marginBottom: Platform.OS === 'ios' ? 5 : 0,
                    borderTopWidth: 0.3,
                    borderTopColor: isDarkMode ? '#404040' : '#d4d4d8',
                }
            }}
        >
            <BottomBar.Screen
                name="bottom_bar_home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <SvgIcon
                            size={33}
                            color={focused ? (isDarkMode ? '#FFFFFF' : '#1a1a1a') : (isDarkMode ? '#404040' : '#d4d4d8')}
                            path="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                            stroke={3}
                        />
                    ),
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // Always handle tab press
                        e.preventDefault();
                        if (navigation.isFocused()) {
                            // If we're already on home screen, trigger refresh
                            navigation.setParams({ refresh: Date.now() } as any);
                        } else {
                            // If we're not on home screen, navigate to it
                            navigation.navigate('bottom_bar_home');
                        }
                    },
                })}
            />

            <BottomBar.Screen
                name="bottom_bar_search"
                component={Transaction}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <SvgIcon
                            size={30}
                            color={focused ? (isDarkMode ? '#FFFFFF' : '#1a1a1a') : (isDarkMode ? '#404040' : '#d4d4d8') }
                            path="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                            stroke={1}
                        />
                    ),
                }}
            />

            <BottomBar.Screen
                name="bottom_bar_create"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{
                            borderRadius: 12,
                            padding: 6,
                            paddingHorizontal: 9,
                            backgroundColor: isDarkMode ? '#FFFFFF' : '#1a1a1a',
                            elevation: 3
                        }}>
                            <SvgIcon
                                size={26}
                                color={isDarkMode ? '#1a1a1a' : '#FFFFFF'}
                                path="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                                stroke={2}
                            />
                        </View>
                    ),
                }}
                component={CreateNewPlaceholder}
                listeners={({ navigation }) => ({
                    tabPress: event => {
                        event.preventDefault();
                        navigation.navigate("create_screen")
                    }
                })}
            />

            <BottomBar.Screen
                name="bottom_bar_message"
                component={ChatScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <SvgIcon
                            size={30}
                            color={focused ? (isDarkMode ? '#FFFFFF' : '#1a1a1a') : (isDarkMode ? '#404040' : '#d4d4d8')}
                            path="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                            stroke={0}
                        />
                    ),
                }}
            />

            <BottomBar.Screen
                name="bottom_bar_account"
                component={SettingScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <SvgIcon
                            size={30}
                            color={focused ? (isDarkMode ? '#FFFFFF' : '#1a1a1a') : (isDarkMode ? '#404040' : '#d4d4d8')}
                            path="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                            stroke={0}
                        />
                    ),
                }}
            />
        </BottomBar.Navigator>
    )
}

export default BottomBarTab

const styles = StyleSheet.create({
    icon: {
        height: 30,
        width: 30,
    }
})