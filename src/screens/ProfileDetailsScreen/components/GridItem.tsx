import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import React, { memo, useMemo, useState, useCallback } from 'react';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { PLACEHOLDER_BLURHASH } from './constants';

export type FeedInfo = {
    id: string;
    images: string[];
    isVideo: boolean;
};

interface GridItemProps {
    item: FeedInfo;
    index: number;
    onPress: (index: number) => void;
    size: number;
}

const OVERLAY_COLOR = 'rgba(255,255,255,0.3)';
const ERROR_COLOR = '#f5f5f5';
const ITEM_PADDING = 0.5;

// วิธีป้องกันการเรียก animated ซ้ำๆ
const VideoIcon = memo(() => (
    <View style={styles.videoIconContainer}>
        <Ionicons name="play-circle" size={24} color="white" />
    </View>
));

const ErrorIcon = memo(() => (
    <Ionicons name="image-outline" size={24} color="#999" />
));

// Performance optimized Grid Item
const GridItem = memo(({ item, index, onPress, size }: GridItemProps) => {
    // ใช้ state เดียวแทนหลาย state เพื่อลดการ render
    const [imageState, setImageState] = useState<'loading' | 'error' | 'success'>('loading');

    // คำนวณ style ล่วงหน้าเพื่อป้องกันการคำนวณซ้ำ
    const containerStyle = useMemo(() => ([
        styles.gridItem,
        {
            width: size,
            height: size * 1.4,
        }
    ]), [size]);

    const imageStyle = useMemo(() => ([
        styles.gridImage,
        imageState === 'error' && styles.imageError
    ]), [imageState]);

    const skeletonDimensions = useMemo(() => ({
        width: size,
        height: size * 1.4,
        radius: 4,
    }), [size]);

    // Handlers ที่ทำงานแค่ครั้งเดียว (memoized)
    const handlePress = useCallback(() => {
        onPress(index);
    }, [onPress, index]);

    const handleImageStateChange = useCallback((newState: 'loading' | 'error' | 'success') => {
        setImageState(newState);
    }, []);
    
    // คำนวณค่าเพียงครั้งเดียว
    const isError = imageState === 'error';
    const isLoading = imageState === 'loading';
    const isVideo = item.isVideo && imageState === 'success';
    
    // กำหนด props ของรูปภาพก่อนเพื่อป้องกันการคำนวณซ้ำ
    const imageProps = useMemo(() => ({
        recyclingKey: item.id,
        source: item.images[0],
        contentFit: 'cover' as const,
        transition: 200,
        placeholder: PLACEHOLDER_BLURHASH,
        cachePolicy: 'memory-disk' as const,
        placeholderContentFit: 'cover' as const,
        style: imageStyle,
        onLoadStart: () => handleImageStateChange('loading'),
        onLoad: () => handleImageStateChange('success'),
        onError: () => handleImageStateChange('error'),
    }), [item.id, item.images[0], imageStyle, handleImageStateChange]);

    // แสดง video icon เมื่อจำเป็นเท่านั้น
    const renderVideoIcon = useMemo(() => {
        if (!isVideo) return null;
        return <VideoIcon />;
    }, [isVideo]);
    
    const renderLoadingOverlay = useMemo(() => {
        if (imageState === 'success') return null;
        
        return (
            <View style={styles.loadingOverlay}>
                {isLoading ? (
                    <MotiView style={styles.skeletonContainer}>
                        <Skeleton
                            colorMode="light"
                            width={skeletonDimensions.width}
                            height={skeletonDimensions.height}
                            radius={skeletonDimensions.radius}
                            show={true}
                        />
                    </MotiView>
                ) : (
                    <ErrorIcon />
                )}
            </View>
        );
    }, [imageState, isLoading, skeletonDimensions]);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            style={containerStyle}
        >
            <ExpoImage {...imageProps} />
            {renderLoadingOverlay}
            {renderVideoIcon}
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    // เทียบเฉพาะค่าที่จำเป็นเพื่อป้องกันการ render ที่ไม่จำเป็น
    return (
        prevProps.item.id === nextProps.item.id && 
        prevProps.size === nextProps.size && 
        prevProps.index === nextProps.index &&
        prevProps.item.isVideo === nextProps.item.isVideo
    );
});

const styles = StyleSheet.create({
    gridItem: {
        padding: ITEM_PADDING,
        backgroundColor: ERROR_COLOR,
        position: 'relative',
        overflow: 'hidden',
        // Hardware acceleration for better performance
        ...(Platform.OS === 'android' ? { 
            elevation: 0.1,
            // Additional Android optimizations
            accessibilityLiveRegion: 'none' as const,
        } : {
            // iOS optimizations
            shadowOpacity: 0,
            shadowRadius: 0,
        }),
        backfaceVisibility: 'hidden',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    imageError: {
        opacity: 0.5,
        backgroundColor: ERROR_COLOR,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: OVERLAY_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skeletonContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    videoIconContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        padding: 2,
    },
});

export default GridItem;