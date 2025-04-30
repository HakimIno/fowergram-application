import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'src/navigation/types';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EditorPhoto from './components/EditorPhoto';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MediaItemType {
    uri: string;
    type: 'video' | 'image';
    width?: number;
    height?: number;
}

type PreviewScreenRouteProp = RouteProp<RootStackParamList, 'preview_screen'>;
type PreviewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SPRING_CONFIG = {
    damping: 15,
    mass: 0.5,
    stiffness: 100,
};

const MediaPlayer: React.FC = () => {
    const route = useRoute<PreviewScreenRouteProp>();
    const navigation = useNavigation<PreviewScreenNavigationProp>();
    const [mediaItem, setMediaItem] = useState<MediaItemType | null>(null);
    const [isPlaying, setIsPlaying] = useState(true);

    // Animated values
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);
    const originX = useSharedValue(0);
    const originY = useSharedValue(0);

    const videoPlayer = useVideoPlayer(
        mediaItem?.type === 'video' ? mediaItem.uri : null as any,
        player => {
            if (player) {
                player.loop = true;
                player.play();
            }
        }
    );

    useEffect(() => {
        const selectedMedia = route.params?.selectedMedia;
        if (selectedMedia) {
            setMediaItem(selectedMedia);
        }
    }, [route.params]);

    const notifyZoomState = useCallback((zoomed: boolean) => {
        // Implement zoom state notification if needed
    }, []);

    const resetTransform = () => {
        'worklet';
        scale.value = withSpring(1, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(notifyZoomState)(false);
    };

    const pinchGesture = Gesture.Pinch()
        .onStart((e) => {
            runOnJS(notifyZoomState)(true);
            originX.value = e.focalX;
            originY.value = e.focalY;
        })
        .onUpdate((e) => {
            const newScale = Math.min(Math.max(savedScale.value * e.scale, 1), 5);
            scale.value = newScale;

            if (scale.value > 1) {
                const moveX = (e.focalX - originX.value) / scale.value;
                const moveY = (e.focalY - originY.value) / scale.value;
                translateX.value = savedTranslateX.value + moveX;
                translateY.value = savedTranslateY.value + moveY;
            }
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const panGesture = Gesture.Pan()
        .enabled(scale.value > 1)
        .onStart(() => {
            runOnJS(notifyZoomState)(true);
        })
        .onUpdate((e) => {
            if (scale.value > 1) {
                const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
                const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;

                translateX.value = Math.min(
                    Math.max(savedTranslateX.value + e.translationX / scale.value, -maxTranslateX),
                    maxTranslateX
                );
                translateY.value = Math.min(
                    Math.max(savedTranslateY.value + e.translationY / scale.value, -maxTranslateY),
                    maxTranslateY
                );
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onStart((e) => {
            if (scale.value > 1) {
                resetTransform();
            } else {
                runOnJS(notifyZoomState)(true);
                scale.value = withSpring(2, SPRING_CONFIG);
                savedScale.value = 2;

                const tapX = e.x - SCREEN_WIDTH / 2;
                const tapY = e.y - SCREEN_HEIGHT / 2;
                translateX.value = withSpring(-tapX / 2, SPRING_CONFIG);
                translateY.value = withSpring(-tapY / 2, SPRING_CONFIG);
                savedTranslateX.value = -tapX / 2;
                savedTranslateY.value = -tapY / 2;
            }
        });

    const composedGestures = Gesture.Simultaneous(
        Gesture.Race(pinchGesture, doubleTapGesture),
        panGesture
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value }
        ],
    }));

    const togglePlayback = () => {
        if (videoPlayer) {
            if (isPlaying) {
                videoPlayer.pause();
            } else {
                videoPlayer.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    if (!mediaItem) return null;

    return (
        <View style={styles.container}>
            <GestureDetector gesture={composedGestures}>
                <Animated.View style={[styles.contentContainer, animatedStyle]}>
                    {mediaItem.type === 'video' && videoPlayer ? (
                        <>
                            <VideoView
                                player={videoPlayer}
                                style={styles.fullscreenMedia}
                                nativeControls={false}
                                contentFit="contain"
                            />
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={togglePlayback}
                            >
                                <Ionicons
                                    name={isPlaying ? 'pause' : 'play'}
                                    size={40}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <EditorPhoto imageUri={mediaItem.uri} />
                    )}
                </Animated.View>
            </GestureDetector>

            {mediaItem?.type === 'video' && (
                <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
                    <Ionicons
                        name={isPlaying ? 'pause' : 'play'}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            )}
            
           
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    contentContainer: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullscreenMedia: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    playButton: {
        position: 'absolute',
        bottom: SCREEN_HEIGHT * 0.5,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 15,
        borderRadius: 40,
        zIndex: 10,
    },
    editButton: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        backgroundColor: 'rgba(57, 151, 240, 0.8)',
        padding: 15,
        borderRadius: 40,
        zIndex: 10,
    },
});

export default MediaPlayer;