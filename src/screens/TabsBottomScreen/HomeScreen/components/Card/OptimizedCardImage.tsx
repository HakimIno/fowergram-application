import React, { useRef, useState, useEffect, memo } from 'react';
import { View, StyleSheet, Pressable, GestureResponderEvent, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import Pinchable from 'react-native-pinchable';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
const CAROUSEL_WIDTH = SCREEN_WIDTH - 16;
const CAROUSEL_HEIGHT = SCREEN_HEIGHT / 1.7;

// ค่า blurhash ที่สั้นแต่มีคุณภาพเพียงพอ
const DEFAULT_BLURHASH = 'L6PZfSi_.AyE_3t7t7R*0KtQ%MRj';

// กำหนดข้อมูลรูปที่โหลด global state
const loadedImagesMap = new Map<string, boolean>();
const loadingImagesMap = new Map<string, boolean>();

// ฟังก์ชั่นโหลดรูปล่วงหน้าที่มีประสิทธิภาพ
const preloadImages = (sources: string[]): Promise<void[]> => {
  const preloads = sources
    .filter(source => !loadedImagesMap.has(source) && !loadingImagesMap.has(source))
    .map(source => {
      loadingImagesMap.set(source, true);
      return ExpoImage.prefetch(source)
        .then(() => {
          loadedImagesMap.set(source, true);
          loadingImagesMap.delete(source);
        })
        .catch(() => {
          loadingImagesMap.delete(source);
        });
    });
  
  return Promise.all(preloads);
};

// Batch preload สำหรับทั้ง feed
export function preloadFeedImages(feedImages: string[][], visibleIndices: number[] = []): void {
  // สร้าง priority queue โดยให้รูปที่มองเห็นได้มาก่อน
  const highPriorityImages: string[] = [];
  const normalPriorityImages: string[] = [];

  // แยกรูปตาม priority
  feedImages.forEach((images, index) => {
    const isVisible = visibleIndices.includes(index);
    
    if (images.length > 0) {
      // รูปแรกของทุกโพสต์มี priority เสมอ
      const firstImage = images[0];
      if (!loadedImagesMap.has(firstImage)) {
        if (isVisible) {
          highPriorityImages.push(firstImage);
        } else {
          normalPriorityImages.push(firstImage);
        }
      }
      
      // รูปที่เหลือ
      images.slice(1).forEach(img => {
        if (!loadedImagesMap.has(img)) {
          if (isVisible) {
            normalPriorityImages.push(img);
          }
          // ไม่โหลดรูปที่เหลือของโพสต์ที่ไม่แสดง
        }
      });
    }
  });

  // ทำการโหลด high priority ทันที
  if (highPriorityImages.length > 0) {
    preloadImages(highPriorityImages);
  }
  
  // Delay สำหรับรูปที่ priority ต่ำกว่า
  if (normalPriorityImages.length > 0) {
    setTimeout(() => {
      preloadImages(normalPriorityImages);
    }, 100);
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
  const [isLoaded, setIsLoaded] = useState(loadedImagesMap.has(imageUrl));
  const mountedRef = useRef(true);
  const loadingStartedRef = useRef(false);

  // เริ่มโหลดทันทีที่ visible
  useEffect(() => {
    // ป้องกันการโหลดซ้ำซ้อน
    if (isVisible && !loadingStartedRef.current && !loadedImagesMap.has(imageUrl)) {
      loadingStartedRef.current = true;
      loadingImagesMap.set(imageUrl, true);
      
      // บังคับให้โหลดทันที
      if (isCurrentIndex) {
        ExpoImage.prefetch(imageUrl)
          .then(() => {
            if (mountedRef.current) {
              loadedImagesMap.set(imageUrl, true);
              loadingImagesMap.delete(imageUrl);
              setIsLoaded(true);
            }
          })
          .catch(() => {
            if (mountedRef.current) {
              loadingImagesMap.delete(imageUrl);
            }
          });
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, [imageUrl, isVisible, isCurrentIndex]);

  // สร้าง progressive loading เหมือน Instagram
  const thumbnailSource = isLoaded ? undefined : DEFAULT_BLURHASH;

  // อย่าแสดง animation เมื่อทำการเปลี่ยนรูป IG ไม่มี transition
  return (
    <View style={styles.slideContainer}>
      <Pressable
        onPress={onDoubleTap}
        style={styles.pinchableContainer}
      >
        <Pinchable>
          <ExpoImage
            source={{ uri: imageUrl }}
            style={styles.image}
            recyclingKey={imageKey}
            contentFit="cover"
            placeholder={thumbnailSource}
            placeholderContentFit="cover"
            transition={100}
            cachePolicy="memory-disk"
            contentPosition="center"
            priority={isCurrentIndex ? "high" : (isVisible ? "normal" : "low")}
            onLoad={() => {
              if (mountedRef.current) {
                loadedImagesMap.set(imageUrl, true);
                setIsLoaded(true);
              }
            }}
          />
        </Pinchable>
      </Pressable>
    </View>
  );
}, (prevProps, nextProps) => {
  // ป้องกันการ render ซ้ำเมื่อไม่จำเป็น
  return (
    prevProps.imageKey === nextProps.imageKey &&
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.isCurrentIndex === nextProps.isCurrentIndex &&
    prevProps.imageUrl === nextProps.imageUrl
  );
});

const styles = StyleSheet.create({
  slideContainer: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
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
    borderRadius: 8,
  },
}); 