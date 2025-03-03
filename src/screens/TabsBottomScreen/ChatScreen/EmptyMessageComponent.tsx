import React, { useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image'

const EmptyMessageComponent = ({ theme, avatar, username }: { theme: any, avatar: string, username: string }) => {


    return (
        <Animated.View
            style={[
                styles.container,
            ]}
        >

            <Image source={{ uri: avatar }} style={{
                width: 100,
                height: 100,
                borderRadius: 100,
            }} />

            <Text style={[styles.text, { color: theme.textColor   }]}>
                {username}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 10,
    },
   
    text: {
        fontSize: 18,
        marginBottom: 8,
        fontFamily: 'SukhumvitSet_Bd',
        textAlign: 'center',
    },
   
});

export default EmptyMessageComponent;