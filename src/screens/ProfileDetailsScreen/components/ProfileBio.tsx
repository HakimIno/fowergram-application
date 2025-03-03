// components/ProfileBio.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ProfileBioProps = {
    username: string;
    bio?: string;
};

export const ProfileBio = React.memo(({ username, bio }: ProfileBioProps) => {
    const defaultBio = `🍂🍃 ตกหลุมรักคุณทุกวัน\n🍂🍃 ตกหลุมรักคุณทุกวัน\n`;

    return (
        <View style={styles.bioContainer}>
            <Text style={styles.bioText}>
                {(bio || defaultBio).split('\n').map((line, index) => (
                    <Text key={index}>
                        {line}
                        {'\n'}
                    </Text>
                ))}
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    // ProfileBio styles
    bioContainer: {
        marginHorizontal: 20,
        marginVertical: 10,
    },
    bioText: {
        fontSize: 13,
        fontFamily: 'SukhumvitSet_Me',
        lineHeight: 15.6,
    },


});