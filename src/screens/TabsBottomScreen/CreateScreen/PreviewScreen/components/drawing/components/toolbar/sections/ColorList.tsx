import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import ColorItem from '../ColorItem';
import { COLORS } from '../../../constants';

interface ColorListProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorList = React.memo(({ selectedColor, onColorSelect }: ColorListProps) => (
  <FlashList
    data={COLORS}
    extraData={selectedColor}
    renderItem={({ item }) => (
      <ColorItem 
        color={item} 
        isSelected={selectedColor === item} 
        onPress={() => onColorSelect(item)} 
      />
    )}
    keyExtractor={(item) => item}
    horizontal
    estimatedItemSize={50}
    showsHorizontalScrollIndicator={false}
    bounces={false}
    overScrollMode="never"
    ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
  />
));

export default ColorList; 