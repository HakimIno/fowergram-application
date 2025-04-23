import React from 'react';
import { ActivityIndicator, Pressable, Text, StyleSheet } from 'react-native';
import styles from '../style';

interface ButtonPosition {
    bottom: number;
    left?: number;
    right?: number;
}

interface LoginButtonProps {
    onPress: () => void;
    isLoggingIn: boolean;
    keyboardVisible?: boolean;
    position?: ButtonPosition;
}

export const LoginButton = ({
    onPress,
    isLoggingIn,
    keyboardVisible,
    position
}: LoginButtonProps) => {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.btnContainer,
                {
                    position: 'absolute',
                    ...position,
                    opacity: (isLoggingIn || pressed) ? 0.9 : 1
                }
            ]}
            onPress={onPress}
            disabled={isLoggingIn}
        >
            {!isLoggingIn ? 
                <Text style={[styles.textInfoSubTitle, { color: "white" }]}>เข้าสู่ระบบ</Text> :
                <ActivityIndicator size={30} color={"white"} />
            }
        </Pressable>
    );
}; 