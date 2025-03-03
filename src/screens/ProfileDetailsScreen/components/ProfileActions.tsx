import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const ProfileAction = () => {
    return (
        <View style={styles.container}>
            {/* <Pressable
                style={({ pressed }) => [
                    styles.followButton,
                    pressed && styles.buttonPressed
                ]}
            >
                <Text style={styles.followButtonText}>ติดตาม</Text>
            </Pressable> */}

            <Pressable
                style={({ pressed }) => [
                    styles.messageButton,
                    pressed && styles.buttonPressed
                ]}
            >
                <Text style={styles.messageButtonText}>ข้อความ</Text>
                <Ionicons name="send-outline" size={18} color="#1a1a1a" />
            </Pressable>

            <Pressable
                style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.buttonPressed
                ]}
            >
                <Ionicons name="person-remove" size={18} color="#1a1a1a" />
            </Pressable>

            <Pressable
                style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.buttonPressed
                ]}
            >
                <Ionicons name="caret-up" size={18} color="#1a1a1a" />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        gap: 8,
        alignItems: 'center',
    },
    followButton: {
        flex: 1,
        backgroundColor: '#000000',
        borderRadius: 14,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageButton: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#dbdbdb',
        gap: 6,
    },
    iconButton: {
        aspectRatio: 1,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#dbdbdb',
        width: 45,
        paddingVertical: 8,
    },
    followButtonText: {
        color: 'white',
        fontSize: 15,
        fontFamily: 'SukhumvitSet_Bd',
    },
    messageButtonText: {
        color: '#1a1a1a',
        fontSize: 15,
        fontFamily: 'SukhumvitSet_Bd',
    },
    buttonPressed: {
        opacity: 0.7,
    },
});

export default ProfileAction;