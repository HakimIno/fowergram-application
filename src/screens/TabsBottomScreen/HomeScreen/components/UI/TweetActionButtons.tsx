import { View, Text, StyleSheet, Pressable, Platform, ViewStyle, TextStyle, InteractionManager } from 'react-native';
import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import Lottie from 'lottie-react-native';
import type LottieView from 'lottie-react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSpring,
    withSequence,
    Easing,
    WithTimingConfig,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';
import CommentBottomSheet, { CommentBottomSheetMethods } from '../Comment';

// Constants
const LIKE_COUNTER_HEIGHT = Platform.select({ ios: 18, android: 20 }) ?? 18;
const ANIMATION_DURATION = Platform.select({ ios: 300, android: 200 });

// Types and Interfaces
interface TweetActionButtonsProps {
    Comments: number;
    retweets: number;
    likes: number;
    isLiked?: boolean;
    onLikePress?: () => void;
    likeIconStyle?: any;
}

interface Theme {
    textColor: string;
}

interface ThemeContextType {
    theme: Theme;
}

interface ActionButtonProps {
    onPress?: () => void;
    icon: string;
    color: string;
    children?: React.ReactNode;
    size?: number;
}

const SPRING_CONFIG = {
    damping: 8,
    mass: 0.5,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
} as const;

// Memoized Components
const ActionButton = memo<ActionButtonProps>(({ onPress, icon, color, children, size = 20 }) => (
    <Pressable style={styles.iconButton} onPress={onPress}>
        <Ionicons name={icon as any} size={size} color={color} />
        {children}
    </Pressable>
));

ActionButton.displayName = 'ActionButton';

const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        const value = Math.floor((num / 100000)) / 10;
        return `${value}m`;
    }
    if (num >= 1000) {
        const value = Math.floor((num / 100)) / 10;
        return `${value}k`;
    }
    return num.toString();
};

const LottieAnimation = memo(({ lottieRef, onPress }: {
    lottieRef: React.RefObject<LottieView>;
    onPress: () => void;
}) => (
    <View style={styles.lottieContainer}>
        <Lottie
            ref={lottieRef}
            source={require('../../../../../assets/lottie/like.json')}
            style={styles.lottieAnimation}
            autoPlay={false}
            loop={false}
            speed={Platform.select({ ios: 1, android: 3 })} // เพิ่ม speed บน Android
            progress={0.3}
            resizeMode="contain"
            cacheComposition={true}
            renderMode={Platform.select({
                ios: 'HARDWARE',
                android: 'HARDWARE' // บางครั้ง SOFTWARE mode อาจทำงานได้ดีกว่าบน Android
            })}
        />
        <Pressable
            onPress={onPress}
            style={styles.lottieButton}
        />
    </View>
));

LottieAnimation.displayName = 'LottieAnimation';

export default function TweetActionButtons({
    Comments,
    retweets,
    likes,
    isLiked,
    onLikePress,
    likeIconStyle,
}: TweetActionButtonsProps): JSX.Element {
    const { theme } = useTheme() as ThemeContextType;
    const lottieRef = useRef<LottieView>(null);
    const commentBottomSheetRef = useRef<CommentBottomSheetMethods>(null);
    const [toggleLike, setToggleLike] = useState(isLiked || false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const translateY = useSharedValue(0);
    const bookmarkScale = useSharedValue(1);
    const bookmarkRotate = useSharedValue(0);
    const bookmarkY = useSharedValue(0);

    const counterAnimationStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        height: LIKE_COUNTER_HEIGHT * 3,
        alignItems: 'center',
        justifyContent: 'center',
    }));

    const bookmarkAnimationStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: bookmarkScale.value },
            { translateY: bookmarkY.value },
            { rotate: `${bookmarkRotate.value}deg` }
        ],
    }));

    const animateCounter = useCallback((value: number) => {
        const config: WithTimingConfig = {
            duration: ANIMATION_DURATION,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        };

        return withTiming(value, config, (finished?: boolean) => {
            if (finished && translateY.value === -LIKE_COUNTER_HEIGHT * 2) {
                translateY.value = withTiming(0, { duration: 0 });
            }
        });
    }, [translateY]);

    useEffect(() => {
        setToggleLike(isLiked || false);
    }, [isLiked]);

    useEffect(() => {
        if (toggleLike && lottieRef.current) {
            requestAnimationFrame(() => {
                lottieRef.current?.play();
            });
        }
    }, [toggleLike]);

    const handleLike = useCallback(() => {
        if (onLikePress) {
            onLikePress();
        } else {
            setToggleLike(prev => !prev);
        }
        
        if (translateY.value === 0) {
            translateY.value = animateCounter(-LIKE_COUNTER_HEIGHT);
        } else if (translateY.value === -LIKE_COUNTER_HEIGHT) {
            translateY.value = animateCounter(-LIKE_COUNTER_HEIGHT * 2);
        }
    }, [animateCounter, translateY, onLikePress]);

    const handleBookmark = useCallback(() => {
        setIsBookmarked(prev => !prev);

        if (!isBookmarked) {
            bookmarkScale.value = withSequence(
                withTiming(0.8, {
                    duration: 150,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                }),
                withSpring(1.2, {
                    ...SPRING_CONFIG,
                    stiffness: 100,
                }),
                withSpring(1, SPRING_CONFIG)
            );

            bookmarkRotate.value = withSequence(
                withTiming(-20, {
                    duration: 150,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                }),
                withSpring(0, {
                    ...SPRING_CONFIG,
                    stiffness: 180,
                })
            );
        } else {
            bookmarkScale.value = withSequence(
                withSpring(0.9, SPRING_CONFIG),
                withSpring(1, SPRING_CONFIG)
            );
        }
    }, [isBookmarked, bookmarkScale, bookmarkRotate]);

    const handleCommentPress = useCallback(() => {
        // ใช้ InteractionManager เพื่อให้การโต้ตอบของ UI เสร็จสิ้นก่อน
        InteractionManager.runAfterInteractions(() => {
            if (commentBottomSheetRef.current) {
                commentBottomSheetRef.current.expand();
            }
        });
    }, []);

    const handleCommentSheetClose = useCallback(() => {
        // การจัดการเมื่อปิด BottomSheet
    }, []);

    const renderCounter = useCallback(() => (
        <View style={styles.counterContainer}>
            <Animated.View style={counterAnimationStyle}>
                {[likes, likes + 1, likes].map((value, index) => (
                    <Text
                        key={index}
                        style={[
                            styles.counterText,
                            { color: toggleLike ? '#f91980' : theme.textColor }
                        ]}
                    >
                        {formatNumber(value)}
                    </Text>
                ))}
            </Animated.View>
        </View>
    ), [likes, toggleLike, theme.textColor, counterAnimationStyle]);

    return (
        <View style={styles.container}>
            <View style={styles.actionRow}>


                <View style={styles.actionItem}>
                    <ActionButton
                        icon="heart-outline"
                        color={toggleLike ? 'transparent' : theme.textColor}
                        onPress={handleLike}
                        size={20}
                    >
                        {renderCounter()}
                        {toggleLike && (
                            <LottieAnimation
                                lottieRef={lottieRef}
                                onPress={handleLike}
                            />
                        )}
                    </ActionButton>
                </View>

                <View style={styles.actionItem}>
                    <ActionButton
                        icon="chatbubble-outline"
                        color={theme.textColor}
                        onPress={handleCommentPress}
                        size={20}
                    >
                        <Text style={[styles.actionText, { color: theme.textColor }]}>
                            {formatNumber(Comments)}
                        </Text>
                    </ActionButton>
                </View>

                <View style={styles.actionItem}>
                    <Pressable
                        onPress={handleBookmark}
                        style={styles.iconButton}
                    >
                        <Animated.View style={bookmarkAnimationStyle}>
                            <Ionicons
                                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                                size={20}
                                color={isBookmarked ? "#3533cd" : theme.textColor}
                            />
                        </Animated.View>
                    </Pressable>
                </View>



                <View style={styles.actionItem}>
                    <ActionButton
                        icon="share-social-outline"
                        color={theme.textColor}
                    />
                </View>
            </View>

            {/* Comment Bottom Sheet */}
            <CommentBottomSheet 
                ref={commentBottomSheetRef}
                handleClose={handleCommentSheetClose}
                commentsCount={Comments}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 4,
    } as ViewStyle,
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: 300,
        gap: 8,
    } as ViewStyle,
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    } as ViewStyle,
    actionText: {
        marginLeft: 4,
        fontSize: 13,
    } as TextStyle,
    counterContainer: {
        height: LIKE_COUNTER_HEIGHT,
        marginLeft: 4,
        overflow: 'hidden',
    } as ViewStyle,
    counterText: {
        height: LIKE_COUNTER_HEIGHT,
        fontSize: 13,
        textAlign: 'center',
        textAlignVertical: 'center',
    } as TextStyle,
    lottieContainer: {
        width: 40,
        height: 40,
        position: 'absolute',
        ...Platform.select({
            ios: {
                left: -4,
                top: -4,
            },

        })
    } as ViewStyle,
    lottieAnimation: {
        width: '100%',
        height: '100%',
        transform: [{
            scale: Platform.select({ ios: 4, android: 4 })
        }],
    } as ViewStyle,
    lottieButton: {
        position: 'absolute',
        width: '50%',
        height: '50%',
        left: '25%',
        top: '25%',
    } as ViewStyle,
});