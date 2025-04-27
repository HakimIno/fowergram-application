import React, { useRef } from 'react';
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
}

// Optimized FeedItem component that minimizes re-renders
export const FeedItem = React.memo(({
  item,
  index,
  navigation
}: FeedItemProps) => {
  const stableKey = useRef(`feed-item-${item.id}`).current;

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
}, (prevProps, nextProps) => {
  // Prevent unnecessary re-renders
  return prevProps.item.id === nextProps.item.id &&
    prevProps.index === nextProps.index;
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  }
}); 