import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PurpleGradientProps {
  style?: any;
  children?: React.ReactNode;
}

/**
 * A component that renders a purple gradient background similar to Instagram's dark theme
 */
const PurpleGradient: React.FC<PurpleGradientProps> = ({ style, children }) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#49155A', '#300742', '#1A0227']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});

export default PurpleGradient; 