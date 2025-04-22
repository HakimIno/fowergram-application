import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View, GestureResponderEvent, ActivityIndicator, Image } from 'react-native';
import { Image as ExpoImage, ImageLoadEventData, ImageProgressEventData } from 'expo-image';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomBarParamList } from 'src/navigation/types';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    useSharedValue,
    withTiming,
    withDelay,
    runOnJS,
} from 'react-native-reanimated';
import Pinchable from 'react-native-pinchable';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from 'src/context/ThemeContext';
import TweetActionButtons from '../UI/TweetActionButtons';

export type HomeNavigationProp = StackNavigationProp<BottomBarParamList, "bottom_bar_home">;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const CAROUSEL_WIDTH = SCREEN_WIDTH - 16;
const CAROUSEL_HEIGHT = SCREEN_HEIGHT / 1.7;

type CardProps = {
    images: string[];
    title: string;
    likes: string;
    caption: string;
    navigation: HomeNavigationProp;
    cardIndex: number;
    onImageLoad?: (e: ImageLoadEventData) => void;
    onImageProgress?: (e: ImageProgressEventData) => void;
    imageLoaded?: boolean;
    isVisible?: boolean;
}

const DEFAULT_BLURHASH =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

// Simple dot component with no animations - better performance
const Dot = React.memo(({ isActive }: { isActive: boolean }) => (
    <View
        style={[
            styles.paginationDot,
            isActive ? styles.paginationDotActive : styles.paginationDotInactive
        ]}
    />
));

Dot.displayName = 'Dot';

// Simple separator dot for pagination
const Separator = React.memo(() => (
    <View style={styles.paginationSeparator} />
));

Separator.displayName = 'Separator';

// Create a card key extractor to ensure unique card identifiers
const getCardKey = (cardIndex: number, title: string) => `card-${cardIndex}-${title.slice(0, 10)}`;

function CardComponent({ images, title, likes, caption, navigation, cardIndex, onImageLoad, onImageProgress, imageLoaded, isVisible }: CardProps) {
    const { theme, isDarkMode } = useTheme();
    const cardKey = useMemo(() => getCardKey(cardIndex, title), [cardIndex, title]);

    // Reset these states when card changes
    const [isLiked, setIsLiked] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [likeCount, setLikeCount] = useState(parseInt(likes) || 0);

    const flashListRef = useRef<FlashList<string>>(null);
    const lastTapRef = useRef(0);
    const tapPositionRef = useRef({ x: 0, y: 0 });
    const cardId = useRef(cardKey).current;
    const imageCache = useRef<Record<string, string>>({});
    const prefetchedImages = useRef<Set<string>>(new Set());

    // Handle like state management with a ref to avoid closure issues
    const likeStateRef = useRef({ isLiked: false, count: parseInt(likes) || 0 });

    const scale = useSharedValue(1);

    // Reset state when card index or title changes to prevent state reuse
    useEffect(() => {
        setCurrentIndex(0);
        setIsLiked(false);
        setLikeCount(parseInt(likes) || 0);
        likeStateRef.current = { isLiked: false, count: parseInt(likes) || 0 };

        // Reset image cache when card changes
        imageCache.current = {};

        // Eagerly load all images for this card immediately
        const preloadImages = () => {
            // Initialize image cache for this card
            images.forEach((url, index) => {
                const imageKey = `${cardId}-image-${index}`;
                imageCache.current[imageKey] = url;

                // Preload by creating invisible ExpoImage components
                if (!prefetchedImages.current.has(url)) {
                    prefetchedImages.current.add(url);

                    // The cachePolicy and recyclingKey help boost performance
                    ExpoImage.prefetch([url], { cachePolicy: 'memory-disk' });
                }
            });
        };

        preloadImages();
    }, [cardIndex, cardId, title, likes, images]);

    const handleDoubleTap = useCallback((event: GestureResponderEvent) => {
        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 250;

        const x = event.nativeEvent.locationX;
        const y = event.nativeEvent.locationY;

        if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_PRESS_DELAY) {
            // If already liked, don't unlike on double tap
            if (likeStateRef.current.isLiked) {
                lastTapRef.current = 0;
                return;
            }

            tapPositionRef.current = { x, y };

            // Update refs first to avoid closure issues
            likeStateRef.current.isLiked = true;
            likeStateRef.current.count += 1;

            // Then update state
            setIsLiked(true);
            setLikeCount(likeStateRef.current.count);

            scale.value = withSequence(
                withSpring(0.8, { damping: 12, stiffness: 300, mass: 0.5 }),
                withSpring(1.2, { damping: 12, stiffness: 300, mass: 0.5 }),
                withSpring(1, { damping: 12, stiffness: 300, mass: 0.5 })
            );

            lastTapRef.current = 0;
        } else {
            tapPositionRef.current = { x, y };
            lastTapRef.current = now;
        }
    }, []);

    const handleLike = useCallback(() => {
        // Update like status using refs first to avoid closure issues
        const newLikeState = !likeStateRef.current.isLiked;
        likeStateRef.current.isLiked = newLikeState;
        likeStateRef.current.count = newLikeState
            ? likeStateRef.current.count + 1
            : Math.max(0, likeStateRef.current.count - 1);

        // Update UI state after
        setIsLiked(newLikeState);
        setLikeCount(likeStateRef.current.count);

        scale.value = withSequence(
            withSpring(0.8, { damping: 12, stiffness: 300, mass: 0.5 }),
            withSpring(1.2, { damping: 12, stiffness: 300, mass: 0.5 }),
            withSpring(1, { damping: 12, stiffness: 300, mass: 0.5 })
        );
    }, []);

    const likeIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const renderImage = useCallback(({ item: imageUrl, index: imageIndex }: any) => {
        const imageKey = `${cardId}-image-${imageIndex}`;
        const correctImageUrl = imageCache.current[imageKey] || imageUrl;

        return (
            <View style={styles.slideContainer} key={imageKey}>
                <Pressable
                    onPress={(event: GestureResponderEvent) => handleDoubleTap(event)}
                    style={styles.pinchableContainer}
                >
                    <Pinchable>
                        <ExpoImage
                            source={{ uri: correctImageUrl }}
                            style={styles.image}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            placeholder={{ DEFAULT_BLURHASH }}
                            placeholderContentFit="cover"
                            recyclingKey={imageKey}
                            contentPosition="center"
                            priority={imageIndex === currentIndex ? "high" : "low"}
                        />
                    </Pinchable>
                </Pressable>
            </View>
        );
    }, [cardId, handleDoubleTap]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 10,
        waitForInteraction: false,
    }), []);

    const viewabilityConfigCallbackPairs = useMemo(() => [{
        viewabilityConfig,
        onViewableItemsChanged,
    }], [viewabilityConfig, onViewableItemsChanged]);

    // Simplified pagination component with less animation overhead
    const renderPaginationIndicators = useCallback(() => {
        if (images.length <= 1) return null;

        // Show up to 5 dots with ellipsis for the rest
        const maxVisibleDots = 5;
        
        if (images.length <= maxVisibleDots) {
            // If we have few images, just show all dots
            return (
                <View style={styles.paginationDotsContainer}>
                    {images.map((_, index) => (
                        <Dot key={`dot-${index}`} isActive={currentIndex === index} />
                    ))}
                </View>
            );
        } else {
            // For many images, show current position with some context
            const dots = [];
            
            // Always show first dot
            dots.push(<Dot key="dot-first" isActive={currentIndex === 0} />);
            
            // If not at the beginning, show separator
            if (currentIndex > 1) {
                dots.push(<Separator key="sep-left" />);
            }
            
            // Show dot before current if not at beginning
            if (currentIndex > 0) {
                dots.push(<Dot key={`dot-prev`} isActive={false} />);
            }
            
            // Current dot
            dots.push(<Dot key={`dot-current`} isActive={true} />);
            
            // Show dot after current if not at end
            if (currentIndex < images.length - 1) {
                dots.push(<Dot key={`dot-next`} isActive={false} />);
            }
            
            // If not at the end, show separator
            if (currentIndex < images.length - 2) {
                dots.push(<Separator key="sep-right" />);
            }
            
            // Always show last dot
            dots.push(<Dot key="dot-last" isActive={currentIndex === images.length - 1} />);
            
            return (
                <View style={styles.paginationDotsContainer}>
                    {dots}
                </View>
            );
        }
    }, [currentIndex, images.length]);

    const ContentComponent = ({ caption, theme }: { caption: string, theme: any }) => {
        const parts = caption.split(/(\#[a-zA-Z0-9_]+)/g);

        return (
            <View style={styles.contentContainer}>
                <Text style={[styles.caption, { color: theme.textColor }]}>
                    {parts.map((part, index) => {
                        if (part.startsWith('#')) {
                            return (
                                <Text key={index} style={styles.hashtag}>
                                    {part}{' '}
                                </Text>
                            );
                        }
                        return (
                            <Text key={index} style={{ color: theme.textColor }}>
                                {part}{' '}
                            </Text>
                        );
                    })}
                </Text>
            </View>
        );
    };

    const keyExtractor = useCallback((item: string, index: number) => {
        return `${cardId}-image-${index}`;
    }, [cardId]);

    return (
        <Animated.View style={styles.root} key={cardKey}>
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

            <ContentComponent caption={caption + "#kimsnow"} theme={theme} />

            <View style={styles.carouselContainer}>
                <FlashList
                    ref={flashListRef}
                    data={images}
                    renderItem={renderImage}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    estimatedItemSize={CAROUSEL_WIDTH}
                    snapToInterval={CAROUSEL_WIDTH}
                    decelerationRate="fast"
                    overScrollMode="never"
                    keyExtractor={keyExtractor}
                    initialScrollIndex={0}
                    onMomentumScrollEnd={(e) => {
                        const offsetX = e.nativeEvent.contentOffset.x;
                        const newIndex = Math.floor(offsetX / CAROUSEL_WIDTH);
                        setCurrentIndex(newIndex);
                    }}
                    overrideItemLayout={(layout: any, item: string, index: number) => {
                        layout.size = CAROUSEL_WIDTH;
                    }}
                />

                {images.length > 1 && (
                    <View style={styles.paginationContainer}>
                        {renderPaginationIndicators()}
                    </View>
                )}
            </View>

            <TweetActionButtons
                Comments={100}
                retweets={100}
                likes={likeCount}
                isLiked={isLiked}
                onLikePress={handleLike}
                likeIconStyle={likeIconStyle}
                uniqueId={cardId}
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
        width: '90%',
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
    },
    username: {
        fontSize: 15,
        fontFamily: "Chirp_Bold",
    },
    timestamp: {
        fontSize: 12,
        color: '#9ca3af',
        fontFamily: "Chirp_Regular",
    },
    contentContainer: {
        paddingHorizontal: 8,
        paddingBottom: 4,
    },
    caption: {
        lineHeight: 20,
        marginBottom: 8,
        fontFamily: "Chirp_Regular",
    },
    hashtag: {
        color: '#4f46e5',
        fontSize: 13,
        fontFamily: "Chirp_Regular",
    },
    carouselContainer: {
        width: CAROUSEL_WIDTH,
        height: CAROUSEL_HEIGHT,
        borderRadius: 6,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    slideContainer: {
        width: CAROUSEL_WIDTH,
        height: CAROUSEL_HEIGHT,
        borderRadius: 6,
        overflow: 'hidden',
    },
    pinchableContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: CAROUSEL_WIDTH,
        height: CAROUSEL_HEIGHT,
        borderRadius: 6,
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
        borderRadius: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingVertical: 3,
        paddingHorizontal: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paginationDotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paginationDot: {
        height: 3,
        width: 8,
        borderRadius: 1.5,
        marginHorizontal: 2,
    },
    paginationDotActive: {
        backgroundColor: 'white',
        width: 10,
    },
    paginationDotInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    paginationSeparator: {
        width: 4,
        height: 3,
        borderRadius: 1.5,
        marginHorizontal: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
});

export default React.memo(CardComponent, (prevProps, nextProps) => {
    // Only re-render if essential props change
    return (
        prevProps.cardIndex === nextProps.cardIndex &&
        prevProps.title === nextProps.title &&
        prevProps.likes === nextProps.likes
    );
});
