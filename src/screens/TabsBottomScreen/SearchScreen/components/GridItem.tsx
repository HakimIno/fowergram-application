import { memo, useState, useEffect } from 'react';
import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import { GridItemProps } from '../types';

const GridItem = memo(({ 
    item, 
    index, 
    gridWidth, 
    groupIndex, 
    layout = 'small', 
    isVisible = true,
    isDarkMode,
    theme 
}: GridItemProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const gap = 1;
    const standardWidth = (gridWidth / 3) - (gap * 2 / 3);

    const positionInGroup = index % 5;
    const isLargeItem = positionInGroup === 0;
    const isLargeItemOnLeft = groupIndex % 2 === 0;

    // Prioritize large items and visible items
    const isPriority = isLargeItem || isVisible;

    const getItemWidth = () => standardWidth;

    const getItemHeight = () => {
        return isLargeItem ? (standardWidth * 2) + gap : standardWidth;
    };

    const getPosition = () => {
        if (!isLargeItem) {
            let adjustedPosition = positionInGroup - 1;
            if (isLargeItemOnLeft) {
                if (adjustedPosition < 2) {
                    return { left: standardWidth + gap, top: adjustedPosition * (standardWidth + gap) };
                } else {
                    return { left: (standardWidth * 2) + (gap * 2), top: (adjustedPosition - 2) * (standardWidth + gap) };
                }
            } else {
                if (adjustedPosition < 2) {
                    return { left: 0, top: adjustedPosition * (standardWidth + gap) };
                } else {
                    return { left: standardWidth + gap, top: (adjustedPosition - 2) * (standardWidth + gap) };
                }
            }
        } else {
            return {
                left: isLargeItemOnLeft ? 0 : (standardWidth * 2) + (gap * 2),
                top: 0
            };
        }
    };

    const formatDuration = (seconds: number = 0) => {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const position = getPosition();
    const backgroundColor = isDarkMode ? theme?.cardBackground || '#0a0a0a' : '#fafafa';
    const accentColor = theme?.primary || '#4f46e5';
    const trendingColor = '#ff0050';

    return (
        <Pressable
            style={[
                styles.gridItem,
                {
                    width: getItemWidth(),
                    height: getItemHeight(),
                    position: 'absolute',
                    left: position.left,
                    top: position.top,
                    backgroundColor,
                    borderColor: isDarkMode ? '#333' : '#ddd',
                }
            ]}
        >
            <Image
                source={{ uri: item.image }}
                style={styles.gridImage}
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
                priority={isPriority ? "high" : "low"}
                onLoad={() => setIsLoaded(true)}
                placeholder={isLargeItem ? item.image : undefined}
                placeholderContentFit="cover"
                recyclingKey={item.image}
            />

            {item.isVideo && (
                <View style={[
                    styles.videoIconOverlay,
                    isLargeItem && styles.videoIconOverlayLarge // Adjust overlay for large items
                ]}>
                    <View style={[
                        styles.videoIcon,
                        isLargeItem && styles.videoIconLarge
                    ]}>
                        <Ionicons
                            name="play"
                            size={isLargeItem ? 24 : 16}
                            color="white"
                        />
                    </View>
                    <View style={[
                        styles.videoDurationBadge,
                        isLargeItem && styles.videoDurationBadgeLarge
                    ]}>
                        <Text style={[
                            styles.durationText,
                            isLargeItem && styles.durationTextLarge
                        ]}>
                            {formatDuration(item.duration)}
                        </Text>
                    </View>
                </View>
            )}

            {item.trending && (
                <View style={[styles.trendingIndicator, { backgroundColor: trendingColor }]}>
                    <Ionicons name="trending-up" size={12} color="#fff" />
                </View>
            )}
        </Pressable>
    );
});

const styles = StyleSheet.create({
    gridItem: {
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 0.5,
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    videoIconOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Ensure overlay is above image
    },
    videoIconOverlayLarge: {
        // Optional: Adjust positioning for large items if needed
    },
    videoIcon: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoIconLarge: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    videoDurationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    videoDurationBadgeLarge: {
        bottom: 12,
        right: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    durationText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '500',
    },
    durationTextLarge: {
        fontSize: 12,
    },
    trendingIndicator: {
        position: 'absolute',
        top: 8,
        left: 8,
        borderRadius: 3,
        padding: 3,
        zIndex: 10,
    },
});

export default GridItem;