import React from 'react';
import { StyleSheet } from 'react-native';
import Stories from '../Story';
import type { StoryItem } from '../Story';

interface StoriesHeaderProps {
  stories: StoryItem[];
  isDarkMode: boolean;
}

// Use Stories component as memoized to reduce re-renders
export const MemoizedStoriesHeader = React.memo(
  ({ stories, isDarkMode }: StoriesHeaderProps) => {
    if (stories.length === 0) return null;
    return <Stories stories={stories} isDarkMode={isDarkMode} />;
  },
  (prevProps, nextProps) => {
    // Only re-render if stories length changes or theme changes
    return (
      prevProps.stories.length === nextProps.stories.length &&
      prevProps.isDarkMode === nextProps.isDarkMode
    );
  }
); 