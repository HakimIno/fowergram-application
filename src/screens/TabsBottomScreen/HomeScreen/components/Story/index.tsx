import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions } from 'react-native';
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
    stories: StoryItem[];
}

// Create Story component
const CreateStoryCard = memo(() => {
    const { theme } = useTheme();
    const navigation = useNavigation<StoryNavigationProp>();
    
    const handlePress = () => {
        console.log('Create story pressed');
        // navigation.navigate('camera_screen');
    };
    
    return (
        <Pressable
            style={styles.storyCard}
            onPress={handlePress}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: 'https://avatar.iran.liara.run/public/boy?username=34' }}
                    style={styles.coverImage}
                    contentFit="cover"
                    transition={300}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                />
                <View style={styles.userInfo}>
                    <View style={styles.plusIconContainer}>
                        <Ionicons name="add" size={24} color="white" />
                    </View>
                    <Text style={styles.username} numberOfLines={1}>
                        Your Story
                    </Text>
                </View>
            </View>
        </Pressable>
    );
});

// Story card component
const StoryCard = memo(({ item, index, stories }: { item: StoryItem; index: number; stories: StoryItem[] }) => {
    const { theme } = useTheme();
    const navigation = useNavigation<StoryNavigationProp>();

    const handlePress = () => {
        console.log('Story pressed:', item.id);
        // Navigate to story screen with the story data
        navigation.navigate('story_screen', {
            stories: stories,
            initialIndex: index - 1, // Subtract 1 because the first item is CreateStory
            userId: item.id
        });
    };

    return (
        <Pressable
            style={styles.storyCard}
            onPress={handlePress}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.coverImage }}
                    style={styles.coverImage}
                    contentFit="fill"
                    transition={300}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                />
                <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                        {!item.viewed && (
                            <LinearGradient
                                colors={['#FF5C87', '#FF9F5C', '#FFDB4C']}
                                style={styles.avatarGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                        )}
                        <View style={styles.avatarInnerContainer}>
                            <Image
                                source={{ uri: item.userAvatar }}
                                style={styles.userAvatar}
                                contentFit="cover"
                            />
                        </View>
                    </View>
                    <Text style={styles.username} numberOfLines={1}>
                        {item.username}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
});


const Stories = ({ stories }: StoryProps) => {
    const { theme } = useTheme();
    
    // Prepare data with Create Story as the first item
    const storyData = useMemo(() => {
        return [{ id: 'create-story' }, ...stories];
    }, [stories]);

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        if (index === 0) {
            return <CreateStoryCard />;
        }
        return <StoryCard item={item} index={index} stories={stories} />;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <FlashList
                data={storyData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.storiesContainer}
                decelerationRate="fast"
                estimatedItemSize={50}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 0,
        marginBottom: 16,
    },
    categoryText: {
        fontSize: 15,
        fontWeight: '500',
    },
    storiesContainer: {
        paddingHorizontal: 12,
        paddingBottom: 10,
    },
    storyCard: {
        width: 110,
        height: 160,
        marginRight: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: 160,
    },
    coverImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 160,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    userInfo: {
        position: 'absolute',
        bottom: 5,
        left: 0,
        right: 0,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    plusIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#8cc63f',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    avatarContainer: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 36,
    },
    avatarGradient: {
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: 36,
    },
    avatarInnerContainer: {
        width: 36,
        height: 36,
        borderRadius: 36,
        padding: 2,
    },
    userAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
    },
    username: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Chirp_Medium',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        marginTop: 3,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonInner: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: -2,
    },
});

export default memo(Stories); 