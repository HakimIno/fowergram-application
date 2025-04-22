import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

interface PaginationProps {
  totalCount: number;
  currentIndex: number;
}

// Animated dot component for smoother transitions
const AnimatedDot = React.memo(({ isActive }: { isActive: boolean }) => {
  const width = useSharedValue(isActive ? 10 : 8);
  const opacity = useSharedValue(isActive ? 1 : 0.5);
  
  // Apply smooth animation when active state changes
  React.useEffect(() => {
    width.value = withSpring(isActive ? 10 : 8, {
      damping: 20,
      stiffness: 300,
      mass: 0.5
    });
    opacity.value = withTiming(isActive ? 1 : 0.5, {
      duration: 200
    });
  }, [isActive, width, opacity]);
  
  const dotStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
      backgroundColor: isActive ? 'white' : 'rgba(255, 255, 255, 0.5)',
      opacity: opacity.value
    };
  });
  
  return (
    <Animated.View
      style={[
        styles.paginationDot,
        dotStyle
      ]}
    />
  );
});

// Simple separator dot for pagination
const Separator = React.memo(() => (
  <View style={styles.paginationSeparator} />
));

export const OptimizedPagination = React.memo(({ totalCount, currentIndex }: PaginationProps) => {
  // Don't render pagination for single images
  if (totalCount <= 1) return null;

  // Using useMemo to avoid recreating dot array on every render
  const paginationDots = useMemo(() => {
    // Show up to 5 dots with ellipsis for the rest
    const maxVisibleDots = 5;
    
    if (totalCount <= maxVisibleDots) {
      // If we have few images, just show all dots
      return Array.from({ length: totalCount }).map((_, index) => (
        <AnimatedDot key={`dot-${index}`} isActive={currentIndex === index} />
      ));
    } else {
      // For many images, show current position with some context
      const dots = [];
      
      // Always show first dot
      dots.push(<AnimatedDot key="dot-first" isActive={currentIndex === 0} />);
      
      // If not at the beginning, show separator
      if (currentIndex > 1) {
        dots.push(<Separator key="sep-left" />);
      }
      
      // Show dot before current if not at beginning
      if (currentIndex > 0) {
        dots.push(<AnimatedDot key={`dot-prev`} isActive={false} />);
      }
      
      // Current dot
      dots.push(<AnimatedDot key={`dot-current`} isActive={true} />);
      
      // Show dot after current if not at end
      if (currentIndex < totalCount - 1) {
        dots.push(<AnimatedDot key={`dot-next`} isActive={false} />);
      }
      
      // If not at the end, show separator
      if (currentIndex < totalCount - 2) {
        dots.push(<Separator key="sep-right" />);
      }
      
      // Always show last dot
      dots.push(<AnimatedDot key="dot-last" isActive={currentIndex === totalCount - 1} />);
      
      return dots;
    }
  }, [totalCount, currentIndex]);

  // Use Animated.View for container with subtle scale effect on change
  const containerScale = useSharedValue(1);
  
  React.useEffect(() => {
    containerScale.value = withSpring(1.05, { damping: 15, stiffness: 120 });
    setTimeout(() => {
      containerScale.value = withSpring(1, { damping: 15, stiffness: 120 });
    }, 150);
  }, [currentIndex, containerScale]);
  
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: containerScale.value }]
    };
  });

  return (
    <View style={styles.paginationContainer}>
      <Animated.View style={[styles.paginationDotsContainer, containerStyle]}>
        {paginationDots}
      </Animated.View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
}); 