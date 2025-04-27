import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, StatusBar, Dimensions, SafeAreaView, Text, Pressable } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    withTiming,
    runOnJS,
    useSharedValue,
    withSpring,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { SvgIcon } from 'src/components/SvgIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from 'src/navigation/types';
import Pinchable from 'react-native-pinchable';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_BLURHASH =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

// Animation configs
const TRANSITION_CONFIG = {
    duration: 300,
};

type ImageViewerModalRouteProp = RouteProp<RootStackParamList, 'image_viewer_modal'>;
type ImageViewerNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ImageViewerModal = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<ImageViewerNavigationProp>();
    const route = useRoute<ImageViewerModalRouteProp>();
    const { imageUrl, imageId, username = '', isFollowing = false } = route.params;
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [following, setFollowing] = useState(isFollowing);

    // Shared values for animations
    const opacity = useSharedValue(1);
    const transitionProgress = useSharedValue(0);
    const userInfoOpacity = useSharedValue(0);

    // Create a stable key for shared transition tag
    const transitionTag = useMemo(() => `image-${imageId}`, [imageId]);

    // On mount animation
    useEffect(() => {
        transitionProgress.value = withTiming(1, TRANSITION_CONFIG, () => {
            // After the image is loaded, show the user info with a slight delay
            if (username) {
                userInfoOpacity.value = withTiming(1, { duration: 200 });
            }
        });
    }, []);

    // Preload image to improve rendering speed
    useEffect(() => {
        if (imageUrl) {
            ExpoImage.prefetch([imageUrl]).catch((error) =>
                console.warn('Image prefetch failed:', error)
            );
        }
    }, [imageUrl]);

    // Handle image load complete
    const handleImageLoad = useCallback(() => {
        setIsImageLoaded(true);
    }, []);

    // Close the modal with animation
    const closeModal = useCallback(() => {
        'worklet';
        // Hide the user info first
        userInfoOpacity.value = withTiming(0, { duration: 150 });

        // Animate the transition out
        transitionProgress.value = withTiming(0, { duration: 300 }, () => {
            // Finally fade out the entire modal
            opacity.value = withTiming(0, { duration: 150 }, (finished) => {
                if (finished) {
                    runOnJS(navigation.goBack)();
                }
            });
        });
    }, [navigation, opacity, transitionProgress, userInfoOpacity]);

    // Toggle follow status
    const toggleFollow = useCallback(() => {
        setFollowing(prev => !prev);
        // Here you would normally call an API to update the follow status
    }, []);

    // View user profile
    const viewUserProfile = useCallback(() => {
        if (username) {
            navigation.navigate('profile_details_screen', {
                image: imageUrl,
                username: username
            });
        }
    }, [navigation, imageUrl, username]);

    // Tap gesture to close the modal
    const singleTapGesture = useMemo(() =>
        Gesture.Tap()
            .maxDuration(250)
            .onStart(() => {
                'worklet';
                closeModal();
            }),
        [closeModal]
    );

    // Animated styles
    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }), []);

    const closeButtonAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            transitionProgress.value,
            [0, 0.5, 1],
            [0, 0.7, 1],
            Extrapolate.CLAMP
        ),
        transform: [
            {
                scale: interpolate(
                    transitionProgress.value,
                    [0, 1],
                    [0, 1],
                    Extrapolate.CLAMP
                )
            }
        ]
    }), []);

    const imageContainerStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            transitionProgress.value,
            [0, 1],
            [0, 1],
            Extrapolate.CLAMP
        ),
        transform: [
            {
                scale: interpolate(
                    transitionProgress.value,
                    [0, 1],
                    [0.8, 1],
                    Extrapolate.CLAMP
                )
            }
        ],
    }), []);

    const userInfoAnimatedStyle = useAnimatedStyle(() => ({
        opacity: userInfoOpacity.value,
    }), []);

    // Memoize styles
    const closeButtonStyle = useMemo(() =>
        [styles.closeButton, {
            top: insets.top + 10,
        }],
        [insets.top]
    );

    const userInfoContainerStyle = useMemo(() =>
        [styles.userInfoContainer, {
            marginTop: insets.top + 60, // Dynamic margin based on safe area insets
        }],
        [insets.top]
    );

    const handleClosePress = useCallback(() => {
        closeModal();
    }, [closeModal]);


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <GestureHandlerRootView style={styles.container}>
                <Animated.View
                    style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.95)' }, containerStyle]}
                >

                    <Pressable
                        style={[closeButtonAnimatedStyle, { top: insets.top + 15, left: insets.left + 15 }]}
                        onPress={handleClosePress}
                    >
                        <SvgIcon
                            path="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                            size={30}
                            color="#FFFFFF"
                            stroke={0}
                        />
                    </Pressable>
                    <View style={[styles.header]}>

                        {username && (
                            <Animated.View style={[userInfoContainerStyle, userInfoAnimatedStyle]}>
                                <TouchableOpacity style={styles.usernameContainer} onPress={viewUserProfile}>
                                    <ExpoImage
                                        source={{ uri: imageUrl }}
                                        style={styles.userAvatar}
                                        contentFit="cover"
                                        transition={100}
                                    />
                                    <Text style={styles.username}>{username}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.followButton,
                                        following ? styles.followingButton : null
                                    ]}
                                    onPress={toggleFollow}
                                >
                                    <Text style={[
                                        styles.followButtonText,
                                        following ? styles.followingButtonText : null
                                    ]}>
                                        {following ? 'กำลังติดตาม' : 'ติดตาม'}
                                    </Text>
                                </TouchableOpacity>


                            </Animated.View>
                        )}
                    </View>

                    {/* Image Viewer */}
                    <GestureDetector gesture={singleTapGesture}>
                        <View style={styles.imageContainer}>
                            <Animated.View
                                style={[styles.imageWrapper, imageContainerStyle]}
                                sharedTransitionTag={transitionTag}
                            >
                                <Pinchable>
                                    <ExpoImage
                                        source={{ uri: imageUrl }}
                                        style={styles.image}
                                        contentFit="contain"
                                        cachePolicy="memory-disk"
                                        placeholder={DEFAULT_BLURHASH}
                                        placeholderContentFit="cover"
                                        contentPosition="center"
                                        priority="high"
                                        transition={200}
                                        onLoad={handleImageLoad}
                                    />
                                </Pinchable>
                            </Animated.View>
                        </View>
                    </GestureDetector>

                    {/* Action Buttons */}
                    {username && (
                        <Animated.View style={[styles.actionButtonsContainer]}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="heart-outline" size={26} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="bookmark-outline" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </Animated.View>
            </GestureHandlerRootView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,

    },
    closeButton: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,1)',
        padding: 12,
    },
    usernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    username: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    followButton: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: 'transparent',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: 'white'
    },
    followingButton: {
        backgroundColor: 'transparent',
    },
    followButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Chirp_Medium',
        lineHeight: 14 * 1.4
    },
    followingButtonText: {
        color: '#FFFFFF',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',


    },
    imageWrapper: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    actionButtonsContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 5,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
        marginHorizontal: 20,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default React.memo(ImageViewerModal);