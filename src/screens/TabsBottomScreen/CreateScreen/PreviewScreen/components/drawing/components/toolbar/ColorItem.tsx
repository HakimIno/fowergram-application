import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

interface ColorItemProps {
  color: string, 
  isSelected: boolean, 
  onPress: () => void 
}

const ColorItem = React.memo(({ 
  color, 
  isSelected, 
  onPress 
}: ColorItemProps) => (
  <TouchableOpacity
    style={[
      styles.colorOption,
      { backgroundColor: color },
      isSelected && styles.selectedOption,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  />
));

const styles = StyleSheet.create({
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#333',
  },
  selectedOption: {
    borderColor: '#007AFF',
    borderWidth: 1,
    backgroundColor: '#0A3A8F',
  },
});

export default ColorItem; 