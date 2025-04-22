import React, { useCallback, useRef, useState, useMemo, memo, useEffect } from 'react';
import { View, StyleSheet, GestureResponderEvent, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { OptimizedCardImage } from './OptimizedCardImage';
import { OptimizedPagination } from './OptimizedPagination';
import { Image as ExpoImage } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const CAROUSEL_WIDTH = SCREEN_WIDTH - 16;

interface CardCarouselProps {
  images: string[];
  cardId: string;
  onDoubleTap: (event: GestureResponderEvent) => void;
}

// แสดงเฉพาะรูปแรกทันทีเพื่อการแสดงผลที่รวดเร็ว
const FirstImageRenderer = memo(({ imageUrl, imageKey, onDoubleTap }: { 
  imageUrl: string; 
  imageKey: string; 
  onDoubleTap: (event: GestureResponderEvent) => void 
}) => {
  return (
    <OptimizedCardImage
      imageUrl={imageUrl}
      imageKey={imageKey}
      onDoubleTap={onDoubleTap}
      isVisible={true}
      isCurrentIndex={true}
    />
  );
});

// Optimized carousel component with memory management and reduced re-renders
export const OptimizedCardCarousel = memo(({
  images,
  cardId,
  onDoubleTap
}: CardCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flashListRef = useRef<FlashList<string>>(null);
  const [isFlashListReady, setIsFlashListReady] = useState(false);
  
  // เริ่มต้นเตรียม flashlist ทันที แต่จะแสดงรูปแรกก่อนเสมอ
  useEffect(() => {
    // Prefetch รูปแรกทันที
    if (images?.length > 0) {
      ExpoImage.prefetch(images[0]);
    }
    
    const timer = setTimeout(() => {
      setIsFlashListReady(true);
    }, 50); // ลดเวลาลงเพื่อเริ่ม render FlashList เร็วขึ้น
    
    return () => clearTimeout(timer);
  }, [images]);

  // คำนวณว่ารูปภาพไหนควรถูกโหลดเต็ม
  const getImageVisibility = useCallback((index: number) => {
    const distance = Math.abs(index - currentIndex);
    return distance <= 1; // เฉพาะรูปปัจจุบัน รูปก่อนหน้า และรูปถัดไป
  }, [currentIndex]);

  // ทำ rendering แบบ optimized
  const renderImage = useCallback(({ item: imageUrl, index }: { item: string, index: number }) => {
    const imageKey = `${cardId}-image-${index}`;
    const isVisible = getImageVisibility(index);
    const isCurrentIndex = index === currentIndex;

    return (
      <OptimizedCardImage
        imageUrl={imageUrl}
        imageKey={imageKey}
        onDoubleTap={onDoubleTap}
        isVisible={isVisible}
        isCurrentIndex={isCurrentIndex}
      />
    );
  }, [cardId, getImageVisibility, currentIndex, onDoubleTap]);

  // Key extractor ที่คงที่
  const keyExtractor = useCallback((item: string, index: number) => {
    return `${cardId}-image-${index}`;
  }, [cardId]);

  // ตั้งค่า FlashList แบบ optimized
  const flashListProps = useMemo(() => ({
    data: images,
    renderItem: renderImage,
    keyExtractor,
    horizontal: true,
    pagingEnabled: true,
    showsHorizontalScrollIndicator: false,
    estimatedItemSize: CAROUSEL_WIDTH,
    snapToInterval: CAROUSEL_WIDTH,
    decelerationRate: "fast" as const,
    overScrollMode: "never" as const,
    initialScrollIndex: 0,
    disableIntervalMomentum: true, // ป้องกันการเลื่อนเกินหน้า
    onMomentumScrollEnd: (e: any) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / CAROUSEL_WIDTH);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    },
    onScrollToIndexFailed: (info: any) => {
      // หากไม่สามารถเลื่อนได้ ให้ลองใหม่
      setTimeout(() => {
        if (flashListRef.current && images?.length > 0) {
          flashListRef.current.scrollToIndex({
            index: Math.min(info.index, images.length - 1),
            animated: false
          });
        }
      }, 50);
    },
    // กำหนดขนาดที่แน่นอนเพื่อป้องกันการ re-layout
    overrideItemLayout: (_: any, __: string, index: number, layout: any) => {
      layout.size = CAROUSEL_WIDTH;
    },
  }), [images, renderImage, keyExtractor, currentIndex]);

  // โหลดรูปถัดไปเมื่อมีการเลื่อน
  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    // เตรียมรูปสำหรับเลื่อน
    const nextIndex = Math.min(currentIndex + 1, images.length - 1);
    const prevIndex = Math.max(currentIndex - 1, 0);
    
    // Prefetch ทั้งรูปถัดไปและรูปก่อนหน้า
    if (nextIndex !== currentIndex) {
      ExpoImage.prefetch(images[nextIndex]);
    }
    
    if (prevIndex !== currentIndex && prevIndex !== nextIndex) {
      ExpoImage.prefetch(images[prevIndex]);
    }
  }, [currentIndex, images]);

  if (!images || images.length === 0) {
    return null;
  }

  // แสดงเฉพาะรูปแรกหากยังไม่พร้อมหรือมีเพียงรูปเดียว
  if (!isFlashListReady || images.length === 1) {
    return (
      <View style={styles.carouselContainer}>
        <FirstImageRenderer 
          imageUrl={images[0]} 
          imageKey={`${cardId}-image-0`}
          onDoubleTap={onDoubleTap}
        />
        
        {images.length > 1 && (
          <OptimizedPagination 
            totalCount={images.length}
            currentIndex={currentIndex}
          />
        )}
      </View>
    );
  }

  // แสดง FlashList เมื่อพร้อม
  return (
    <View style={styles.carouselContainer}>
      <FlashList
        ref={flashListRef}
        {...flashListProps}
      />
      
      {images.length > 1 && (
        <OptimizedPagination 
          totalCount={images.length}
          currentIndex={currentIndex}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  carouselContainer: {
    width: CAROUSEL_WIDTH,
    height: 'auto',
    aspectRatio: 0.8,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
}); 