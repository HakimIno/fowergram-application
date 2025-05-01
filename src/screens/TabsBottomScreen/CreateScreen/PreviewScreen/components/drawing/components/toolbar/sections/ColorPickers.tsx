import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import ColorList from './ColorList';

interface ColorPickersProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  onOpenColorPicker: () => void;
}

const ColorPickers = React.memo(({ 
  selectedColor,
  onColorSelect,
  onOpenColorPicker
}: ColorPickersProps) => {

  return (
    <View style={styles.toolbarSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>สี</Text>
        <TouchableOpacity onPress={onOpenColorPicker} style={styles.eyedropperButton}>
          <Ionicons name="color-palette-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.colorPickerContainer}>
        <ColorList 
          selectedColor={selectedColor} 
          onColorSelect={onColorSelect} 
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  toolbarSection: {
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#E0E0E0',
  },
  eyedropperButton: {
    padding: 4,
  },
  colorPickerContainer: {
    height: 50,
  },
});

export default ColorPickers; 