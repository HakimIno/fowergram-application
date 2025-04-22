import { StyleSheet, View, Platform } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { BottomBarParamList } from './types'
import { HomeScreen, SettingScreen, ChatScreen, SearchScreen } from '../screens/TabsBottomScreen'
import { SvgIcon, SvgElement, Linecap, Linejoin } from 'src/components/SvgIcon'
import { useTheme } from 'src/context/ThemeContext'
import { BlurView } from 'expo-blur'

const BottomBar = createBottomTabNavigator<BottomBarParamList>()

const CreateNewPlaceholder = () => {
    const { theme } = useTheme()
    return <View style={{ flex: 1, backgroundColor: theme.backgroundColor }} />
}


const tabIcons = {
    home: {
        size: 33,
        filled: "M2.52 7.823C2 8.77 2 9.915 2 12.203v1.522c0 3.9 0 5.851 1.172 7.063S6.229 22 10 22h4c3.771 0 5.657 0 6.828-1.212S22 17.626 22 13.725v-1.521c0-2.289 0-3.433-.52-4.381c-.518-.949-1.467-1.537-3.364-2.715l-2-1.241C14.111 2.622 13.108 2 12 2s-2.11.622-4.116 1.867l-2 1.241C3.987 6.286 3.038 6.874 2.519 7.823M11.25 18a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-1.5 0z",
        outline: [
            {
                type: 'g' as const,
                props: {
                    children: [
                        {
                            type: 'path' as const,
                            props: {
                                d: "M2 12.204c0-2.289 0-3.433.52-4.381c.518-.949 1.467-1.537 3.364-2.715l2-1.241C9.889 2.622 10.892 2 12 2s2.11.622 4.116 1.867l2 1.241c1.897 1.178 2.846 1.766 3.365 2.715S22 9.915 22 12.203v1.522c0 3.9 0 5.851-1.172 7.063S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.212S2 17.626 2 13.725z",
                                stroke: "currentColor",
                                strokeWidth: 1.5,
                                fill: "none"
                            }
                        },
                        {
                            type: 'path' as const,
                            props: {
                                d: "M12 15v3",
                                stroke: "currentColor",
                                strokeWidth: 1.5,
                                strokeLinecap: "round" as Linecap
                            }
                        }
                    ]
                }
            }
        ] as SvgElement[]
    },
    search: {
        size: 30,
        filled: [
            {
                type: 'g' as const,
                props: {
                    children: [
                        {
                            type: 'path' as const,
                            props: {
                                d: "M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z",
                                fill: "currentColor"
                            }
                        },
                        {
                            type: 'path' as const,
                            props: {
                                d: "M10.5 7.5a3 3 0 100 6 3 3 0 000-6z",
                               fill: "currentColor"
                            }
                        }
                    ]
                }
            }
        ] as SvgElement[],
        outline: "M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
    },
    create: {
        size: 26,
        filled: "M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z",
        outline:"M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
    },
    message: {
        size: 30,
        filled: "M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z",
        outline: [
            {
                type: 'g' as const,
                props: {
                    children: [
                        {
                            type: 'path' as const,
                            props: {
                                d: "M8 12h.009m3.982 0H12m3.991 0H16",
                                stroke: "currentColor",
                                strokeWidth: 2,
                                strokeLinecap: "round" as Linecap,
                                strokeLinejoin: "round" as Linejoin
                            }
                        },
                        {
                            type: 'path' as const,
                            props: {
                                d: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12c0 1.6.376 3.112 1.043 4.453c.178.356.237.763.134 1.148l-.595 2.226a1.3 1.3 0 0 0 1.591 1.592l2.226-.596a1.63 1.63 0 0 1 1.149.133A9.96 9.96 0 0 0 12 22Z",
                                stroke: "currentColor",
                                strokeWidth: 1.5
                            }
                        }
                    ]
                }
            }
        ] as SvgElement[]
    },
    account: {
        size: 30,
        filled: "M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z",
        outline: "M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zm1.5 0a3 3 0 116 0 3 3 0 01-6 0zm-4.749 14.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
    }
}

const BottomBarTab = () => {
    const { isDarkMode, theme } = useTheme()
    const activeColor = isDarkMode ? '#FFFFFF' : '#000000'
    const inactiveColor = isDarkMode ? '#FFFFFF' : '#000000'
    const backgroundColor = isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'

    const tabBarStyle = {
        backgroundColor,
        height: 55,
        zIndex: 1,
        paddingTop: 10,
        marginBottom: Platform.OS === 'ios' ? 5 : 0,
        position: 'absolute' as const,
        borderTopWidth: 0,
    }

    const renderTabIcon = (iconKey: keyof typeof tabIcons, focused: boolean) => (
        <SvgIcon
            size={tabIcons[iconKey].size}
            color={focused ? activeColor : inactiveColor}
            path={focused ? tabIcons[iconKey].filled : tabIcons[iconKey].outline}
            stroke={0}
        />
    )

    return (
        <BottomBar.Navigator
            initialRouteName="bottom_bar_home"
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle,
                tabBarBackground: () => (
                    <BlurView
                        tint={isDarkMode ? 'dark' : 'light'}
                        intensity={100}
                        style={StyleSheet.absoluteFill}
                    />
                ),
            }}
        >
            <BottomBar.Screen
                name="bottom_bar_home"
                component={HomeScreen}
                options={{ tabBarIcon: ({ focused }) => renderTabIcon('home', focused) }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        if (navigation.isFocused()) {
                            const params = navigation.getState().routes.find(
                                route => route.name === 'bottom_bar_home'
                            )?.params;

                            const lastRefresh = (params as any)?.refresh || 0;
                            const currentTime = Date.now();

                            if (currentTime - lastRefresh > 300) {
                                navigation.setParams({ refresh: currentTime } as any);
                            }
                        } else {
                            navigation.navigate('bottom_bar_home');
                        }
                    },
                })}
            />

            <BottomBar.Screen
                name="bottom_bar_search"
                component={SearchScreen}
                options={{ tabBarIcon: ({ focused }) => renderTabIcon('search', focused) }}
            />

            <BottomBar.Screen
                name="bottom_bar_create"
                component={CreateNewPlaceholder}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{
                            borderRadius: 16,
                            padding: 8,
                            paddingHorizontal: 9,
                            backgroundColor: !isDarkMode ? 'rgb(231, 231, 231)' : 'rgba(255, 255, 255, 0.1)',
                        }}>
                            {renderTabIcon('create', focused)}
                        </View>
                    ),
                }}
                listeners={({ navigation }) => ({
                    tabPress: event => {
                        event.preventDefault()
                        navigation.navigate("create_screen")
                    }
                })}
            />

            <BottomBar.Screen
                name="bottom_bar_message"
                component={ChatScreen}
                options={{ tabBarIcon: ({ focused }) => renderTabIcon('message', focused) }}
            />

            <BottomBar.Screen
                name="bottom_bar_account"
                component={SettingScreen}
                options={{ tabBarIcon: ({ focused }) => renderTabIcon('account', focused) }}
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