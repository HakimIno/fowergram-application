import { StyleSheet, View, Platform, ToastAndroid, Alert } from 'react-native'
import React, { useRef, useCallback, useEffect } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { BottomBarParamList } from './types'
import { HomeScreen, SettingScreen, ChatScreen, SearchScreen, ContentScreen } from '../screens/TabsBottomScreen'
import { SvgIcon } from 'src/components/SvgIcon'
import { useTheme } from 'src/context/ThemeContext'
import { BlurView } from 'expo-blur'
import { useAuthStore } from 'src/store/auth'
import UserAvatar from 'src/components/UserAvatar'
import * as Haptics from 'expo-haptics'
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native'
import { tabIcons } from './tabIcons'
import { State, TapGestureHandler } from 'react-native-gesture-handler'
import { EventEmitter } from 'src/utils/EventEmitter'

const BottomBar = createBottomTabNavigator<BottomBarParamList>()

const CreateNewPlaceholder = () => {
    const { theme } = useTheme()
    return <View style={{ flex: 1, backgroundColor: theme.backgroundColor }} />
}


const BottomBarTab = () => {
    const { isDarkMode } = useTheme()
    const activeColor = isDarkMode ? '#FFFFFF' : '#000000'
    const inactiveColor = isDarkMode ? '#FFFFFF' : '#000000'
    const backgroundColor = isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
    const { userDetails, isLoggedIn } = useAuthStore();
    const navigation = useNavigation<NavigationProp<BottomBarParamList>>();
    const singleTapRef = useRef(null);
    const doubleTapRef = useRef(null);
    const lastSwitchedAccountIdRef = useRef<number | null>(null);

    // Reset the last switched account ID when the user details change
    useEffect(() => {
        if (userDetails) {
            lastSwitchedAccountIdRef.current = userDetails.id;
        }
    }, [userDetails]);

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

    const renderAccountIcon = (focused: boolean) => {
        if (isLoggedIn) {
            return (
                <UserAvatar
                    user={userDetails}
                    focused={focused}
                />
            );
        }
        return renderTabIcon('account', focused);
    };

    const handleAccountDoubleTap = useCallback(() => {
        if (!isLoggedIn || !userDetails) {
            return;
        }

        // ดึง state แบบสดใหม่จาก store
        const authStore = useAuthStore.getState();
        const { accounts, switchAccount, loadAccounts } = authStore;

        if (accounts.length <= 1) {
            return;
        }

        // รีเฟรช accounts ก่อนใช้งาน
        loadAccounts().then(() => {
            // ดึง accounts อีกครั้งหลังจาก loadAccounts เสร็จสิ้น
            const freshAccounts = useAuthStore.getState().accounts;

            if (freshAccounts.length <= 1) {
                return;
            }

            const sortedAccounts = [...freshAccounts].sort((a, b) => a.id - b.id);
            const currentUserId = lastSwitchedAccountIdRef.current || userDetails.id;

            const currentIndex = sortedAccounts.findIndex(acc => acc.id === currentUserId);

            const nextIndex = (currentIndex + 1) % sortedAccounts.length;

            const nextAccount = sortedAccounts[nextIndex];

            if (nextAccount) {

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                if (Platform.OS === 'android') {
                    ToastAndroid.show(`สลับบัญชีไปยัง ${nextAccount.username}`, ToastAndroid.SHORT);
                } else {
                    Alert.alert(
                        'สลับบัญชี',
                        `เปลี่ยนบัญชีไปยัง ${nextAccount.username}`,
                        [{ text: 'ตกลง', style: 'default' }],
                        { cancelable: true }
                    );
                }

                lastSwitchedAccountIdRef.current = nextAccount.id;

                switchAccount(nextAccount.id, () => {
                    loadAccounts().then(() => {
                        navigation.dispatch(
                            CommonActions.navigate({
                                name: 'bottom_bar',
                                params: {
                                    screen: 'bottom_bar_home',
                                    params: { refresh: Date.now() }
                                }
                            })
                        );
                    });
                }).catch(err => {
                    console.error('Error switching account:', err);
                    lastSwitchedAccountIdRef.current = userDetails.id;
                });
            }
        });
    }, [isLoggedIn, userDetails, navigation]);

    const handleSingleTap = (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            navigation.dispatch(
                CommonActions.navigate({
                    name: 'bottom_bar',
                    params: {
                        screen: 'bottom_bar_account'
                    }
                })
            );
        }
    };

    const handleDoubleTap = (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleAccountDoubleTap();
        }
    };

    return (
        <BottomBar.Navigator
            initialRouteName="bottom_bar_home"
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle,
                tabBarBackground: () => (
                    <BlurView
                        style={StyleSheet.absoluteFill}
                        intensity={70}
                        experimentalBlurMethod="dimezisBlurView"
                        tint={isDarkMode ? "dark" : "light"}
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

                            const isScrolledToTop = (params as any)?.isScrolledToTop || false;
                            const currentTime = Date.now();
                            const lastRefresh = (params as any)?.refresh || 0;

                            if (!isScrolledToTop) {
                                navigation.setParams({
                                    isScrolledToTop: true,
                                    lastScrollTime: currentTime
                                } as any);

                                EventEmitter.emit('scrollHomeToTop');
                            } else {
                                const lastScrollTime = (params as any)?.lastScrollTime || 0;

                                if (currentTime - lastScrollTime > 500) {
                                    navigation.setParams({
                                        refresh: currentTime,
                                        isScrolledToTop: false
                                    } as any);
                                }
                            }
                        } else {
                            navigation.navigate('bottom_bar_home');
                        }
                    },
                })}
            />

            {/* <BottomBar.Screen
                name="bottom_bar_content"
                component={ContentScreen}
                options={{ 
                    tabBarIcon: ({ focused }) => renderTabIcon('grid', focused) 
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('bottom_bar_content');
                    },
                })}
            /> */}

            <BottomBar.Screen
                name="bottom_bar_search"
                component={SearchScreen}
                options={{ tabBarIcon: ({ focused }) => renderTabIcon('search', focused) }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('bottom_bar_search');
                    },
                })}
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
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TapGestureHandler
                            onHandlerStateChange={handleSingleTap}
                            waitFor={doubleTapRef}
                            ref={singleTapRef}
                        >
                            <TapGestureHandler
                                ref={doubleTapRef}
                                onHandlerStateChange={handleDoubleTap}
                                numberOfTaps={2}
                            >
                                <View>
                                    {renderAccountIcon(focused)}
                                </View>
                            </TapGestureHandler>
                        </TapGestureHandler>
                    )
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('bottom_bar_account');
                    }
                })}
            />
        </BottomBar.Navigator>
    )
}

export default BottomBarTab