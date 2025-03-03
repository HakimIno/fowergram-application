import React from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ProfileHeaderProps = {
    image: string;
    username: string;
    navigation: any;
};

export const ProfileHeader = React.memo(({ image, username, navigation }: ProfileHeaderProps) => {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.infoContainer}>
                <Pressable
                    onPress={() => navigation.navigate("image_profile_screen", { image, username })}
                >
                    <Image
                        source={{ uri: image }}
                        style={styles.image}
                    />
                </Pressable>

                <View style={styles.statsContainer}>
                    <StatItem count="212" label="โพสต์" />
                    <StatItem count="123M" label="ผู้ติดตาม" />
                    <StatItem count="222" label="กำลังติดตาม" />
                </View>
            </View>

            <View style={styles.socialContainer}>
                <Text style={styles.username} numberOfLines={1}>{username}</Text>
                <Ionicons name="logo-instagram" size={22} color="black" />
                <Ionicons name="logo-facebook" size={22} color="black" />
            </View>
        </View>
    );
});

const StatItem = ({ count, label }: { count: string; label: string }) => (
    <View style={styles.statItem}>
        <Text style={styles.statCount} numberOfLines={1}>{count}</Text>
        <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    // ProfileHeader styles
    headerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statCount: {
        fontSize: 17,
        fontFamily: 'SukhumvitSet_Bd',
    },
    statLabel: {
        fontSize: 13,
        fontFamily: 'SukhumvitSet_Me',
        lineHeight: 15.6,
    },
    socialContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 10,
    },
    username: {
        fontSize: 15,
        fontFamily: 'SukhumvitSet_Bd',
    },

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

    // ProfileActions styles
    actionsContainer: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginTop: 10,
        gap: 8,
    },
    followButton: {
        flex: 1,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
        borderRadius: 14,
    },
    followButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'SukhumvitSet_Bd',
    },
    actionButton: {
        width: 48,
        paddingVertical: 7,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: "#ccc",
    },
});