import React, { useCallback, useRef, useState, useMemo } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { HomeNavigationProp } from '..';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    withDelay,
    useSharedValue,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import Pinchable from 'react-native-pinchable';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from 'src/context/ThemeContext';
import TweetActionButtons from './TweetActionButtons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CardProps = {
    images: string[];
    title: string;
    likes: string;
    navigation: HomeNavigationProp;
    onZoomStateChange?: (state: boolean) => void;
    cardIndex: number;
}

const DEFAULT_BLURHASH = "LEHV6nWB2yk8pyo0adR*.7kCMdnj";

const AnimatedDot = Animated.createAnimatedComponent(View);

type DotProps = {
    isActive: boolean;
    cardIndex: number;
    index: number;
}

const Dot = React.memo(({ isActive, cardIndex, index }: DotProps) => {
    const animatedStyle = useAnimatedStyle(() => {
        const width = withSpring(isActive ? 10 : 8, {
            mass: 1,
            damping: 15,
            stiffness: 120,
        });

        const opacity = withSpring(isActive ? 1 : 0.5, {
            mass: 1,
            damping: 15,
            stiffness: 120,
        });

        return {
            width,
            opacity,
        };
    }, [isActive]);

    return (
        <AnimatedDot
            key={`dot-${cardIndex}-${index}`}
            style={[
                styles.paginationDot,
                animatedStyle,
                isActive && styles.paginationDotActive,
            ]}
        />
    );
});

type EllipsisProps = {
    cardIndex: number;
    index: number;
}

const Ellipsis = React.memo(({ cardIndex, index }: EllipsisProps) => {
    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: 6,
            opacity: withSpring(0.7, {
                mass: 1,
                damping: 15,
                stiffness: 120,
            }),
        };
    }, []);

    return (
        <AnimatedDot
            key={`dot-${cardIndex}-${index}`}
            style={[
                styles.paginationDot,
                animatedStyle,
            ]}
        />
    );
});

function CardComponent({ images, title, likes, navigation, cardIndex }: CardProps) {
    const { theme, isDarkMode } = useTheme();
    const [isLiked, setIsLiked] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const flashListRef = useRef<FlashList<string>>(null);

    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);
    const burst = useSharedValue(0);
    const opacity = useSharedValue(0);

    const handleLike = useCallback(() => {
        setIsLiked(prev => !prev);

        // Reset values
        scale.value = 1;

        // Simple pop animation like X
        if (!isLiked) {
            scale.value = withSequence(
                withSpring(0.8, {
                    damping: 12,
                    stiffness: 300,
                    mass: 0.5
                }),
                withSpring(1.2, {
                    damping: 12,
                    stiffness: 300,
                    mass: 0.5
                }),
                withSpring(1, {
                    damping: 12,
                    stiffness: 300,
                    mass: 0.5
                })
            );
        }
    }, [isLiked]);

    const likeIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const burstStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            opacity: opacity.value,
            transform: [
                { scale: interpolate(burst.value, [0, 0.5, 1], [0, 1.5, 0]) }
            ]
        };
    });

    const renderImage = useCallback(({ item: imageUrl, index: imageIndex }: any) => {
        const imageKey = `card-${cardIndex}-image-${imageIndex}`;
        return (
            <View style={styles.slideContainer} key={imageKey}>
                <Pinchable>
                    <ExpoImage
                        key={imageKey}
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        placeholder={DEFAULT_BLURHASH}
                        transition={1000}
                        recyclingKey={imageKey}
                        contentPosition="center"
                    />
                </Pinchable>
            </View>
        );
    }, [cardIndex]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 300,
    }), []);

    const hashtags = ["SustainableStyle", "EcoChic", "Inspiration", "motivation"];

    const renderPaginationIndicators = useCallback(() => {
        return images.map((_, index) => {
            if (
                index === 0 ||
                index === images.length - 1 ||
                Math.abs(currentIndex - index) <= 1
            ) {
                return (
                    <Dot
                        key={`dot-${cardIndex}-${index}`}
                        isActive={currentIndex === index}
                        cardIndex={cardIndex}
                        index={index}
                    />
                );
            }
            if (
                (index === 1 && currentIndex > 2) ||
                (index === images.length - 2 && currentIndex < images.length - 3)
            ) {
                return (
                    <Ellipsis
                        key={`dot-${cardIndex}-${index}`}
                        cardIndex={cardIndex}
                        index={index}
                    />
                );
            }
            return null;
        });
    }, [currentIndex, cardIndex, images.length]);

    return (
        <Animated.View style={[styles.root,]}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <Pressable
                    style={styles.userContainer}
                    onPress={() => navigation.navigate("profile_details_screen", { image: images[0], username: title })}
                >
                    <View style={[styles.avatarContainer, { backgroundColor: isDarkMode ? theme.cardBackground : '#fff' }]}>
                        <ExpoImage
                            source={{ uri: images[0] }}
                            style={styles.avatar}
                            contentFit="cover"
                            transition={200}
                        />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={[styles.username, { color: theme.textColor }]} numberOfLines={1}>
                            {title}
                        </Text>
                        <Text style={styles.timestamp}>2h ago</Text>
                    </View>
                </Pressable>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <Text style={[styles.caption, { color: theme.textColor }]}>
                    In 2025, fashion embraces sustainability, bold designs, vibrant colors, futuristic textures...
                </Text>

                <View style={styles.hashtagContainer}>
                    {hashtags.map((tag, index) => (
                        <Text key={index} style={styles.hashtag}>
                            #{tag}
                        </Text>
                    ))}
                </View>
            </View>

            {/* Image */}
            <View style={styles.carouselContainer}>
                <FlashList
                    ref={flashListRef}
                    data={images}
                    renderItem={renderImage}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    estimatedItemSize={SCREEN_WIDTH}
                    getItemType={() => 'image'}
                    removeClippedSubviews={false}
                    snapToInterval={SCREEN_WIDTH}
                    decelerationRate="fast"
                    overScrollMode="never"
                    keyExtractor={(item, index) => `card-${cardIndex}-image-${index}`}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                />

                {/* Pagination Indicators */}
                {images.length > 1 && (
                    <View style={styles.paginationContainer}>
                        {renderPaginationIndicators()}
                    </View>
                )}
            </View>


            <TweetActionButtons
                Comments={100}
                retweets={100}
                likes={99999}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    root: {
        borderRadius: 8,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 0,
            },
        }),
    },
    headerContainer: {
        paddingHorizontal: 4,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        borderRadius: 20,
        padding: 2,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 100,
    },
    userInfo: {
        flexDirection: 'column',
        gap: 0,
    },
    username: {
        fontSize: 16,
        fontFamily: 'SukhumvitSet_Bd',
    },
    timestamp: {
        fontSize: 12,
        color: '#9ca3af',
        fontFamily: 'SukhumvitSet_Me',
    },
    contentContainer: {
        paddingHorizontal: 8,
        paddingBottom: 4,
    },
    caption: {
        fontSize: 14,
        fontFamily: 'LINESeedSansTH_A_ฺRg',
        lineHeight: 20,
        marginBottom: 8,
    },
    hashtagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
    },
    hashtag: {
        color: '#5271ff',
        fontSize: 13,
        fontFamily: 'LINESeedSansTH_A_ฺBd',
    },
    carouselContainer: {
        width: SCREEN_WIDTH - 16,
        height: SCREEN_HEIGHT / 1.8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    slideContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT / 1.8,
        borderRadius: 8,
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT / 1.8,
        borderRadius: 8,
    },
    paginationContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
        borderRadius: 12,
    },
    paginationDot: {
        height: 3,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 1,
    },
    paginationDotActive: {
        backgroundColor: 'white',
    },
    reactionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 4,
        justifyContent: 'space-between',
        maxWidth: 425,
    },
    reactionIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        minWidth: 50,
    },
    iconButton: {
        padding: 8,
    },
    actionIcon: {
        marginRight: 2,
    },
    reactionText: {
        fontSize: 13,
        fontFamily: 'LINESeedSansTH_A_ฺRg',
    },
});

export default CardComponent;