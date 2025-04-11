import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TwitterHeartButton from './TwitterHeartButton';
import AnimatedActionButton from './AnimatedActionButton';

const styles = StyleSheet.create({
    actionBar: {
        paddingVertical: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 4,
    },
    engagementInfo: {
        marginTop: 8,
        gap: 4,
    },
    likesCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    caption: {
        fontSize: 14,
        color: '#1A1A1A',
        lineHeight: 20,
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
});

interface SocialActionBarProps {
    isLiked: boolean;
    isBookmarked: boolean;
    likes: string;
    onLikeChange: (liked: boolean) => void;     // เปลี่ยนจาก onLikePress
    onBookmarkChange: (bookmarked: boolean) => void;
    username?: string;
    caption?: string;
    timestamp?: string;
}

const SocialActionBar: React.FC<SocialActionBarProps> = ({
    isLiked,
    isBookmarked,
    likes,
    onLikeChange,
    onBookmarkChange,
    username,
    caption,
    timestamp,
}) => {
    return (
        <View style={styles.actionBar}>
            <View style={styles.actionButtons}>
                <View style={styles.leftActions}>
                    <TwitterHeartButton
                        isLiked={isLiked}
                        onLikeChange={onLikeChange}
                    />
                    <AnimatedActionButton
                        iconName="chatbubble-outline"
                        size={26}
                        onPress={() => { }}
                    />
                    <AnimatedActionButton
                        iconName="paper-plane-outline"
                        size={26}
                        onPress={() => { }}
                    />
                </View>
                <AnimatedActionButton
                    iconName={isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={26}
                    onPress={() => onBookmarkChange(!isBookmarked)}
                />
            </View>
            {/* <View style={styles.engagementInfo}>
                <Text style={styles.likesCount}>
                    {likes.toLocaleString()} likes
                </Text>
                {caption && (
                    <Text style={styles.caption}>
                        <Text style={{ fontWeight: '600' }}>{username}</Text>
                        {' '}{caption}
                    </Text>
                )}
                {timestamp && (
                    <Text style={styles.timestamp}>{timestamp}</Text>
                )}
            </View> */}
        </View>
    );
};

export default SocialActionBar;