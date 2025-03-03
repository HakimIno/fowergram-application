import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native'
import React, { useMemo, useCallback, useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import Animated, {
    interpolate,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    Extrapolate
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const STICKER_SIZE = (SCREEN_WIDTH - 32) / 4
const KEYBOARD_HEIGHT = Platform.select({
    ios: SCREEN_HEIGHT * 0.4,
    android: 300,
    default: 300
})

// Categories and Stickers Data
const STICKER_CATEGORIES = [
    {
        id: 'recent',
        name: 'ล่าสุด',
        icon: 'time-outline',
        stickers: [
            { id: '1', url: 'https://media.tenor.com/b67is22VGiUAAAAi/utya-utya-duck.gif' },
            { id: '2', url: 'https://media.tenor.com/Z-hrYzd7zvIAAAAi/utya-utya-duck.gif' },
            { id: '3', url: 'https://media.tenor.com/YhNac8PQeJwAAAAi/utya-telegram.gif' },
            { id: '4', url: 'https://media.tenor.com/8S28smZQZ7wAAAAi/utya-utya-duck.gif' },
            { id: '5', url: 'https://media.tenor.com/nOWoXPqH7D4AAAAi/utya-telegram.gif' },
            { id: '6', url: 'https://media.tenor.com/_w8QgJp71j4AAAAi/utya-telegram.gif' },
            { id: '7', url: 'https://media.tenor.com/tZc3nOnqpF8AAAAi/utya-utya-duck.gif' },
            { id: '8', url: 'https://media.tenor.com/qksCshcDAacAAAAi/utya-telegram-duck.gif' },
            { id: '9', url: 'https://media.tenor.com/U73ou4Nz8MoAAAAi/utya-telegram-duck.gif' },
            { id: '10', url: 'https://media.tenor.com/6PDwkYCL8GYAAAAi/telegram-utya-telegram-duck.gif' },
            { id: '11', url: 'https://media.tenor.com/5I4hV-vKbOAAAAAi/utya-utya-duck.gif' },
            { id: '12', url: 'https://media.tenor.com/pJJ6uU9vjaAAAAAi/utya-utya-duck.gif' },
            { id: '13', url: 'https://media.tenor.com/YXZL61MYsfYAAAAi/utya-utya-duck.gif' },
            { id: '14', url: 'https://media.tenor.com/8eZe6RXW6F4AAAAi/utya-utya-duck.gif' },
            { id: '15', url: 'https://media.tenor.com/b67is22VGiUAAAAi/utya-utya-duck.gif' },
            { id: '16', url: 'https://media.tenor.com/h796J-dd0FUAAAAi/utya-utya-duck.gif' },
            { id: '17', url: 'https://media.tenor.com/PD3qUz22UxIAAAAi/utya-utya-duck.gif' },
            { id: '18', url: 'https://media.tenor.com/kdfWfHvqvy0AAAAi/utya-utya-duck.gif' },
            { id: '19', url: 'https://media.tenor.com/icPog2Shcm4AAAAi/utya-telegram.gif' },
            { id: '20', url: 'https://media.tenor.com/-I-6w9klVyEAAAAi/utya-telegram.gif' },
        ]
    },

];

interface StickerType {
    id: string
    url: string
}

interface StickerPickerProps {
    isVisible: boolean
    height: Animated.SharedValue<number>
    theme: any
    onClose: () => void
    onSelectSticker: (sticker: StickerType) => void
}

// Progressive Loading Sticker Item
const ProgressiveStickerItem = React.memo(({
    item,
    onPress,
    theme,
    index
}: {
    item: StickerType
    onPress: (sticker: StickerType) => void
    theme: any
    index: number
}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [shouldLoad, setShouldLoad] = useState(index < 8)

    useEffect(() => {
        if (index >= 8) {
            const timer = setTimeout(() => {
                setShouldLoad(true)
            }, index * 100) // Stagger loading
            return () => clearTimeout(timer)
        }
    }, [index])

    const handlePress = useCallback(() => {
        requestAnimationFrame(() => onPress(item))
    }, [item, onPress])

    if (hasError) {
        return (
            <View style={[styles.stickerButton, { backgroundColor: theme.cardBackground + '20' }]}>
                <Ionicons name="alert-circle-outline" size={24} color={theme.textColor + '80'} />
            </View>
        )
    }

    return (
        <Pressable
            style={({ pressed }) => [
                styles.stickerButton,
                pressed && styles.stickerButtonPressed
            ]}
            onPress={handlePress}
        >
            {isLoading && (
                <View style={[
                    styles.placeholder,
                    { backgroundColor: theme.cardBackground + '40' }
                ]} />
            )}
            {shouldLoad && (
                <Image
                    source={{ uri: item.url }}
                    style={styles.stickerImage}
                    contentFit="contain"
                    recyclingKey={item.id}
                    cachePolicy="memory-disk"
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => setIsLoading(false)}
                    onError={() => setHasError(true)}
                    placeholder={Platform.select({
                        ios: 'BLURHASH',
                        android: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
                    })}
                    transition={150}
                />
            )}
        </Pressable>
    )
})

// Optimized Grid Component
const StickersGrid = React.memo(({
    stickers,
    onSelectSticker,
    theme
}: {
    stickers: StickerType[]
    onSelectSticker: (sticker: StickerType) => void
    theme: any
}) => {
    // Preload images
    useEffect(() => {
        const preloadImages = stickers.slice(0, 12).map(sticker =>
            Image.prefetch(sticker.url)
        )
        Promise.all(preloadImages)
    }, [stickers])

    const renderSticker = useCallback(({ item, index }: { item: StickerType, index: number }) => (
        <ProgressiveStickerItem
            item={item}
            onPress={onSelectSticker}
            theme={theme}
            index={index}
        />
    ), [onSelectSticker, theme])

    return (
        <FlashList
            keyExtractor={item => item.id}
            data={stickers}
            renderItem={renderSticker}
            numColumns={4}
            estimatedItemSize={STICKER_SIZE}
            removeClippedSubviews={true}
            estimatedFirstItemOffset={0}
            drawDistance={STICKER_SIZE * 4}
            overrideItemLayout={(layout, item) => {
                layout.size = STICKER_SIZE
            }}
            contentContainerStyle={styles.stickersGridContent}
            showsVerticalScrollIndicator={false}
        />
    )
})

// Header Component
const StickerPickerHeader = React.memo(({
    theme,
    onClose
}: {
    theme: any
    onClose: () => void
}) => (
    <View style={[styles.header, { borderBottomColor: theme.textColor + '20' }]}>
        <Text style={[styles.title, { color: theme.textColor }]}>
            สติกเกอร์
        </Text>
        <Pressable
            onPress={onClose}
            style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.7 }
            ]}
        >
            <Ionicons name="close" size={24} color={theme.textColor} />
        </Pressable>
    </View>
))

// Main StickerPicker Component
const StickerPicker: React.FC<StickerPickerProps> = ({
    isVisible,
    height,
    theme,
    onClose,
    onSelectSticker
}) => {
    const selectedStickers = useMemo(() =>
        STICKER_CATEGORIES[0].stickers,
        []
    )

    const handleClose = useCallback(() => {
        height.value = withTiming(0, {
            duration: 250,
        }, () => {
            runOnJS(onClose)()
        })
    }, [onClose, height])

    // Animated container style
    const animatedStyle = useAnimatedStyle(() => {
        'worklet'
        return {
            transform: [{
                translateY: interpolate(
                    height.value,
                    [0, 1],
                    [KEYBOARD_HEIGHT, 0],
                    Extrapolate.CLAMP
                )
            }],
            opacity: height.value
        }
    }, [])

    const containerStyle = useMemo(() => [
        styles.container,
        { backgroundColor: theme.backgroundColor },
        animatedStyle
    ], [theme.backgroundColor, animatedStyle])

    if (!isVisible) return null

    return (
        <Animated.View style={containerStyle}>
            <StickerPickerHeader theme={theme} onClose={handleClose} />
            <StickersGrid
                stickers={selectedStickers}
                onSelectSticker={onSelectSticker}
                theme={theme}
            />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        zIndex: 1,
        height: KEYBOARD_HEIGHT,
        ...Platform.select({
            android: {
                elevation: 0,
                overflow: 'hidden'
            },
            ios: {
                shadowColor: 'transparent'
            }
        })
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 0.5,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'SukhumvitSet_Bd',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stickersGridContent: {
        padding: 4,
        gap: 2,
    },
    stickerButton: {
        width: STICKER_SIZE,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        ...Platform.select({
            android: {
                elevation: 0,
                overflow: 'hidden'
            },
            ios: {
                shadowColor: 'transparent'
            }
        })
    },
    stickerButtonPressed: {
        transform: [{ scale: 0.95 }],
        opacity: 0.8,
    },
    stickerImage: {
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        transform: [{ perspective: 1000 }]
    },
    placeholder: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 8,
    }
})

export default StickerPicker
