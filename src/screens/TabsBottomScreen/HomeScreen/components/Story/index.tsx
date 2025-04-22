import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from 'src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'src/navigation/types';

type StoryNavigationProp = StackNavigationProp<RootStackParamList>;

export interface StoryItem {
    id: string;
    title: string;
    coverImage: string;
    userAvatar: string;
    username: string;
    category?: string;
    viewed?: boolean;
    content?: {
        type: 'image' | 'video';
        url: string;
        duration?: number;
    }[];
}

interface StoryProps {
    isDarkMode: boolean;
    stories: StoryItem[];
}

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

// Create Story component - Instagram style
const CreateStoryCard = memo(() => {
    const { theme } = useTheme();
    const navigation = useNavigation<StoryNavigationProp>();

    const handlePress = useCallback(() => {
        console.log('Create story pressed');
        // navigation.navigate('camera_screen');
    }, []);

    return (
        <Pressable
            style={styles.storyItem}
            onPress={handlePress}
        >
            <View style={styles.createStoryContainer}>
                <View style={styles.createStoryIconContainer}>
                    <Ionicons name="add" size={20} color="white" />
                </View>
                <Image
                    source={{ uri: 'https://avatar.iran.liara.run/public/boy?username=34' }}
                    style={styles.storyAvatar}
                    contentFit="cover"
                    placeholder={blurhash}
                    cachePolicy="memory-disk"
                    transition={200}
                />
            </View>
            <Text
                style={[styles.storyUsername, { color: theme.textColor }]}
                numberOfLines={1}
            >
                Your Story
            </Text>
        </Pressable>
    );
});

// Story card component - Instagram style
const StoryCard = memo(({ item, index, stories, }: { item: StoryItem; index: number; stories: StoryItem[] }) => {
    const { theme } = useTheme();
    const navigation = useNavigation<StoryNavigationProp>();

    const handlePress = useCallback(() => {
        console.log('Story pressed:', item.id);
        // Navigate to story screen with the story data
        navigation.navigate('story_screen', {
            stories: stories,
            initialIndex: index - 1, // Subtract 1 because the first item is CreateStory
            userId: item.id
        });
    }, [item.id, index, stories, navigation]);

    return (
        <Pressable
            style={styles.storyItem}
            onPress={handlePress}
        >
            <View style={styles.avatarBorder}>
                {!item.viewed ? (
                    <LinearGradient
                        colors={['#FF5C87', '#4f46e5', '#9333ea']}
                        style={styles.gradientBorder}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                ) : (
                    <View style={styles.viewedBorder} />
                )}
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: item.userAvatar }}
                        style={styles.storyAvatar}
                        contentFit="cover"
                        placeholder={blurhash}
                        cachePolicy="memory-disk"
                        transition={200}
                        recyclingKey={item.id}
                    />
                </View>
            </View>
            <Text
                style={[styles.storyUsername, { color: theme.textColor }]}
                numberOfLines={1}
            >
                {item.username}
            </Text>
        </Pressable>
    );
});


const Stories = ({ stories, isDarkMode }: StoryProps) => {
    const { theme } = useTheme();

    // Prepare data with Create Story as the first item
    const storyData = useMemo(() => {
        return [{ id: 'create-story' }, ...stories];
    }, [stories]);

    const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
        if (index === 0) {
            return <CreateStoryCard />;
        }
        return <StoryCard item={item} index={index} stories={stories} />;
    }, [stories]);

    const keyExtractor = useCallback((item: any) => item.id, []);

    const gradientColors = isDarkMode
        ? ['rgba(0,0,0,0)', 'rgb(23, 1, 33)'] as const
        : ['rgba(255,255,255,1)', 'rgba(255,255,255,1)', 'rgb(255, 255, 255)'] as const;

    return (
        <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0 }}
            style={[styles.container]}
        >
            <FlashList
                data={storyData}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.storiesContainer}
                estimatedItemSize={80}
                removeClippedSubviews={true}
                overScrollMode="never"
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    storiesContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    storyItem: {
        alignItems: 'center',
        marginRight: 16,
        width: 70,
    },
    avatarBorder: {
        width: 75,
        height: 75,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    gradientBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 70,
    },
    viewedBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 34,
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 70,
        backgroundColor: 'white',
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyAvatar: {
        width: 70,
        height: 70,
        borderRadius: 70,
    },
    createStoryContainer: {
        width: 70,
        height: 70,
        borderRadius: 70,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    createStoryIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        borderWidth: 2,
        borderColor: 'white',
    },
    storyUsername: {
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
        fontFamily: 'Chirp_Regular',
        width: 75,
    },
});

export default memo(Stories); 