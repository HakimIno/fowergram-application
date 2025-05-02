import React, { forwardRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet';
import ColorPicker, { Panel1, HueSlider, OpacitySlider } from 'reanimated-color-picker';

interface ColorPickerSheetProps {
  selectedColor: string;
  onSelectColor: ({ hex }: { hex: string }) => void;
  onConfirm: () => void;
}

const ColorPickerSheet = forwardRef<BottomSheetMethods, ColorPickerSheetProps>(
  ({ selectedColor, onSelectColor, onConfirm }, ref) => (
    <BottomSheet
      ref={ref}
      title="เลือกสี"
      isDark={true}
      handleClose={() => { }}
      headerRight={
        <TouchableOpacity onPress={onConfirm}>
          <MaterialCommunityIcons name="check" size={24} color="#007AFF" />
        </TouchableOpacity>
      }
      headerLeft={
        <TouchableOpacity onPress={() => {
          if (ref && 'current' in ref && ref.current) {
            ref.current.close();
          }
        }}>
          <MaterialCommunityIcons name="close" size={24} color="#999" />
        </TouchableOpacity>
      }
    >
      <View style={styles.bottomSheetContent}>
        <ColorPicker
          value={selectedColor}
          onComplete={onSelectColor}
          style={{
            width: '100%',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <Panel1 style={styles.colorPanel} thumbSize={20} />
          <HueSlider style={styles.slider} thumbSize={24} />
          <OpacitySlider style={styles.slider} thumbSize={24} />
        </ColorPicker>
      </View>
    </BottomSheet>
  )
);

const styles = StyleSheet.create({
  bottomSheetContent: {

    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  colorPanel: {
    borderRadius: 10,
    height: 100,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default ColorPickerSheet; 