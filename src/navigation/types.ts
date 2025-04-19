import { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
    bottom_bar: NavigatorScreenParams<BottomBarParamList>;
    theme_screen: undefined;
    notification_screen: undefined;
    language_screen: undefined;
    profile_screen: undefined;
    profile_details_screen: { image: string, username: string };
    image_profile_screen: { image: string, username: string }
    gallery_screen: { index: number, feed: any }
    story_screen: { 
        stories: any[];
        initialIndex: number;
        userId?: string;
    };
    create_screen: { editedImageUri?: string } | undefined;
    camera_screen: undefined;
    preview_screen: {
        selectedMedia: {
            uri: string;
            type: 'video' | 'image';
            width?: number;
            height?: number;
        };
    };
    edit_screen: {
        selectedMedia: {
            uri: string;
            type: 'video' | 'image';
            width?: number;
            height?: number;
        };
    };
    chat_conversation: {
        user: {
            id: string;
            name: string;
            avatar: string;
            isOnline: boolean;
        }
    };
    call_screen: {
        user: {
            id: string;
            name: string;
            avatar: string;
            isOnline: boolean;
        };
        type: 'voice' | 'video';
    };
    login_screen: undefined;
};

export type BottomBarParamList = {
    bottom_bar_home: { refresh?: number } | undefined;
    bottom_bar_search: undefined;
    bottom_bar_create: undefined;
    bottom_bar_message: undefined;
    bottom_bar_account: undefined;
    profile_details_screen: { image: string, username: string };
    create_screen: { editedImageUri?: string } | undefined;
    chat_conversation: {
        user: {
            id: string;
            name: string;
            avatar: string;
            isOnline: boolean;
        }
    };

    //Auth
    login_screen: undefined
};

export interface AnimatedIconProps {
    focused: boolean;
    icon: string;
    isDarkMode: boolean;
    size?: number;
}

export interface ThemeContextType {
    isDarkMode: boolean;
    theme: {
        backgroundColor: string;
        // ... add other theme properties as needed
    };
}
