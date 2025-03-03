// navigation/constants.ts
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { StackNavigationOptions } from '@react-navigation/stack';

export const DEFAULT_HEADER_OPTIONS: StackNavigationOptions = {
    headerShown: false,
    headerTitleAlign: 'center',
    headerTitleStyle: {
        fontSize: 18,
        fontFamily: 'SukhumvitSet_Bd',
    },
    headerStyle: {
        backgroundColor: '#f2f2f2',
    },
};

export const MODAL_SCREEN_OPTIONS: NativeStackNavigationOptions = {
    headerShown: false,
    presentation: 'modal',
    animation: 'fade_from_bottom',
};

export const TRANSPARENT_MODAL_OPTIONS: NativeStackNavigationOptions = {
    headerShown: false,
    presentation: 'transparentModal',
    animation: 'fade',
};