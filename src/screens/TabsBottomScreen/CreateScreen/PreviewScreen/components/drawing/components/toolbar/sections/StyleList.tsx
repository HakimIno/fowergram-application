import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import StyleOption from '../StyleOption';
import { StrokeStyleType } from '../../../types';
import { STROKE_STYLES } from '../../../constants';

interface StyleListProps {
  selectedStyle: StrokeStyleType;
  onStyleSelect: (style: StrokeStyleType) => void;
}

const StyleList = React.memo(({ selectedStyle, onStyleSelect }: StyleListProps) => (
  <FlashList
    data={STROKE_STYLES}
    extraData={selectedStyle}
    renderItem={({ item: style }) => (
      <StyleOption
        style={style}
        isSelected={selectedStyle === style.type}
        onPress={() => onStyleSelect(style.type)}
      />
    )}
    keyExtractor={(item) => item.type}
    horizontal
    estimatedItemSize={90}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 20 }}
    bounces={false}
    overScrollMode="never"
    ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
  />
));



export default StyleList; 