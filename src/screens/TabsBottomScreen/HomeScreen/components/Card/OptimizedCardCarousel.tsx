import React, { useCallback, useRef, useState, useMemo, memo } from 'react';
import { View, StyleSheet, GestureResponderEvent, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { OptimizedCardImage } from './OptimizedCardImage';
import { OptimizedPagination } from './OptimizedPagination';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const CAROUSEL_WIDTH = SCREEN_WIDTH - 16;

interface CardCarouselProps {
  images: string[];
  cardId: string;
  onDoubleTap: (event: GestureResponderEvent) => void;
  scrollY?: Animated.SharedValue<number>;
  lastScrollY?: Animated.SharedValue<number>;
}

// แสดงรูปแรกทันที (สำหรับกรณีมีรูปเดียว)
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

// Carousel ที่ปรับปรุงใหม่ - แสดงรูปทุกรูปเมื่อเลื่อนไปถึง
export const OptimizedCardCarousel = memo(({
  images,
  cardId,
  onDoubleTap,
  scrollY,
  lastScrollY
}: CardCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flashListRef = useRef<FlashList<string>>(null);
  
  // ค่าสำหรับการซ่อน/แสดง pagination
  const paginationOpacity = useSharedValue(1);
  
  // สร้าง scrollHandler เพื่อตรวจจับการเลื่อนและซ่อน/แสดง pagination
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    'worklet'; // ทำงานบน UI thread โดยตรงเพื่อประสิทธิภาพ
    
    if (scrollY && lastScrollY) {
      // ส่งค่า scroll event ไปยัง parent
      scrollY.value = event.nativeEvent.contentOffset.y;
      
      // ถ้าเลื่อนลง (scrollY เพิ่มขึ้น) ให้ซ่อน pagination
      if (scrollY.value > lastScrollY.value + 5) {
        paginationOpacity.value = withTiming(0, { duration: 300, easing: Easing.ease });
      } 
      // ถ้าเลื่อนขึ้น (scrollY ลดลง) ให้แสดง pagination
      else if (scrollY.value < lastScrollY.value - 5) {
        paginationOpacity.value = withTiming(1, { duration: 300, easing: Easing.ease });
      }
      
      lastScrollY.value = scrollY.value;
    }
  }, [scrollY, lastScrollY, paginationOpacity]);
  
  // สร้าง animated style สำหรับ pagination
  const paginationAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: paginationOpacity.value,
      transform: [
        { translateY: withTiming(paginationOpacity.value === 0 ? 20 : 0, { duration: 200 }) }
      ]
    };
  });

  // render รูปภาพทุกรูป
  const renderImage = useCallback(({ item: imageUrl, index }: { item: string, index: number }) => {
    const imageKey = `${cardId}-image-${index}`;
    const isCurrentIndex = index === currentIndex;

    return (
      <OptimizedCardImage
        imageUrl={imageUrl}
        imageKey={imageKey}
        onDoubleTap={onDoubleTap}
        isVisible={true}
        isCurrentIndex={isCurrentIndex}
      />
    );
  }, [cardId, currentIndex, onDoubleTap]);

  // Key extractor
  const keyExtractor = useCallback((item: string, index: number) => {
    return `${cardId}-image-${index}`;
  }, [cardId]);

  // ตั้งค่า FlashList
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
    onScroll: scrollY && lastScrollY ? handleScroll : undefined,
    onMomentumScrollEnd: (e: any) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / CAROUSEL_WIDTH);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        // แสดง pagination เมื่อหยุดเลื่อน
        paginationOpacity.value = withTiming(1, { duration: 300, easing: Easing.ease });
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
    overrideItemLayout: (_: any, __: string, index: number, layout: any) => {
      if (layout && typeof layout === 'object') {
        layout.size = { width: CAROUSEL_WIDTH, height: CAROUSEL_WIDTH / 0.8 };
      }
    },
  }), [images, renderImage, keyExtractor, currentIndex, handleScroll, scrollY, lastScrollY, paginationOpacity]);

  if (!images || images.length === 0) {
    return null;
  }

  // กรณีมีรูปเดียว ไม่ต้องแสดง carousel
  if (images.length === 1) {
    return (
      <View style={styles.carouselContainer}>
        <FirstImageRenderer
          imageUrl={images[0]}
          imageKey={`${cardId}-image-0`}
          onDoubleTap={onDoubleTap}
        />
      </View>
    );
  }

  // แสดงรูปหลายรูปแบบ carousel
  return (
    <View style={styles.carouselContainer}>
      <FlashList
        ref={flashListRef}
        {...flashListProps}
      />

      {images.length > 1 && (
        <Animated.View style={[styles.paginationContainer, paginationAnimatedStyle]}>
          <OptimizedPagination
            totalCount={images.length}
            currentIndex={currentIndex}
          />
        </Animated.View>
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
  paginationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 8,
  }
}); 