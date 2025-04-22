import { View, Text, StyleSheet, Pressable, Platform, ViewStyle, TextStyle, InteractionManager } from 'react-native';
import React, { useEffect, useRef, useState, useCallback, memo, useMemo } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSpring,
    withSequence,
    Easing,
    WithTimingConfig,
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';
import CommentBottomSheet, { CommentBottomSheetMethods } from '../Comment';
import ShareBottomSheet, { ShareBottomSheetMethods } from '../Share';
import LikeButtonWithFlower from './LikeButtonWithFlower';
import * as Haptics from 'expo-haptics';

// Constants - moved to object for better organization and reuse
const CONSTANTS = {
    LIKE_COUNTER_HEIGHT: Platform.select({ ios: 18, android: 20 }) ?? 18,
    ANIMATION_DURATION: Platform.select({ ios: 300, android: 200 }),
    LIKE_COLOR: '#f91980',
    BOOKMARK_COLOR: '#3533cd',
    ANIMATION_TIMEOUT: 300
} as const;

// Global state for bookmarks to persist across renders
const bookmarkedItems = new Set<string>();

// Types and Interfaces - improved typing
interface TweetActionButtonsProps {
    Comments: number;
    retweets: number;
    likes: number;
    isLiked?: boolean;
    onLikePress?: () => void;
    likeIconStyle?: Record<string, unknown>;
    uniqueId?: string;
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
    props?: Record<string, unknown>;
}

// Animation configs
const SPRING_CONFIG = {
    damping: 8,
    mass: 0.5,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
} as const;

const TIMING_CONFIG: WithTimingConfig = {
    duration: CONSTANTS.ANIMATION_DURATION,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
};

// Optimized formatNumber function - memoizing calculations
const formatNumberCache = new Map<number, string>();

const formatNumber = (num: number): string => {
    if (!num && num !== 0) return '0';

    // Check cache first
    if (formatNumberCache.has(num)) {
        return formatNumberCache.get(num)!;
    }

    let result: string;
    if (num >= 1000000) {
        result = (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    } else if (num >= 1000) {
        result = (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    } else {
        result = num.toString();
    }

    // Store in cache
    formatNumberCache.set(num, result);
    return result;
};

// Memoized Components
const ActionButton = memo<ActionButtonProps>(({ onPress, icon, color, children, size = 20, props }) => (
    <Pressable style={styles.iconButton} onPress={onPress} {...props} >
        <Ionicons name={icon as any} size={size} color={color} />
        {children}
    </Pressable>
));

ActionButton.displayName = 'ActionButton';

// Memoized Counter Component - optimized rendering
const Counter = memo(({ value, isLiked, animationStyle, textColor: propTextColor }: {
    value: number,
    isLiked: boolean,
    animationStyle: any,
    textColor: string
}) => {
    const formattedValue = useMemo(() => formatNumber(value), [value]);
    const formattedValuePlus = useMemo(() => formatNumber(isLiked ? value : value + 1), [value, isLiked]);

    const textColorValue = isLiked ? CONSTANTS.LIKE_COLOR : propTextColor;

    return (
        <View style={styles.counterContainer}>
            <Animated.View style={animationStyle}>
                <Text style={[styles.counterText, { color: textColorValue }]}>
                    {formattedValue}
                </Text>
                <Text style={[styles.counterText, { color: textColorValue }]}>
                    {formattedValuePlus}
                </Text>
                <Text style={[styles.counterText, { color: textColorValue }]}>
                    {formattedValue}
                </Text>
            </Animated.View>
        </View>
    );
});

Counter.displayName = 'Counter';

const TweetActionButtons = ({
    Comments,
    retweets,
    likes,
    isLiked,
    onLikePress,
    likeIconStyle,
    uniqueId = 'default',
}: TweetActionButtonsProps): JSX.Element => {
    const { theme } = useTheme() as ThemeContextType;
    const commentBottomSheetRef = useRef<CommentBottomSheetMethods>(null);
    const shareBottomSheetRef = useRef<ShareBottomSheetMethods>(null);

    // Use global state for bookmark status
    const initialBookmarkState = bookmarkedItems.has(uniqueId);
    const [toggleLike, setToggleLike] = useState(isLiked || false);
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarkState);

    // Animation shared values
    const translateY = useSharedValue(0);
    const bookmarkScale = useSharedValue(1);
    const bookmarkRotate = useSharedValue(0);
    const bookmarkY = useSharedValue(0);

    // Refs for optimizing updates
    const likeProcessedRef = useRef<boolean>(false);
    const lastLikeProps = useRef<{ likes: number, isLiked: boolean }>({ likes, isLiked: isLiked || false });
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Store the component ID to enable stable references
    const componentId = useRef(uniqueId).current;

    // Memoize formatted values to prevent recalculation on every render
    const formattedComments = useMemo(() => formatNumber(Comments), [Comments]);
    const formattedRetweets = useMemo(() => formatNumber(retweets), [retweets]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (interactionTimeoutRef.current) {
                clearTimeout(interactionTimeoutRef.current);
            }
        };
    }, []);

    // Update when props change but avoid unnecessary updates
    useEffect(() => {
        // Check if the props actually changed to prevent double updates
        if (lastLikeProps.current.likes !== likes || lastLikeProps.current.isLiked !== isLiked) {
            setToggleLike(isLiked || false);
            lastLikeProps.current = { likes, isLiked: isLiked || false };
            likeProcessedRef.current = false;
        }
    }, [isLiked, likes, uniqueId]);

    // Memoized animation styles
    const counterAnimationStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        height: CONSTANTS.LIKE_COUNTER_HEIGHT * 3,
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

    // Reset like processed flag
    const resetLikeProcessed = useCallback(() => {
        likeProcessedRef.current = false;
    }, []);

    // Optimized animation function
    const animateCounter = useCallback((value: number) => {
        return withTiming(value, TIMING_CONFIG, (finished?: boolean) => {
            if (finished && translateY.value === -CONSTANTS.LIKE_COUNTER_HEIGHT * 2) {
                translateY.value = withTiming(0, { duration: 0 });
            }
        });
    }, [translateY]);

    const handleLike = useCallback(() => {
        // Prevent double-firing of like handler
        if (likeProcessedRef.current) {
            return;
        }

        likeProcessedRef.current = true;

        // Trigger haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Call external handler if provided
        if (onLikePress) {
            onLikePress();
        } else {
            setToggleLike(prev => !prev);
        }

        // Animate counter
        if (translateY.value === 0) {
            translateY.value = animateCounter(-CONSTANTS.LIKE_COUNTER_HEIGHT);
        } else if (translateY.value === -CONSTANTS.LIKE_COUNTER_HEIGHT) {
            translateY.value = animateCounter(-CONSTANTS.LIKE_COUNTER_HEIGHT * 2);
        }

        // Clean up previous timeout if exists
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Reset the processed flag after animation completes
        timeoutRef.current = setTimeout(resetLikeProcessed, CONSTANTS.ANIMATION_TIMEOUT);
    }, [animateCounter, translateY, onLikePress, resetLikeProcessed]);

    const handleBookmark = useCallback(() => {
        const newBookmarkState = !isBookmarked;
        setIsBookmarked(newBookmarkState);

        // Trigger haptic feedback when bookmarking
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Update global bookmark state
        if (newBookmarkState) {
            bookmarkedItems.add(componentId);
        } else {
            bookmarkedItems.delete(componentId);
        }

        if (!isBookmarked) {
            // Animate bookmark when activating
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
            // Simpler animation when deactivating
            bookmarkScale.value = withSequence(
                withSpring(0.9, SPRING_CONFIG),
                withSpring(1, SPRING_CONFIG)
            );
        }
    }, [isBookmarked, bookmarkScale, bookmarkRotate, componentId]);

    // Use InteractionManager to defer non-critical animations and actions
    const handleBottomSheetOpen = useCallback((ref: React.RefObject<CommentBottomSheetMethods | ShareBottomSheetMethods>) => {
        // Clear any existing timeout
        if (interactionTimeoutRef.current) {
            clearTimeout(interactionTimeoutRef.current);
        }

        // Defer bottom sheet opening to ensure UI remains responsive
        interactionTimeoutRef.current = setTimeout(() => {
            InteractionManager.runAfterInteractions(() => {
                if (ref.current) {
                    ref.current.expand();
                }
            });
        }, 50);
    }, []);

    const handleCommentPress = useCallback(() => {
        handleBottomSheetOpen(commentBottomSheetRef);
    }, [handleBottomSheetOpen]);

    const handleSharePress = useCallback(() => {
        handleBottomSheetOpen(shareBottomSheetRef);
    }, [handleBottomSheetOpen]);

    const handleCommentSheetClose = useCallback(() => {
        // การจัดการเมื่อปิด BottomSheet
    }, []);

    const handleShareSheetClose = useCallback(() => {
        // Handle share sheet close if needed
    }, []);

    // Memoized components for optimal rendering
    const memoizedLikeButton = useMemo(() => (
        <LikeButtonWithFlower
            size={13}
            active={toggleLike}
            onPress={handleLike}
            inactiveColor={theme.textColor}
        />
    ), [toggleLike, handleLike, theme.textColor]);

    const memoizedCounter = useMemo(() => (
        <Counter
            value={likes}
            isLiked={toggleLike}
            animationStyle={counterAnimationStyle}
            textColor={theme.textColor}
        />
    ), [likes, toggleLike, counterAnimationStyle, theme.textColor]);

    // Memoized bookmark icon
    const bookmarkIcon = useMemo(() => (
        <Animated.View style={bookmarkAnimationStyle}>
            <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isBookmarked ? CONSTANTS.BOOKMARK_COLOR : theme.textColor}
            />
        </Animated.View>
    ), [bookmarkAnimationStyle, isBookmarked, theme.textColor]);

    // Memoize entire action row to prevent unnecessary re-renders
    const actionRow = useMemo(() => (
        <View style={styles.actionRow}>
            <View style={styles.actionItem}>
                <Pressable
                    style={styles.iconButton}
                    onPress={handleLike}
                >
                    <View style={styles.likeButtonContainer}>
                        {memoizedLikeButton}
                        {memoizedCounter}
                    </View>
                </Pressable>
            </View>

            <View style={styles.actionItem}>
                <ActionButton
                    icon="chatbubble-outline"
                    color={theme.textColor}
                    onPress={handleCommentPress}
                    size={20}
                >
                    <Text style={[styles.actionText, { color: theme.textColor }]}>
                        {formattedComments}
                    </Text>
                </ActionButton>
            </View>

            <View style={styles.actionItem}>
                <Pressable
                    onPress={handleBookmark}
                    style={styles.iconButton}
                >
                    {bookmarkIcon}
                </Pressable>
            </View>

            <View style={styles.actionItem}>
                <ActionButton
                    icon="share-social-outline"
                    color={theme.textColor}
                    onPress={handleSharePress}
                    props={{ android_ripple: { color: 'rgba(0,0,0,0.1)', borderless: true, radius: 20 } }}
                />
            </View>
        </View>
    ), [
        memoizedLikeButton,
        memoizedCounter,
        formattedComments,
        bookmarkIcon,
        theme.textColor,
        handleLike,
        handleCommentPress,
        handleBookmark,
        handleSharePress
    ]);

    // Memoize bottom sheets to prevent unnecessary re-renders
    const bottomSheets = useMemo(() => (
        <>
            <CommentBottomSheet
                ref={commentBottomSheetRef}
                handleClose={handleCommentSheetClose}
                commentsCount={Comments}
            />

            <ShareBottomSheet
                ref={shareBottomSheetRef}
                handleClose={handleShareSheetClose}
            />
        </>
    ), [Comments, handleCommentSheetClose, handleShareSheetClose]);

    return (
        <View style={styles.container}>
            {actionRow}
            {bottomSheets}
        </View>
    );
};

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
        padding: 3,
        paddingHorizontal: 6,
        gap: 6,
    } as ViewStyle,
    actionText: {
        fontSize: 13,
        fontFamily: 'Chirp_Regular'
    } as TextStyle,
    counterContainer: {
        height: CONSTANTS.LIKE_COUNTER_HEIGHT,
        overflow: 'hidden',
    } as ViewStyle,
    counterText: {
        height: CONSTANTS.LIKE_COUNTER_HEIGHT,
        fontSize: 13,
        fontFamily: 'Chirp_Regular',
        textAlign: 'center',
        textAlignVertical: 'center',
    } as TextStyle,
    likeButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
});

// Optimized equality check for memo comparison
const arePropsEqual = (prevProps: TweetActionButtonsProps, nextProps: TweetActionButtonsProps) => {
    return (
        prevProps.likes === nextProps.likes &&
        prevProps.isLiked === nextProps.isLiked &&
        prevProps.Comments === nextProps.Comments &&
        prevProps.uniqueId === nextProps.uniqueId &&
        prevProps.retweets === nextProps.retweets
    );
};

// Use memo for the entire component with optimized comparison
export default memo(TweetActionButtons, arePropsEqual);