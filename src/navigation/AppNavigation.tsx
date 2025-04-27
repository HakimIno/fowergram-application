import { Platform, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import BottomBarTab from './BottomBarTab';
import { CameraScreen, GalleryScreen, ImageProfileScreen, LanguageScreen, LoginScreen, NotificationScreen, PreviewScreen, ProfileDetailsScreen, ProfileScreen, ThemeScreen } from 'src/screens';
import { StackNavigationOptions } from '@react-navigation/stack';
import { useAuthStore } from 'src/store/auth';
import { CreateScreen } from 'src/screens/TabsBottomScreen';
import ChatConversationScreen from 'src/screens/TabsBottomScreen/ChatScreen/ChatConversationScreen';
import CallScreen from 'src/screens/TabsBottomScreen/ChatScreen/CallScreen';
import EditScreen from 'src/screens/TabsBottomScreen/CreateScreen/EditScreen';
import StoryScreen from 'src/screens/StoryScreen';
import RegisterScreen from 'src/screens/Auth/RegisterScreen';
import RegisterBirthdayScreen from 'src/screens/Auth/RegisterBirthdayScreen';
import WelcomeScreen from 'src/screens/Auth/WelcomeScreen';
import ImageViewerModal from 'src/screens/TabsBottomScreen/ContentScreen/ImageViewerModal';

const AppStack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation = () => {
    const { isLoggedIn } = useAuthStore();

    return (
        <AppStack.Navigator screenOptions={{ headerShown: false, animation: 'ios_from_right' }}>
            {isLoggedIn ? (
                // Authenticated routes
                <AppStack.Group navigationKey='Authenticated'>
                    <AppStack.Screen
                        name="bottom_bar"
                        component={BottomBarTab}
                    />

                    <AppStack.Screen
                        name="profile_details_screen"
                        component={ProfileDetailsScreen}
                        options={{
                            headerShown: false,
                            animation: "slide_from_right"
                        }}
                    />
                    <AppStack.Screen
                        name="image_profile_screen"
                        component={ImageProfileScreen}
                        options={{
                            headerShown: false,
                            presentation: 'transparentModal',
                            animation: "fade"
                        }}
                    />
                    <AppStack.Screen
                        name="gallery_screen"
                        component={GalleryScreen}
                        options={{
                            headerShown: false,
                            presentation: 'transparentModal',
                            animation: "ios_from_right"
                        }}
                    />

                    {/* seting */}
                    <AppStack.Screen
                        name="theme_screen"
                        component={ThemeScreen}
                    />
                    <AppStack.Screen
                        name="notification_screen"
                        component={NotificationScreen}
                    />
                    <AppStack.Screen
                        name="language_screen"
                        component={LanguageScreen}
                    />
                    <AppStack.Screen
                        name="profile_screen"
                        component={ProfileScreen}
                    />
                    <AppStack.Screen
                        name="create_screen"
                        component={CreateScreen}
                        options={{
                            headerShown: false,
                            presentation: "modal",
                            animation: "fade_from_bottom"
                        }}
                    />
                    <AppStack.Screen
                        name="camera_screen"
                        component={CameraScreen}
                        options={{
                            headerShown: false,
                            presentation: "modal",
                            animation: "fade_from_bottom"
                        }}
                    />

                    <AppStack.Screen
                        name="preview_screen"
                        component={PreviewScreen}
                        options={{
                            headerShown: false,
                            presentation: "card",
                            animation: "slide_from_right"
                        }}
                    />

                    <AppStack.Screen
                        name="edit_screen"
                        component={EditScreen}
                        options={{
                            headerShown: false,
                            presentation: "card",
                            animation: "fade"
                        }}
                    />

                    <AppStack.Screen
                        name="chat_conversation"
                        component={ChatConversationScreen}
                        options={{
                            headerShown: false,
                            presentation: "card",
                            animation: "slide_from_right"
                        }}
                    />

                    <AppStack.Screen
                        name="call_screen"
                        component={CallScreen}
                        options={{
                            headerShown: false,
                            presentation: "transparentModal",
                            animation: "fade"
                        }}
                    />

                    <AppStack.Screen
                        name="story_screen"
                        component={StoryScreen}
                        options={{
                            headerShown: false,
                            presentation: "transparentModal",
                            animation: "fade"
                        }}
                    />

                    <AppStack.Screen
                        name="image_viewer_modal"
                        component={ImageViewerModal}
                        options={{
                            headerShown: false,
                            presentation: 'transparentModal',
                            animation: 'none',
                            animationDuration: 0,
                        }}
                    />
                </AppStack.Group>
            ) : (
                // Non-authenticated routes
                <AppStack.Group navigationKey='Non-Authenticated'>
                    <AppStack.Screen
                        name="welcome_screen"
                        component={WelcomeScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <AppStack.Screen
                        name="login_screen"
                        component={LoginScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <AppStack.Screen
                        name="register_screen"
                        component={RegisterScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <AppStack.Screen
                        name="register_birthday_screen"
                        component={RegisterBirthdayScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                </AppStack.Group>
            )}
        </AppStack.Navigator>
    )
}

export default AppNavigation

const styles = StyleSheet.create({})