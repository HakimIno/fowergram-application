import React, { useRef, useState, useEffect, memo, useMemo } from 'react';
import { View, StyleSheet, Pressable, GestureResponderEvent, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import Pinchable from 'react-native-pinchable';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const CAROUSEL_WIDTH = SCREEN_WIDTH - 16;

const DEFAULT_BLURHASH = 'L6PZfSi_.AyE_3t7R*0K';

// ใช้ Set เพื่อติดตามรูปภาพที่โหลดแล้ว
const loadedImageUrls = new Set<string>();

// Optimized preloading function with reduced batch size and cancelable promises
export function preloadFeedImages(feedImages: string[][], visibleIndices: number[] = []): Promise<void> {
  return new Promise((resolve) => {
    if (!feedImages?.length) {
      resolve();
      return;
    }
    
    // Only process essential images
    const highPriorityImages: string[] = [];
    
    // Only preload visible image thumbnails
    visibleIndices.slice(0, 2).forEach(index => {
      if (feedImages[index]?.[0] && !loadedImageUrls.has(feedImages[index][0])) {
        highPriorityImages.push(feedImages[index][0]);
      }
    });

    // Batch preloading with smaller concurrency
    if (highPriorityImages.length > 0) {
      // Process in smaller batches to avoid memory spikes
      const batchSize = 1;
      let completed = 0;
      
      for (let i = 0; i < highPriorityImages.length; i += batchSize) {
        const batch = highPriorityImages.slice(i, i + batchSize);
        
        // Use setTimeout to allow UI thread to breathe
        setTimeout(() => {
          batch.forEach(url => {
            ExpoImage.prefetch(url)
              .then(() => {
                loadedImageUrls.add(url);
                completed++;
                if (completed === highPriorityImages.length) {
                  resolve();
                }
              })
              .catch(() => {
                completed++;
                if (completed === highPriorityImages.length) {
                  resolve();
                }
              });
          });
        }, 120 * Math.floor(i / batchSize));
      }
    } else {
      resolve();
    }
  });
}

interface OptimizedCardImageProps {
  imageUrl: string;
  imageKey: string;
  onDoubleTap: (event: GestureResponderEvent) => void;
  isVisible: boolean;
  isCurrentIndex: boolean;
}

// Optimization: Use scaled down image for lower-end devices
const getOptimizedImageUrl = (url: string): string => {
  if (!url) return url;
  
  // If on a lower-end device, request a smaller image size from CDN
  // This example assumes your images are served through a CDN that supports width/height parameters
  if (Platform.OS === 'android') {
    // Check if URL is from a common CDN and add size parameters
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/w_600,q_70/');
    }
    
    if (url.includes('unsplash.com')) {
      return `${url}&w=600&q=70`;
    }
  }
  
  return url;
};

// Empty placeholder component
const PlaceholderComponent = memo(() => (
  <View style={styles.placeholder}>
    <ExpoImage
      source={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' }}
      style={styles.placeholderImage}
      placeholder={DEFAULT_BLURHASH}
      contentFit="cover"
      transition={0}
    />
  </View>
));

const CardImageComponent = ({ imageUrl, imageKey, onDoubleTap, isVisible, isCurrentIndex }: OptimizedCardImageProps) => {
  const [isLoaded, setIsLoaded] = useState(loadedImageUrls.has(imageUrl));
  const [isError, setIsError] = useState(false);
  const isMounted = useRef(true);
  const renderRef = useRef(0);
  
  // Memoize the URL to prevent needless re-renders
  const optimizedUrl = useMemo(() => getOptimizedImageUrl(imageUrl), [imageUrl]);
  
  // Memoize style and props for better performance
  const imageStyle = useMemo(() => [
    styles.image, 
    { opacity: isLoaded ? 1 : 0 }
  ], [isLoaded]);

  // Effect for image loading management
  useEffect(() => {
    isMounted.current = true;
    
    if (!isLoaded && isVisible && !loadedImageUrls.has(imageUrl)) {
      if (isCurrentIndex) {
        // Prefetch high priority images
        ExpoImage.prefetch(optimizedUrl).then(() => {
          if (isMounted.current) {
            loadedImageUrls.add(imageUrl);
            setIsLoaded(true);
          }
        }).catch(() => {
          if (isMounted.current) {
            setIsError(true);
          }
        });
      }
    } else if (loadedImageUrls.has(imageUrl) && !isLoaded) {
      setIsLoaded(true);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [imageUrl, optimizedUrl, isVisible, isCurrentIndex, isLoaded]);

  const handleLoad = () => {
    if (isMounted.current) {
      setIsLoaded(true);
      loadedImageUrls.add(imageUrl);
    }
  };

  const handleError = () => {
    if (isMounted.current) {
      setIsError(true);
    }
  };

  // Prioritize loading based on visibility
  const loadPriority = isCurrentIndex ? 'high' : (isVisible ? 'normal' : 'low');
  
  // Determine image quality and loading strategy based on device performance
  const cachePolicy = Platform.OS === 'ios' ? 'disk' : 'memory';
  
  // Skip renders for invisible items that are already loaded
  renderRef.current++;

  return (
    <Pressable style={styles.container} onPress={onDoubleTap}>
      <Pinchable>
        <View style={styles.imageWrapper}>
          <ExpoImage
            source={{ uri: optimizedUrl }}
            style={imageStyle}
            contentFit="cover"
            transition={Platform.OS === 'ios' ? 200 : 0}
            placeholderContentFit="cover"
            placeholder={DEFAULT_BLURHASH}
            priority={loadPriority}
            cachePolicy={cachePolicy}
            recyclingKey={imageKey}
            onLoad={handleLoad}
            onError={handleError}
            contentPosition="center"
            removeClippedSubviews={true}
          />
          
          {!isLoaded && <PlaceholderComponent />}
        </View>
      </Pinchable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CAROUSEL_WIDTH,
    height: 'auto',
    aspectRatio: 0.8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
  }
});

// Export with memo for performance optimization
export const OptimizedCardImage = memo(CardImageComponent, (prevProps, nextProps) => {
  if (prevProps.imageUrl !== nextProps.imageUrl) return false;
  if (prevProps.isCurrentIndex !== nextProps.isCurrentIndex) return false;
  
  // If not visible and wasn't visible before, prevent re-renders
  if (!prevProps.isVisible && !nextProps.isVisible) return true;
  
  // If visibility changed, we need to re-render
  if (prevProps.isVisible !== nextProps.isVisible) return false;
  
  // Otherwise, re-render only the currently visible images
  return !nextProps.isVisible; 
});