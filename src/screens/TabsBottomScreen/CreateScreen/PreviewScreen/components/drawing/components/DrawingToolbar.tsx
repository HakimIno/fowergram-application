import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { StrokeStyleType } from '../types';
import { COLORS, STROKE_WIDTHS, STROKE_STYLES } from '../constants';
import ColorPicker, { Panel1, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';
import { runOnJS } from 'react-native-reanimated';
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet';

interface DrawingToolbarProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  selectedWidth: number;
  onWidthSelect: (width: number) => void;
  selectedStyle: StrokeStyleType;
  onStyleSelect: (style: StrokeStyleType) => void;
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
  show,
  onToggle,
}) => {
  // Animation setup for toolbar slide-in
  const slideAnim = React.useRef(new Animated.Value(300)).current; // Start off-screen
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [eyedropperMode, setEyedropperMode] = useState(false);
  const [showAdvancedColorPicker, setShowAdvancedColorPicker] = useState(false);
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: show ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [show]);

  // Render stroke style preview
  const renderStrokeStylePreview = (style: StrokeStyleType) => {
    switch (style) {
      case 'solid':
        return (
          <View style={[styles.stylePreview, { backgroundColor: '#fff' }]} />
        );
      case 'dashed':
        return (
          <View
            style={[
              styles.stylePreview,
              { borderStyle: 'dashed', borderWidth: 2, borderColor: '#fff', backgroundColor: 'transparent' },
            ]}
          />
        );
      case 'dotted':
        return (
          <View
            style={[
              styles.stylePreview,
              { borderStyle: 'dotted', borderWidth: 2, borderColor: '#fff', backgroundColor: 'transparent' },
            ]}
          />
        );
      case 'double':
        return (
          <View style={styles.doubleLineContainer}>
            <View style={[styles.doubleLine, { backgroundColor: '#fff' }]} />
            <View style={[styles.doubleLine, { backgroundColor: '#fff' }]} />
          </View>
        );
      case 'zigzag':
        return <MaterialCommunityIcons name="chart-timeline-variant" size={20} color="#fff" />;
      case 'wavy':
        return <MaterialCommunityIcons name="wave" size={20} color="#fff" />;
      case 'gradient':
        return <MaterialCommunityIcons name="gradient-horizontal" size={20} color="#fff" />;
      default:
        return <View style={[styles.stylePreview, { backgroundColor: '#fff' }]} />;
    }
  };

  // Simulating color extraction from image - in a real app this would
  // use image processing libraries to get the actual pixel color
  const handleImagePress = () => {
    const randomPastelColor = COLORS[Math.floor(Math.random() * (COLORS.length - 1))];
    onColorSelect(randomPastelColor);
    setEyedropperMode(false);
  };

  const renderColorItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.colorOption,
        { backgroundColor: item },
        selectedColor === item && styles.selectedOption,
      ]}
      onPress={() => onColorSelect(item)}
      activeOpacity={0.7}
    />
  );

  const handlePress = () => {
    setShowAdvancedColorPicker(true);
    bottomSheetRef.current?.expand();
  };

  const handleCloseBottomSheet = () => {
    setShowAdvancedColorPicker(false);
  };

  const onSelectColor = ({ hex }: { hex: string }) => {
    'worklet';
    runOnJS(onColorSelect)(hex);
  };

  const handleColorConfirm = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <>
      <Animated.View
        style={[
          styles.toolbar,
       
        ]}
      >
        {/* Color picker */}
        <View style={styles.toolbarSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Colors</Text>

            <TouchableOpacity onPress={handlePress} style={styles.eyedropperButton}>
              <MaterialCommunityIcons name="eyedropper" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.colorPickerContainer}>
            <FlashList
              data={COLORS}
              renderItem={renderColorItem}
              keyExtractor={(item) => item}
              horizontal
              estimatedItemSize={50}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.colorPickerContent}
            />
          </View>
        </View>

        {/* Style picker */}
        <View style={styles.toolbarSection}>
          <Text style={styles.sectionTitle}>Style</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stylePickerContent}
          >
            {STROKE_STYLES.map((style) => (
              <TouchableOpacity
                key={style.type}
                style={[
                  styles.styleOption,
                  selectedStyle === style.type && styles.selectedOption,
                ]}
                onPress={() => onStyleSelect(style.type)}
                activeOpacity={0.7}
              >
                {renderStrokeStylePreview(style.type)}
                <Text style={styles.styleLabel}>{style.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      {/* Advanced Color Picker as Bottom Sheet instead of Modal */}
      <BottomSheet
        ref={bottomSheetRef}
        handleClose={handleCloseBottomSheet}
        title="เลือกสี"
        isDark={true}
        headerRight={
          <TouchableOpacity onPress={handleColorConfirm}>
            <MaterialCommunityIcons name="check" size={24} color="#007AFF" />
          </TouchableOpacity>
        }
        headerLeft={
          <TouchableOpacity onPress={handleCloseBottomSheet}>
            <MaterialCommunityIcons name="close" size={24} color="#999" />
          </TouchableOpacity>
        }
      >
        <View style={styles.bottomSheetContent}>
          <ColorPicker
            value={selectedColor}
            onComplete={onSelectColor}
            style={{ width: '100%' }}
          >
            <Panel1 style={styles.colorPanel} thumbSize={20} />
            <HueSlider style={styles.slider} thumbSize={24} />
            <OpacitySlider style={styles.slider} thumbSize={24} />
          </ColorPicker>

          {/* <TouchableOpacity
            style={styles.applyButton}
            onPress={() => bottomSheetRef.current?.close()}
          >
            <Text style={styles.applyButtonText}>ยืนยัน</Text>
          </TouchableOpacity> */}
        </View>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000', // Dark background
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    color: '#E0E0E0', // Light text for contrast
  },
  eyedropperButton: {
    padding: 4,
  },
  colorPickerContainer: {
    height: 50,
  },
  colorPickerContent: {
    paddingVertical: 8,
    gap: 12,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#333',
    marginHorizontal: 6,
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
    backgroundColor: '#2A2A2A', // Slightly lighter for contrast
  },
  selectedOption: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#003087', // Darker blue for selection
  },
  stylePreview: {
    width: 48,
    height: 6,
    marginBottom: 8,
    borderRadius: 3,
  },
  styleLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
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
    marginVertical: 8,
    height: 32,
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
  },
  recentColorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  applyButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    width: '80%',
    alignSelf: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DrawingToolbar;