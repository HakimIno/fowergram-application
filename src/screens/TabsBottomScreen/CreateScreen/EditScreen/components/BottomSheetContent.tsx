import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';

interface BottomSheetContentProps {
  children: React.ReactNode;
}

export const BottomSheetContent: React.FC<BottomSheetContentProps> = ({ children }) => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={false}
        scrollEventThrottle={16}
        alwaysBounceVertical={false}
      >
        {children}
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
}); 