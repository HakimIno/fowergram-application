import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, TouchableOpacity, Animated, Platform, TouchableWithoutFeedback, GestureResponderEvent } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from 'src/navigation/types';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'src/context/ThemeContext';
import { StoryItem } from 'src/screens/TabsBottomScreen/HomeScreen/components/Story';
import { PanGestureHandler, State, GestureHandlerRootView, PanGestureHandlerStateChangeEvent, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Reanimated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';

type StoryScreenRouteProp = RouteProp<RootStackParamList, 'story_screen'>;
type StoryContentItem = { type: 'image' | 'video'; url?: string; duration?: number };

const { width, height } = Dimensions.get('window');
const PROGRESS_BAR_WIDTH = width / 100 * 95;
const DEFAULT_DURATION = 5000;

// ย้าย styles มาที่นี่เพื่อแก้ไข linter errors
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    storyImage: {
        width: '100%',
        height: '100%',
    },
    storyImageContainer: {
        flex: 1,
        position: 'relative',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    topControls: {
        width: '100%',
        paddingTop: Platform.OS === 'ios' ? 10 :  20,
    },
    progressContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    progressBar: {
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: 2,
        borderRadius: 1,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: 'white',
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 15,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'white',
    },
    username: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 10,
    },
    timeLabel: {
        color: '#eee',
        fontSize: 12,
        marginLeft: 8,
        opacity: 0.8,
    },
    closeButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    touchControlsContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        flexDirection: 'row',
    },
    touchControl: {
        flex: 1,
        height: '75%',
        marginTop: Number(StatusBar.currentHeight) + 90
    },
    bottomControls: {
        width: '100%',
        paddingBottom: 10,
    },
    replyContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    replyButtonText: {
        color: 'white',
        fontWeight: '500',
        marginRight: 8,
    },
    pauseIndicatorContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 20,
    },
    pauseIndicator: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingSpinner: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 40,
        height: 40,
        marginLeft: -20,
        marginTop: -20,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: 'white',
        borderTopColor: 'transparent',
        transform: [{ rotate: '45deg' }],
    },
    // เพิ่มสไตล์เพื่อดีบัก (จะช่วยให้เห็นพื้นที่การกด)

});

// Preload images for better performance
const preloadImages = (stories: StoryItem[]) => {
    const urls: string[] = [];

    stories.forEach(story => {
        if (story) {
            if (story.coverImage) urls.push(story.coverImage);
            if (story.userAvatar) urls.push(story.userAvatar);

            if (story.content) {
                story.content.forEach((item: StoryContentItem) => {
                    if (item && item.url) urls.push(item.url);
                });
            }
        }
    });

    // Use Image.prefetch in expo-image
    return urls.filter(Boolean).map(url => Image.prefetch(url));
};

const StoryScreen = () => {
    const route = useRoute<StoryScreenRouteProp>();
    const navigation = useNavigation();
    const { theme } = useTheme();

    const { stories = [], initialIndex = 0 } = route.params || {};
    const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
    const [currentStoryItemIndex, setCurrentStoryItemIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTappedRef = useRef(false); // เก็บสถานะการกดแบบไม่ถือ
    const pausedProgressValueRef = useRef(0); // เก็บค่า progress ที่พักไว้

    const progressAnim = useRef(new Animated.Value(0)).current;
    const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);
    
    // Replace Animated with Reanimated
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);

    // ใช้ useMemo เพื่อลดการคำนวณซ้ำ
    const currentStory = useMemo(() => {
        if (!stories || stories.length === 0 || currentStoryIndex < 0 || currentStoryIndex >= stories.length) {
            return null;
        }
        return stories[currentStoryIndex];
    }, [stories, currentStoryIndex]);

    const storyContent = useMemo(() => {
        if (!currentStory) {
            return [{ type: 'image' as 'image', url: '', duration: DEFAULT_DURATION }];
        }

        if (!currentStory.content || currentStory.content.length === 0) {
            return [{
                type: 'image' as 'image',
                url: currentStory.coverImage || '',
                duration: DEFAULT_DURATION
            }];
        }

        return currentStory.content;
    }, [currentStory]);

    const currentContent = useMemo(() => {
        if (!storyContent || storyContent.length === 0 ||
            currentStoryItemIndex < 0 || currentStoryItemIndex >= storyContent.length) {
            return { type: 'image' as 'image', url: '', duration: DEFAULT_DURATION };
        }
        return storyContent[currentStoryItemIndex];
    }, [storyContent, currentStoryItemIndex]);

    // อัพเดท progress value เมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        const progressListener = progressAnim.addListener(({ value }) => {
            pausedProgressValueRef.current = value;
        });

        return () => {
            progressAnim.removeListener(progressListener);
        };
    }, [progressAnim]);

    // Navigation actions
    const handleNext = useCallback(() => {
        // ล้าง animation ปัจจุบัน
        if (progressAnimation.current) {
            progressAnimation.current.stop();
        }

        if (!storyContent) return;

        if (currentStoryItemIndex < storyContent.length - 1) {
            // Move to next content item in current story
            setCurrentStoryItemIndex(prev => prev + 1);
        } else if (stories && currentStoryIndex < stories.length - 1) {
            // Move to next story
            setCurrentStoryIndex(prev => prev + 1);
            setCurrentStoryItemIndex(0);
        } else {
            // End of all stories, go back
            navigation.goBack();
        }

        // รีเซ็ตค่า progress
        pausedProgressValueRef.current = 0;
    }, [currentStoryIndex, currentStoryItemIndex, storyContent, stories, navigation]);

    const handlePrevious = useCallback(() => {
        // ล้าง animation ปัจจุบัน
        if (progressAnimation.current) {
            progressAnimation.current.stop();
        }

        if (currentStoryItemIndex > 0) {
            // Move to previous content item in current story
            setCurrentStoryItemIndex(prev => prev - 1);
        } else if (currentStoryIndex > 0 && stories) {
            // Move to previous story
            const prevStoryIndex = currentStoryIndex - 1;
            const prevStory = stories[prevStoryIndex];

            setCurrentStoryIndex(prevStoryIndex);

            if (prevStory && prevStory.content && prevStory.content.length > 0) {
                setCurrentStoryItemIndex(prevStory.content.length - 1);
            } else {
                setCurrentStoryItemIndex(0);
            }
        }

        // รีเซ็ตค่า progress
        pausedProgressValueRef.current = 0;
    }, [currentStoryIndex, currentStoryItemIndex, stories]);

    // Handle story progression based on content type and duration
    const startProgress = useCallback((fromBeginning = false) => {
        if (!currentContent) return;

        const duration = currentContent.duration || DEFAULT_DURATION;

        // ล้าง animation เดิม
        if (progressAnimation.current) {
            progressAnimation.current.stop();
        }

        // ใช้ค่าที่เก็บไว้ใน ref หรือเริ่มใหม่หากต้องการ
        const currentProgress = fromBeginning ? 0 : pausedProgressValueRef.current;
        const remainingDuration = duration * (1 - currentProgress);

        if (fromBeginning) {
            progressAnim.setValue(0);
            pausedProgressValueRef.current = 0;
        } else {
            // ถ้าไม่ต้องเริ่มใหม่ ให้อัพเดท Animation ด้วยค่าปัจจุบัน
            progressAnim.setValue(currentProgress);
        }

        // สร้าง animation ใหม่
        progressAnimation.current = Animated.timing(progressAnim, {
            toValue: 1,
            duration: remainingDuration,
            useNativeDriver: false,
        });

        if (!isPaused) {
            progressAnimation.current.start(({ finished }) => {
                if (finished) {
                    pausedProgressValueRef.current = 0;
                    handleNext();
                }
            });
        }
    }, [currentContent, progressAnim, isPaused, handleNext]);

    // Preload next story images
    useEffect(() => {
        if (!stories || stories.length === 0) return;

        // ดึงข้อมูลรูปภาพของสตอรี่ถัดไปเพื่อโหลดล่วงหน้า
        const preloadNextStories = async () => {
            const nextStoryIndex = currentStoryIndex + 1;
            if (nextStoryIndex < stories.length) {
                const nextStory = stories[nextStoryIndex];
                if (nextStory) {
                    const urls = [];
                    if (nextStory.coverImage) urls.push(nextStory.coverImage);

                    if (nextStory.content) {
                        nextStory.content.forEach((item: StoryContentItem) => {
                            if (item && item.url) urls.push(item.url);
                        });
                    }

                    await Promise.all(urls.map(url => url && Image.prefetch(url)));
                }
            }
        };

        preloadNextStories();
    }, [currentStoryIndex, stories]);

    const handleClose = useCallback(() => {
        if (progressAnimation.current) {
            progressAnimation.current.stop();
        }
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
        }
        navigation.goBack();
    }, [navigation]);

    // Handle play/pause to work with Reanimated
    const handlePlayPause = useCallback((shouldPause: boolean) => {
        setIsPaused(shouldPause);

        if (shouldPause) {
            // Pause - หยุด animation
            if (progressAnimation.current) {
                progressAnimation.current.stop();
            }
        } else {
            // Resume - เล่นต่อจากค่าที่บันทึกไว้
            startProgress(false);
        }
    }, [startProgress]);

    // ส่วนของการจัดการการกดควบคุมต่างๆ (สไตล์ Instagram)

    // แตะฝั่งซ้ายเพื่อไปรูปก่อนหน้า
    const handleLeftPress = useCallback(() => {
        console.log('Left press - Previous');
        handlePrevious();
    }, [handlePrevious]);

    // แตะฝั่งขวาเพื่อไปรูปถัดไป
    const handleRightPress = useCallback(() => {
        console.log('Right press - Next');
        handleNext();
    }, [handleNext]);

    // กดค้างเพื่อหยุด
    const handlePressIn = useCallback(() => {
        console.log('Press Hold - Pause');
        handlePlayPause(true);
    }, [handlePlayPause]);

    // ปล่อยเพื่อเล่นต่อ
    const handlePressOut = useCallback(() => {
        console.log('Press Release - Resume');
        handlePlayPause(false);
    }, [handlePlayPause]);

    // Reset progress and mark story as viewed
    useEffect(() => {
        if (!currentStory) return;

        // Mark the story as viewed
        currentStory.viewed = true;

        // Start progress animation from beginning
        pausedProgressValueRef.current = 0;
        startProgress(true);

        return () => {
            if (progressAnimation.current) {
                progressAnimation.current.stop();
            }
            if (longPressTimeoutRef.current) {
                clearTimeout(longPressTimeoutRef.current);
            }
        };
    }, [currentStoryIndex, currentStoryItemIndex, currentStory, startProgress]);

    // Calculate progress indicators
    const renderProgressBars = useCallback(() => {
        if (!storyContent) return null;

        const bars = [];
        const barWidth = PROGRESS_BAR_WIDTH / storyContent.length;

        for (let i = 0; i < storyContent.length; i++) {
            bars.push(
                <View
                    key={`progress-${i}`}
                    style={[styles.progressBar, { width: barWidth - 4 }]}
                >
                    {i === currentStoryItemIndex ? (
                        <Animated.View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%'],
                                    }),
                                }
                            ]}
                        />
                    ) : i < currentStoryItemIndex ? (
                        <View style={[styles.progressBarFill, { width: '100%' }]} />
                    ) : (
                        <View style={[styles.progressBarFill, { width: '0%' }]} />
                    )}
                </View>
            );
        }

        return bars;
    }, [storyContent, currentStoryItemIndex, progressAnim]);

    // Use Reanimated gesture handler for better performance
    const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startY: number }>({
        onStart: (_, ctx) => {
            ctx.startY = translateY.value;
            runOnJS(handlePlayPause)(true);
        },
        onActive: (event, ctx) => {
            // Only allow downward movement
            if (event.translationY > 0) {
                translateY.value = ctx.startY + event.translationY;
                // Calculate opacity based on translation (decrease as you pull down)
                opacity.value = Math.max(1 - (translateY.value / (height * 0.5)), 0);
            }
        },
        onEnd: (event) => {
            // If swiped down with enough distance or velocity, close the story
            if (translateY.value > 100 || event.velocityY > 800) {
                // Animate closing with smooth transition
                translateY.value = withTiming(height, { duration: 200 });
                opacity.value = withTiming(0, { duration: 200 }, () => {
                    runOnJS(handleClose)();
                });
            } else {
                // Reset position with spring animation for bounce effect
                translateY.value = withSpring(0, {
                    damping: 15,
                    stiffness: 150,
                });
                opacity.value = withTiming(1, { duration: 150 }, () => {
                    // Resume if not paused before
                    runOnJS(handlePlayPause)(false);
                });
            }
        },
    });

    // Create animated styles with Reanimated
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value
        };
    });

    if (!currentStory) {
        navigation.goBack();
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PanGestureHandler
                onGestureEvent={gestureHandler}
                activeOffsetY={[-20, 20]} // Activate with minimal movement in either direction
            >
                <Reanimated.View style={[styles.container, animatedStyle]}>
                    <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

                    {/* Story Content */}
                    <View style={styles.storyImageContainer}>
                        <Image
                            key={`${currentStoryIndex}-${currentStoryItemIndex}`}
                            source={{ uri: currentContent.url || currentStory.coverImage || '' }}
                            style={styles.storyImage}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            recyclingKey={`${currentStoryIndex}-${currentStoryItemIndex}`}
                            placeholder={currentStory.coverImage}
                            contentPosition="center"
                            transition={50}
                            priority="high"
                            blurRadius={0}
                            onLoad={() => {
                                // เริ่มเล่นเมื่อโหลดเสร็จเฉพาะกรณีที่เป็นรูปใหม่
                                if (pausedProgressValueRef.current === 0 && !isPaused) {
                                    startProgress(true);
                                }
                            }}
                        />
                    </View>

                    {/* Touch Controls - แบบ Instagram */}
                    <View style={styles.touchControlsContainer}>
                        {/* ฝั่งซ้าย - กดเพื่อย้อนกลับ */}
                        <TouchableWithoutFeedback onPress={handleLeftPress} onLongPress={handlePressIn} onPressOut={handlePressOut}>
                            <View style={[styles.touchControl]} />
                        </TouchableWithoutFeedback>

                        {/* ฝั่งขวา - กดเพื่อไปข้างหน้า */}
                        <TouchableWithoutFeedback onPress={handleRightPress} onLongPress={handlePressIn} onPressOut={handlePressOut}>
                            <View style={[styles.touchControl]} />
                        </TouchableWithoutFeedback>
                    </View>

                    {/* Overlay UI */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.7)', 'transparent', 'transparent', 'rgba(0,0,0,0.3)']}
                        style={styles.overlay}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 0.3 }}
                        pointerEvents="box-none"
                    >
                        {/* Progress Bars */}
                        <SafeAreaView style={styles.topControls} pointerEvents="box-none">
                            <View style={styles.progressContainer}>
                                {renderProgressBars()}
                            </View>

                            {/* User Info */}
                            <View style={styles.userInfoContainer}>
                                <View style={styles.profileInfo}>
                                    <Image
                                        source={{ uri: currentStory.userAvatar || '' }}
                                        style={styles.avatar}
                                        contentFit="cover"
                                        cachePolicy="memory-disk"
                                    />
                                    <Text style={styles.username}>{currentStory.username || 'User'}</Text>
                                    <Text style={styles.timeLabel}>4h</Text>
                                </View>

                                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                                    <Ionicons name="close" size={26} color="white" />
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>

                        {/* Bottom Controls */}
                        <SafeAreaView style={styles.bottomControls} pointerEvents="box-none">
                            <View style={styles.replyContainer}>
                                <TouchableOpacity style={styles.replyButton}>
                                    <Text style={styles.replyButtonText}>Send message</Text>
                                    <Ionicons name="paper-plane" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </LinearGradient>
                </Reanimated.View>
            </PanGestureHandler>
        </GestureHandlerRootView>
    );
};

export default StoryScreen; 