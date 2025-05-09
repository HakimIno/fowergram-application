import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OptimizedCard } from '../Card/OptimizedCard';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomBarParamList } from 'src/navigation/types';

export type HomeNavigationProp = StackNavigationProp<BottomBarParamList, "bottom_bar_home">;

export interface FeedInfo {
  id: string;
  images: string[];
  title: string;
  likes: string;
  comments: number;
  description: string;
  isVideo: boolean;
  video?: string;
}

interface FeedItemProps {
  item: FeedInfo;
  index: number;
  navigation: HomeNavigationProp;
  onVisible?: (item: FeedInfo) => void;
}

// Define component function first
const FeedItemComponent = ({
  item,
  index,
  navigation,
  onVisible
}: FeedItemProps) => {
  const stableKey = React.useRef(`feed-item-${item.id}`).current;
  
  // Call onVisible when the component mounts
  React.useEffect(() => {
    if (onVisible) {
      onVisible(item);
    }
  }, [item, onVisible]);

  return (
    <View key={stableKey} style={styles.container}>
      <OptimizedCard
        navigation={navigation}
        images={item.images}
        caption={item.description}
        title={item.title}
        likes={item.likes}
        cardIndex={index}
        isVisible={true}
      />
    </View>
  );
};

// Define compare function outside the component
function areEqual(prevProps: FeedItemProps, nextProps: FeedItemProps) {
  return prevProps.item.id === nextProps.item.id &&
    prevProps.index === nextProps.index;
}

// Export memoized component with proper comparison function
export const FeedItem = React.memo(FeedItemComponent, areEqual);

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  }
}); 