import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View, GestureResponderEvent } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomBarParamList } from 'src/navigation/types';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    useSharedValue,
    interpolate,
    withTiming,
    withDelay,
    runOnJS,
} from 'react-native-reanimated';
import Pinchable from 'react-native-pinchable';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from 'src/context/ThemeContext';
import TweetActionButtons from '../UI/TweetActionButtons';
import Lottie from 'lottie-react-native';
import type LottieView from 'lottie-react-native';

export type HomeNavigationProp = StackNavigationProp<BottomBarParamList, "bottom_bar_home">;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

// คำนวณขนาดที่แท้จริงของ carousel โดยหักลบ padding
const CAROUSEL_WIDTH = SCREEN_WIDTH - 16;
const CAROUSEL_HEIGHT = SCREEN_HEIGHT / 1.7;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CardProps = {
    images: string[];
    title: string;
    likes: string;
    caption: string;
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


function CardComponent({ images, title, likes, caption, navigation, cardIndex }: CardProps) {
    const { theme, isDarkMode } = useTheme();
    const [isLiked, setIsLiked] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });
    const [showHeart, setShowHeart] = useState(false);
    const [likeCount, setLikeCount] = useState(parseInt(likes) || 0);
    const flashListRef = useRef<FlashList<string>>(null);
    const lastTapRef = useRef(0);
    const tapPositionRef = useRef({ x: 0, y: 0 });
    const lottieRef = useRef<LottieView>(null);

    const scale = useSharedValue(1);
    const heartScale = useSharedValue(0);
    const heartOpacity = useSharedValue(1);
    const heartTranslateY = useSharedValue(0);

    const handleDoubleTap = useCallback((event: GestureResponderEvent) => {
        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 250;

        // เก็บตำแหน่งสัมผัสล่าสุด
        const x = event.nativeEvent.locationX;
        const y = event.nativeEvent.locationY;

        if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_PRESS_DELAY) {

            if (isLiked) {
                setIsLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));

                scale.value = withSequence(
                    withSpring(0.8, { damping: 12, stiffness: 300, mass: 0.5 }),
                    withSpring(1, { damping: 12, stiffness: 300, mass: 0.5 })
                );

                lastTapRef.current = 0;
                return;
            }

            // Set tap position and show the animation
            tapPositionRef.current = { x, y };
            setHeartPosition({ x, y });
            setShowHeart(true);

            // Update like state and count
            setIsLiked(true);
            setLikeCount(prev => prev + 1);

            // Reset and animate values
            heartScale.value = 0;
            heartOpacity.value = 1;
            heartTranslateY.value = 0;

            // Play the animation
            if (lottieRef.current) {
                lottieRef.current.play(0, 100);
            }

            // Animate the flower scale
            heartScale.value = withSequence(
                withSpring(0, { damping: 12, stiffness: 300, mass: 0.5 }),
                withSpring(1.2, { damping: 12, stiffness: 300, mass: 0.5 }),
                withSpring(1, { damping: 12, stiffness: 300, mass: 0.5 })
            );

            // Animate the flower floating up
            heartTranslateY.value = withTiming(-100, { duration: 1500 });

            // Fade out the animation and hide it when done
            heartOpacity.value = withDelay(
                1200, // Increased delay to match flower animation duration
                withTiming(0, { duration: 1000 }, () => {
                    runOnJS(setShowHeart)(false);
                })
            );

            // Button animation
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
    }, [isLiked]);

    const handleLike = useCallback(() => {
        setIsLiked(prev => {
            const newValue = !prev;
            // เพิ่มหรือลด like count ตามสถานะ
            setLikeCount(current => newValue ? current + 1 : Math.max(0, current - 1)); // ป้องกันไม่ให้ค่าติดลบ
            return newValue;
        });

        // Reset values
        scale.value = 1;

        // Simple pop animation like X
        scale.value = withSequence(
            withSpring(0.8, { damping: 12, stiffness: 300, mass: 0.5 }),
            withSpring(1.2, { damping: 12, stiffness: 300, mass: 0.5 }),
            withSpring(1, { damping: 12, stiffness: 300, mass: 0.5 })
        );
    }, []);

    // ตั้งค่าเริ่มต้นสำหรับ likeCount
    useEffect(() => {
        setLikeCount(parseInt(likes) || 0);
    }, [likes]);

    const likeIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const heartStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: heartScale.value },
                { translateY: heartTranslateY.value }
            ],
            opacity: heartOpacity.value,
        };
    });

    const renderImage = useCallback(({ item: imageUrl, index: imageIndex }: any) => {
        const imageKey = `card-${cardIndex}-image-${imageIndex}`;
        const isActive = currentIndex === imageIndex;

        return (
            <View style={styles.slideContainer} key={imageKey}>
                <Pressable
                    onPress={(event: GestureResponderEvent) => handleDoubleTap(event)}
                    style={styles.pinchableContainer}
                >
                    <Pinchable key={`pinch-${imageKey}`} style={styles.pinchableContainer} minScale={0.5} maxScale={5}>
                        <ExpoImage
                            key={imageKey}
                            source={{ uri: imageUrl }}
                            style={styles.image}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            placeholder={DEFAULT_BLURHASH}
                            transition={300}
                            recyclingKey={imageKey}
                            contentPosition="center"
                            priority={isActive ? "high" : "low"}
                        />

                        <Animated.View
                            pointerEvents="none"
                            style={[
                                styles.heartContainer,
                                heartStyle,
                                {
                                    position: 'absolute',
                                    left: 100,
                                    top: 100,
                                    width: "100%",
                                    height: "100%",
                                }
                            ]}
                        >
                            <Lottie
                                ref={lottieRef}
                                source={require('../../../../../assets/lottie/flower.json')}
                                style={styles.lottieAnimation}
                                autoPlay
                                loop={false}
                            />
                        </Animated.View>
                    </Pinchable>
                </Pressable>
            </View>
        );
    }, [cardIndex, currentIndex, handleDoubleTap, showHeart, heartPosition, heartStyle]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 90,
        minimumViewTime: 100,
        waitForInteraction: false,
    }), []);

    const renderPaginationIndicators = useCallback(() => {
        if (images.length <= 1) {
            return null;
        }

        const maxVisibleDots = 5;

        if (images.length <= maxVisibleDots) {
            return images.map((_, index) => (
                <Dot
                    key={`dot-${cardIndex}-${index}`}
                    isActive={currentIndex === index}
                    cardIndex={cardIndex}
                    index={index}
                />
            ));
        }

        const dots = [];

        dots.push(
            <Dot
                key={`dot-${cardIndex}-0`}
                isActive={currentIndex === 0}
                cardIndex={cardIndex}
                index={0}
            />
        );

        if (currentIndex > 1) {
            dots.push(
                <Ellipsis
                    key={`ellipsis-${cardIndex}-left`}
                    cardIndex={cardIndex}
                    index={-1}
                />
            );
        }

        if (currentIndex > 0 && currentIndex < images.length - 1) {
            dots.push(
                <Dot
                    key={`dot-${cardIndex}-${currentIndex - 1}`}
                    isActive={false}
                    cardIndex={cardIndex}
                    index={currentIndex - 1}
                />
            );
        }

        if (currentIndex > 0 && currentIndex < images.length - 1) {
            dots.push(
                <Dot
                    key={`dot-${cardIndex}-${currentIndex}`}
                    isActive={true}
                    cardIndex={cardIndex}
                    index={currentIndex}
                />
            );
        }

        if (currentIndex < images.length - 2) {
            dots.push(
                <Dot
                    key={`dot-${cardIndex}-${currentIndex + 1}`}
                    isActive={false}
                    cardIndex={cardIndex}
                    index={currentIndex + 1}
                />
            );
        }

        if (currentIndex < images.length - 2) {
            dots.push(
                <Ellipsis
                    key={`ellipsis-${cardIndex}-right`}
                    cardIndex={cardIndex}
                    index={-2}
                />
            );
        }

        dots.push(
            <Dot
                key={`dot-${cardIndex}-${images.length - 1}`}
                isActive={currentIndex === images.length - 1}
                cardIndex={cardIndex}
                index={images.length - 1}
            />
        );

        return dots;
    }, [currentIndex, cardIndex, images.length]);


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

    return (
        <Animated.View style={[styles.root,]}>
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
            <ContentComponent caption={caption + "#kimsnow"} theme={theme} />

            {/* Image */}
            <View style={styles.carouselContainer}>
                <FlashList
                    ref={flashListRef}
                    data={images}
                    renderItem={renderImage}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    estimatedItemSize={CAROUSEL_WIDTH}
                    getItemType={() => 'image'}
                    removeClippedSubviews={false}
                    snapToInterval={CAROUSEL_WIDTH}
                    decelerationRate="fast"
                    overScrollMode="never"
                    keyExtractor={(item, index) => `card-${cardIndex}-image-${index}`}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    drawDistance={CAROUSEL_WIDTH * images.length}
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
                likes={likeCount}
                isLiked={isLiked}
                onLikePress={handleLike}
                likeIconStyle={likeIconStyle}
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
        fontSize: 16,
        fontWeight: '600'
    },
    timestamp: {
        fontSize: 12,
        color: '#9ca3af',
    },
    contentContainer: {
        paddingHorizontal: 8,
        paddingBottom: 4,
    },
    caption: {
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
        flexDirection: 'row',
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
        borderRadius: 100,
        width: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: 3,
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
    },
    heartContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        width: 100,
        height: 100,
    },
    heartIcon: {
        fontSize: 80,
        textAlign: 'center',
        textAlignVertical: 'center',
        color: '#ff2d55',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        includeFontPadding: false,
    },
    lottieAnimation: {
        width: 100,
        height: 100,
    },
});
export default CardComponent;
