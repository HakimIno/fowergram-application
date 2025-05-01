import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { StrokeStyleType } from '../../types';
import StrokeStylePreview from './StrokeStylePreview';

interface StyleOptionProps {
  style: { type: StrokeStyleType, label: string }, 
  isSelected: boolean, 
  onPress: () => void 
}

const StyleOption = React.memo(({ 
  style, 
  isSelected, 
  onPress 
}: StyleOptionProps) => (
  <TouchableOpacity
    style={[
      styles.styleOption,
      isSelected && {
        borderColor: '#007AFF',
        borderWidth: 0.5,
        backgroundColor: '#0A3A8F',
      }
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <StrokeStylePreview style={style.type} />
    <Text style={styles.styleLabel}>{style.label}</Text>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  styleOption: {
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
    minWidth: 70,
    backgroundColor: '#2A2A2A',
  },
  styleLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'Chirp_Medium',
    color: '#E0E0E0',
  },
});

export default StyleOption; 