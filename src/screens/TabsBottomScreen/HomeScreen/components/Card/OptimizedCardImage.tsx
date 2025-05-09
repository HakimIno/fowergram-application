import React, { useRef, useState, useEffect, memo } from 'react';
import { View, StyleSheet, Pressable, GestureResponderEvent } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import Pinchable from 'react-native-pinchable';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const CAROUSEL_WIDTH = SCREEN_WIDTH - 16;

const DEFAULT_BLURHASH = 'L6PZfSi_.AyE_3t7R*0K';

// ใช้ Set เพื่อติดตามรูปภาพที่โหลดแล้ว
const loadedImageUrls = new Set<string>();

// Optimized preloading function with reduced batch size and cancelable promises
export function preloadFeedImages(feedImages: string[][], visibleIndices: number[] = []): void {
  if (!feedImages?.length) return;
  
  // Only process essential images
  const highPriorityImages: string[] = [];
  
  // Only preload visible image thumbnails
  visibleIndices.slice(0, 3).forEach(index => {
    if (feedImages[index]?.[0] && !loadedImageUrls.has(feedImages[index][0])) {
      highPriorityImages.push(feedImages[index][0]);
    }
  });

  // Batch preloading with smaller concurrency
  if (highPriorityImages.length > 0) {
    // Process in smaller batches to avoid memory spikes
    const batchSize = 2;
    for (let i = 0; i < highPriorityImages.length; i += batchSize) {
      const batch = highPriorityImages.slice(i, i + batchSize);
      
      // Use setTimeout to allow UI thread to breathe
      setTimeout(() => {
        batch.forEach(url => {
          ExpoImage.prefetch(url).then(() => loadedImageUrls.add(url));
        });
      }, 100 * Math.floor(i / batchSize));
    }
  }
}

interface OptimizedCardImageProps {
  imageUrl: string;
  imageKey: string;
  onDoubleTap: (event: GestureResponderEvent) => void;
  isVisible: boolean;
  isCurrentIndex: boolean;
}

export const OptimizedCardImage = memo(({
  imageUrl,
  imageKey,
  onDoubleTap,
  isVisible,
  isCurrentIndex
}: OptimizedCardImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const mountedRef = useRef(true);

  // ตรวจสอบว่ารูปนี้โหลดแล้วหรือยัง
  useEffect(() => {
    if (loadedImageUrls.has(imageUrl)) {
      setIsLoaded(true);
    }
    
    // ถ้ารูปยังไม่ถูกโหลด ให้ prefetch
    if (!loadedImageUrls.has(imageUrl) && isCurrentIndex) {
      ExpoImage.prefetch(imageUrl);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [imageUrl, isCurrentIndex]);

  return (
    <View style={styles.slideContainer}>
      <Pressable
        onPress={onDoubleTap}
        style={styles.imageContainer}
      >
        <Pinchable>
          <ExpoImage
            source={{ uri: imageUrl }}
            style={styles.image}
            recyclingKey={imageKey}
            contentFit="cover"
            placeholder={DEFAULT_BLURHASH}
            transition={isCurrentIndex ? 100 : 0}
            cachePolicy="memory"
            onLoad={() => {
              if (mountedRef.current) {
                loadedImageUrls.add(imageUrl);
                setIsLoaded(true);
              }
            }}
          />
        </Pinchable>
      </Pressable>
    </View>
  );
}, (prevProps, nextProps) => {
  // ป้องกันการ re-render ที่ไม่จำเป็น
  return prevProps.imageKey === nextProps.imageKey && 
    prevProps.isCurrentIndex === nextProps.isCurrentIndex;
});

const styles = StyleSheet.create({
  slideContainer: {
    width: CAROUSEL_WIDTH,
    height: 'auto',
    aspectRatio: 0.8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: CAROUSEL_WIDTH,
    height: '100%',
    borderRadius: 8,
  },
}); 