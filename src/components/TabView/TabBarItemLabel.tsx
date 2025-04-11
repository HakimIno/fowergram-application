import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { Animated, StyleSheet } from 'react-native';

interface TabBarItemLabelProps {
  color: string;
  label?: string;
  style: StyleProp<TextStyle>;
  icon: React.ReactNode;
}

export const TabBarItemLabel = React.memo(
  ({ color, label, style, icon }: TabBarItemLabelProps) => {
    if (!label) {
      return null;
    }

    return (
      <Animated.Text
        style={[
          styles.label,
          icon ? { marginTop: 0 } : null,
          style,
          { color: color },
        ]}
      >
        {label}
      </Animated.Text>
    );
  }
);

TabBarItemLabel.displayName = 'TabBarItemLabel';

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
});
