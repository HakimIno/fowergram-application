import React, { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MODAL_SCREEN_OPTIONS, TRANSPARENT_MODAL_OPTIONS } from './constants';
import StoryScreen from 'src/screens/StoryScreen';

const AppStack = createNativeStackNavigator<RootStackParamList>();

// Lazy load screens that aren't immediately needed
const BottomBarTab = React.lazy(() => import('./BottomBarTab'));
const ProfileDetailsScreen = React.lazy(() => import('../screens/ProfileDetailsScreen'));
const ImageProfileScreen = React.lazy(() => import('../screens/ProfileDetailsScreen/ImageProfileScreen'));
const GalleryScreen = React.lazy(() => import('../screens/ProfileDetailsScreen/GalleryScreen'));
const ThemeScreen = React.lazy(() => import('../screens/ThemeScreen'));
const NotificationScreen = React.lazy(() => import('../screens/NotificationScreen'));
const LanguageScreen = React.lazy(() => import('../screens/LanguageScreen'));
const ProfileScreen = React.lazy(() => import('../screens/ProfileScreen'));
const CreateScreen = React.lazy(() => import('../screens/TabsBottomScreen/CreateScreen'));
const CameraScreen = React.lazy(() => import('../screens/CameraScreen'));
const PreviewScreen = React.lazy(() => import('../screens/TabsBottomScreen/CreateScreen/PreviewScreen'));

const AuthenticatedStack = memo(() => (
    <>
        <AppStack.Screen name="bottom_bar" component={BottomBarTab} />

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
            options={TRANSPARENT_MODAL_OPTIONS}
        />

        <AppStack.Screen
            name="gallery_screen"
            component={GalleryScreen}
            options={{
                ...TRANSPARENT_MODAL_OPTIONS,
                animation: "slide_from_right"
            }}
        />

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
            options={MODAL_SCREEN_OPTIONS}
        />

        <AppStack.Screen
            name="camera_screen"
            component={CameraScreen}
            options={MODAL_SCREEN_OPTIONS}
        />

        <AppStack.Screen
            name="preview_screen"
            component={PreviewScreen}
        />

        <AppStack.Screen
            name="story_screen"
            component={StoryScreen}
            options={{ 
                headerShown: false,
                presentation: 'transparentModal',
            }}
        />
    </>
));

AuthenticatedStack.displayName = 'AuthenticatedStack';
export default AuthenticatedStack;