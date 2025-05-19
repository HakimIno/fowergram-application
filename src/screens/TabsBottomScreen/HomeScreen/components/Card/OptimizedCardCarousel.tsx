import React, { useCallback, useRef, useState, useMemo, memo } from 'react';
import { View, StyleSheet, GestureResponderEvent, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { OptimizedCardImage } from './OptimizedCardImage';
import { OptimizedPagination } from './OptimizedPagination';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation
} from 'react-native-reanimated';

// Constants
const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const CAROUSEL_WIDTH = SCREEN_WIDTH - 16;
const IS_IOS = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';
const IS_HIGH_END_DEVICE = IS_IOS || (IS_ANDROID && parseInt(Platform.Version.toString(), 10) >= 26); // Android 8.0+
const SCROLL_EVENT_THROTTLE = IS_IOS ? 8 : 16; // 120fps on iOS, 60fps on Android
const ANIMATION_DURATION = IS_HIGH_END_DEVICE ? 250 : 300;
const ANIMATION_DURATION_FAST = IS_HIGH_END_DEVICE ? 150 : 200;
const SCROLL_THRESHOLD = 5;
const EASING = IS_HIGH_END_DEVICE ? Easing.out(Easing.cubic) : Easing.linear;

interface CardCarouselProps {
  images: string[];
  cardId: string;
  onDoubleTap: (event: GestureResponderEvent) => void;
  scrollY?: Animated.SharedValue<number>;
  lastScrollY?: Animated.SharedValue<number>;
}

const FirstImageRenderer = memo(({ imageUrl, imageKey, onDoubleTap }: {
  imageUrl: string;
  imageKey: string;
  onDoubleTap: (event: GestureResponderEvent) => void
}) => (
  <OptimizedCardImage
    imageUrl={imageUrl}
    imageKey={imageKey}
    onDoubleTap={onDoubleTap}
    isVisible={true}
    isCurrentIndex={true}
  />
));

export const OptimizedCardCarousel = memo(({
  images,
  cardId,
  onDoubleTap,
  scrollY,
  lastScrollY
}: CardCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flashListRef = useRef<FlashList<string>>(null);
  const paginationOpacity = useSharedValue(1);
  const pendingIndexRef = useRef<number | null>(null);
  
  const updateCurrentIndex = useCallback((newIndex: number) => {
    if (newIndex !== currentIndex) {
      pendingIndexRef.current = null;
      setCurrentIndex(newIndex);
    }
  }, [currentIndex]);
  
  const prepareIndexUpdate = useCallback((newIndex: number) => {
    pendingIndexRef.current = newIndex;
    runOnJS(updateCurrentIndex)(newIndex);
  }, [updateCurrentIndex]);
  
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    'worklet';
    
    if (!scrollY || !lastScrollY) return;
    
    scrollY.value = event.nativeEvent.contentOffset.y;
    
    if (scrollY.value > lastScrollY.value + SCROLL_THRESHOLD) {
      // Cancel any ongoing animations for better performance during fast scrolling
      cancelAnimation(paginationOpacity);
      paginationOpacity.value = withTiming(0, { 
        duration: ANIMATION_DURATION, 
        easing: EASING
      });
    } 
    else if (scrollY.value < lastScrollY.value - SCROLL_THRESHOLD) {
      cancelAnimation(paginationOpacity);
      paginationOpacity.value = withTiming(1, { 
        duration: ANIMATION_DURATION, 
        easing: EASING
      });
    }
    
    lastScrollY.value = scrollY.value;
  }, [scrollY, lastScrollY]);
  
  const paginationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: paginationOpacity.value,
    transform: [
      { translateY: withTiming(paginationOpacity.value === 0 ? 20 : 0, { 
        duration: ANIMATION_DURATION_FAST,
        easing: EASING 
      })}
    ]
  }), []);

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

  const keyExtractor = useCallback((item: string, index: number) => (
    `${cardId}-image-${index}`
  ), [cardId]);

  const handleMomentumEnd = useCallback((e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / CAROUSEL_WIDTH);
    
    if (newIndex !== currentIndex) {
      // Use requestAnimationFrame to optimize UI updates
      requestAnimationFrame(() => {
        setCurrentIndex(newIndex);
      });
      
      cancelAnimation(paginationOpacity);
      paginationOpacity.value = withTiming(1, { 
        duration: ANIMATION_DURATION, 
        easing: EASING
      });
    }
  }, [currentIndex, paginationOpacity]);

  const handleScrollFailed = useCallback((info: any) => {
    if (!flashListRef.current || !images?.length) return;
    
    setTimeout(() => {
      if (flashListRef.current) {
        flashListRef.current.scrollToIndex({
          index: Math.min(info.index, images.length - 1),
          animated: false
        });
      }
    }, IS_ANDROID ? 100 : 50);
  }, [images?.length]);

  const handleItemLayout = useCallback((
    _: any, 
    __: string, 
    index: number, 
    layout: any
  ) => {
    if (layout && typeof layout === 'object') {
      layout.size = { 
        width: CAROUSEL_WIDTH, 
        height: CAROUSEL_WIDTH / 0.8 
      };
    }
  }, []);

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
    scrollEventThrottle: SCROLL_EVENT_THROTTLE,
    disableIntervalMomentum: true,
    onScroll: scrollY && lastScrollY ? handleScroll : undefined,
    onMomentumScrollEnd: handleMomentumEnd,
    onScrollToIndexFailed: handleScrollFailed,
    overrideItemLayout: handleItemLayout,
    removeClippedSubviews: true,
  }), [
    images, 
    renderImage, 
    keyExtractor, 
    handleScroll, 
    scrollY, 
    lastScrollY, 
    handleMomentumEnd,
    handleScrollFailed,
    handleItemLayout
  ]);

  if (!images || images.length === 0) {
    return null;
  }

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