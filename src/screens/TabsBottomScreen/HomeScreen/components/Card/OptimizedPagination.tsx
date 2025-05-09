import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  cancelAnimation
} from 'react-native-reanimated';

interface PaginationProps {
  totalCount: number;
  currentIndex: number;
}

// Simplified dot component with lighter animations
const Dot = React.memo(({ isActive }: { isActive: boolean }) => {
  return (
    <View
      style={[
        styles.paginationDot,
        {
          width: isActive ? 10 : 8,
          backgroundColor: isActive ? 'white' : 'rgba(255, 255, 255, 0.5)',
          opacity: isActive ? 1 : 0.5
        }
      ]}
    />
  );
});

// Simple separator dot
const Separator = React.memo(() => (
  <View style={styles.paginationSeparator} />
));

export const OptimizedPagination = React.memo(({ totalCount, currentIndex }: PaginationProps) => {
  // Don't render pagination for single images
  if (totalCount <= 1) return null;

  // Track the active index and animate only the active indicator position
  const activePosition = useSharedValue(currentIndex);
  
  // Update the active position with a light animation
  React.useEffect(() => {
    // Cancel any ongoing animations first
    cancelAnimation(activePosition);
    
    // Use a fast timing function for smooth transitions
    activePosition.value = withTiming(currentIndex, { 
      duration: 150
    });
    
    // Cleanup animations on unmount
    return () => {
      cancelAnimation(activePosition);
    };
  }, [currentIndex, activePosition]);
  
  // Animated style for the active indicator overlay
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: activePosition.value * 12 }]
    };
  });

  // Generate static dots - no animations for individual dots
  const staticDots = useMemo(() => {
    if (totalCount <= 5) {
      // For few images, show all dots
      return Array.from({ length: totalCount }).map((_, index) => (
        <Dot key={`dot-${index}`} isActive={false} />
      ));
    } else {
      // For many images, show all but use a simplified view
      return Array.from({ length: totalCount }).map((_, index) => (
        <Dot key={`dot-${index}`} isActive={false} />
      ));
    }
  }, [totalCount]);
  
  return (
    <View style={styles.paginationContainer}>
      <View style={styles.paginationDotsContainer}>
        {/* Static background dots */}
        {staticDots}
        
        {/* Single animated active dot overlay */}
        <Animated.View 
          style={[
            styles.activeDotContainer,
            indicatorStyle
          ]}
        >
          <View style={styles.activeDot} />
        </Animated.View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if current index or total count changes
  return prevProps.currentIndex === nextProps.currentIndex &&
         prevProps.totalCount === nextProps.totalCount;
});

const styles = StyleSheet.create({
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    zIndex: 10,
  },
  paginationDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 6,
  },
  paginationDot: {
    height: 3,
    width: 8,
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
  paginationSeparator: {
    width: 4,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDotContainer: {
    position: 'absolute',
    left: 2, // Account for the marginHorizontal of dots
    top: 1.5,
    zIndex: 1,
  },
  activeDot: {
    width: 10,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'white'
  }
}); 