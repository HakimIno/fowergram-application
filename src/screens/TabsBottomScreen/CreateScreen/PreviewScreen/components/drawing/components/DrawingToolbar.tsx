import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Image, Alert, SafeAreaView } from 'react-native';
import { StrokeStyleType, ToolMode } from '../types';
import { runOnJS } from 'react-native-reanimated';
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet';


// Import components from the toolbar folder
import {
  ToolSelector,
  BrushSizeSlider,
  ColorPickers,
  StylePicker,
  ColorPickerSheet
} from './toolbar';

interface DrawingToolbarProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  selectedWidth: number;
  onWidthSelect: (width: number) => void;
  selectedStyle: StrokeStyleType;
  onStyleSelect: (style: StrokeStyleType) => void;
  toolMode: ToolMode;
  onToolModeChange: (mode: ToolMode) => void;
  smoothingLevel?: number;
  onSmoothingChange?: (value: number) => void;
  show: boolean;
  onToggle: () => void;
}




const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  selectedColor,
  onColorSelect,
  selectedWidth,
  onWidthSelect,
  selectedStyle,
  onStyleSelect,
  toolMode,
  onToolModeChange,
  smoothingLevel = 0.5,
  onSmoothingChange,
  show,
  onToggle,
}) => {
  // State
  const [brushSize, setBrushSize] = useState(selectedWidth);

  // Refs
  const slideAnim = useRef(new Animated.Value(show ? 0 : 300)).current;
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  // Event handlers
  const handleSizeChange = useCallback((newValue: number) => {
    setBrushSize(newValue);
    onWidthSelect(newValue);
  }, [onWidthSelect]);


  const handleOpenColorPicker = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleColorConfirm = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  // Safe function for updating color from worklet
  const updateColor = useCallback((hex: string) => {
    onColorSelect(hex);
  }, [onColorSelect]);

  const onSelectColor = useCallback(({ hex }: { hex: string }) => {
    'worklet';
    runOnJS(updateColor)(hex);
  }, [updateColor]);

  // Animation effect for toolbar slide
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: show ? 0 : 300,
      useNativeDriver: true,
      tension: 70,
      friction: 12
    }).start();
  }, [show, slideAnim]);

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.toolbar]}>
        {/* <ToolSelector
          toolMode={toolMode}
          onToolModeChange={onToolModeChange}
        /> */}

        <BrushSizeSlider
          toolMode={toolMode}
          brushSize={brushSize}
          onSizeChange={handleSizeChange}
          onToolModeChange={onToolModeChange}
        />

        <ColorPickers
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
          onOpenColorPicker={handleOpenColorPicker}
        />

        <StylePicker
          selectedStyle={selectedStyle}
          onStyleSelect={onStyleSelect}
        />
      </View>

      <ColorPickerSheet
        ref={bottomSheetRef}
        selectedColor={selectedColor}
        onSelectColor={onSelectColor}
        onConfirm={handleColorConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 20,
  },
  toggleButton: {
    position: 'absolute',
    top: -20,
    right: "45%",
    backgroundColor: 'rgba(0, 0, 0, 1)',
    borderRadius: 20,
    padding: 8,
  },
  toolbarSection: {
    marginBottom: 6,
    padding: 10
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
  valueText: {
    fontSize: 12,
    color: '#00C853',
    fontWeight: '500',
  },
  eyedropperButton: {
    padding: 4,
  },
  colorPickerContainer: {
    height: 50,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#333',
  },
  toolsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 12,
  },
  toolOption: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#2A2A2A',
    marginRight: 10,
    minWidth: 70,
  },
  toolLabel: {
    color: '#E0E0E0',
    fontSize: 12,
    marginTop: 6,
  },
  imagePickerContainer: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  pickedImage: {
    width: '100%',
    height: '100%',
  },
  eyedropperOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyedropperText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  widthPicker: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    alignItems: 'center',
  },
  widthContainer: {
    padding: 8,
    borderRadius: 8,
  },
  widthOption: {
    borderRadius: 4,
  },
  stylePickerContent: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  styleOption: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 70,
    backgroundColor: '#2A2A2A',
  },
  selectedOption: {
    borderColor: '#007AFF',
    borderWidth: 1,
    backgroundColor: '#0A3A8F',
  },
  stylePreview: {
    width: 48,
    height: 6,
    marginBottom: 8,
    borderRadius: 3,
  },
  stylePreviewContainer: {
    width: 48,
    height: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashLine: {
    height: 2,
    borderRadius: 2,
  },
  dotPoint: {
    borderRadius: 1.5,
  },
  styleLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'Chirp_Medium',
    marginTop: 4,
    color: '#E0E0E0',
  },
  doubleLineContainer: {
    height: 16,
    width: 48,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  doubleLine: {
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 5,
  },
  colorPreview: {
    marginBottom: 20,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorPanel: {
    borderRadius: 10,
    height: 100,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  recentColorsContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
  },
  recentColorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  recentColors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});

export default React.memo(DrawingToolbar);