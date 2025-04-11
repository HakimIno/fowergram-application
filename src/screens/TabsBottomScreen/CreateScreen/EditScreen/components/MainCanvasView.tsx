import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { SkImage } from '@shopify/react-native-skia';
import Animated, { SharedValue, useSharedValue } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';

import { EditMode, EditSubMode } from '../types';
import { ImageFilters } from './ImageFilters';
import { AdvancedImageEditor } from './AdvancedImageEditor';
import { AdvancedFilters } from './AdvancedFilters';
import { TextAndStickers } from './TextAndStickers';

// กำหนดความสูงคงที่ของ bottom sheet (ควรมีค่าเดียวกับในไฟล์ BottomSheet.tsx)
const FIXED_SHEET_HEIGHT = Dimensions.get('window').height * 0.35;

// Updated interface to handle SharedValue properly
interface AdjustmentValues {
  brightnessValue: SharedValue<number> | number;
  contrastValue: SharedValue<number> | number;
  saturationValue: SharedValue<number> | number;
  temperatureValue: SharedValue<number> | number;
  blurValue: SharedValue<number> | number;
  highlightsValue: SharedValue<number> | number;
  shadowsValue: SharedValue<number> | number;
  vignetteValue: SharedValue<number> | number;
  fadeValue: SharedValue<number> | number;
  sharpenValue: SharedValue<number> | number;
  structureValue: SharedValue<number> | number;
  grainValue: SharedValue<number> | number;
  tintValue: SharedValue<number> | number;
}

interface MainCanvasViewProps {
  image: SkImage | null;
  showAdvancedTools: boolean;
  editMode: EditMode;
  editSubMode: EditSubMode;
  isFullscreenMode: boolean;
  gestures: any; // Gesture type from react-native-gesture-handler
  animatedImageStyle: any; // AnimatedStyle from react-native-reanimated
  selectedFilter: string;
  adjustmentsValues: AdjustmentValues;
  activeTool: string;
  brushColor: string;
  brushSize: number;
  advancedImageEditorRef: React.RefObject<any>;
  textAndStickersRef: React.RefObject<any>;
  currentBottomSheetHeight: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MainCanvasView: React.FC<MainCanvasViewProps> = ({
  image,
  showAdvancedTools,
  editMode,
  editSubMode,
  isFullscreenMode,
  gestures,
  animatedImageStyle,
  selectedFilter,
  adjustmentsValues,
  activeTool,
  brushColor,
  brushSize,
  advancedImageEditorRef,
  textAndStickersRef,
}) => {
  if (!image) return null;

  // Create shared value wrappers for non-shared values
  const createSharedValue = (value: number | SharedValue<number>) => {
    if (typeof value === 'number') {
      return useSharedValue(value);
    }
    return value;
  };

  // Convert selectedFilter from string to number
  const filterIndex = parseInt(selectedFilter) || 0;

  // Calculate dimensions once to avoid recalculation
  const displayDimensions = useMemo(() => {
    // Calculate optimal display dimensions based on image aspect ratio
    const imageAspectRatio = image.width() / image.height();
    
    // คำนวณพื้นที่ที่เหลือเมื่อมี bottom sheet ขนาดคงที่
    const availableHeight = SCREEN_HEIGHT - (isFullscreenMode ? 0 : (FIXED_SHEET_HEIGHT + 60)); // เพิ่ม padding บน-ล่าง
    const screenAspectRatio = SCREEN_WIDTH / availableHeight;
    
    // Calculate display dimensions to maintain aspect ratio and fit screen
    let displayWidth = SCREEN_WIDTH;
    let displayHeight = availableHeight;
    
    if (imageAspectRatio > screenAspectRatio) {
      // Wide image - fit to width
      displayHeight = SCREEN_WIDTH / imageAspectRatio;
    } else {
      // Tall image - fit to available height
      displayWidth = availableHeight * imageAspectRatio;
    }

    // คำนวณขนาดสำหรับเครื่องมือขั้นสูง
    const advancedHeight = SCREEN_HEIGHT - (FIXED_SHEET_HEIGHT + 100);
    let advancedDisplayWidth = SCREEN_WIDTH;
    let advancedDisplayHeight = advancedHeight;
    
    if (imageAspectRatio > SCREEN_WIDTH / advancedHeight) {
      // Wide image - fit to width
      advancedDisplayHeight = SCREEN_WIDTH / imageAspectRatio;
    } else {
      // Tall image - fit to available height
      advancedDisplayWidth = advancedHeight * imageAspectRatio;
    }

    return {
      displayWidth,
      displayHeight,
      advancedDisplayWidth,
      advancedDisplayHeight
    };
  }, [image, isFullscreenMode]);

  // Show the basic image editor with gesture support
  if (!showAdvancedTools || editMode !== 'creative') {
    return (
      <GestureDetector gesture={gestures}>
        <Animated.View
          style={[
            styles.imageContainer,
            animatedImageStyle,
            isFullscreenMode && styles.fullscreenImageContainer,
            isFullscreenMode && { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }
          ]}
        >
          <ImageFilters
            image={image}
            width={displayDimensions.displayWidth}
            height={displayDimensions.displayHeight}
            selectedFilter={filterIndex}
            brightnessValue={createSharedValue(adjustmentsValues.brightnessValue)}
            contrastValue={createSharedValue(adjustmentsValues.contrastValue)}
            saturationValue={createSharedValue(adjustmentsValues.saturationValue)}
            temperatureValue={createSharedValue(adjustmentsValues.temperatureValue)}
            blurValue={createSharedValue(adjustmentsValues.blurValue)}
            highlightsValue={createSharedValue(adjustmentsValues.highlightsValue)}
            shadowsValue={createSharedValue(adjustmentsValues.shadowsValue)}
            vignetteValue={createSharedValue(adjustmentsValues.vignetteValue)}
            fadeValue={createSharedValue(adjustmentsValues.fadeValue)}
            sharpenValue={createSharedValue(adjustmentsValues.sharpenValue)}
            structureValue={createSharedValue(adjustmentsValues.structureValue)}
            grainValue={createSharedValue(adjustmentsValues.grainValue)}
            tintValue={createSharedValue(adjustmentsValues.tintValue)}
          />
        </Animated.View>
      </GestureDetector>
    );
  }

  // For advanced tools, show the appropriate component based on the edit sub-mode
  return (
    <View style={[
      styles.advancedContainer,
      isFullscreenMode && styles.fullscreenAdvancedContainer
    ]}>
      {editSubMode === 'draw' && (
        <AdvancedImageEditor
          image={image}
          width={displayDimensions.advancedDisplayWidth}
          height={displayDimensions.advancedDisplayHeight}
          currentTool={activeTool}
          color={brushColor}
          brushSize={brushSize}
          ref={advancedImageEditorRef}
        />
      )}
      
      {editSubMode === 'effects' && (
        <AdvancedFilters
          image={image}
          width={displayDimensions.advancedDisplayWidth}
          height={displayDimensions.advancedDisplayHeight}
        />
      )}
      
      {editSubMode === 'text' && (
        <TextAndStickers
          width={displayDimensions.advancedDisplayWidth}
          height={displayDimensions.advancedDisplayHeight}
          image={image}
          ref={textAndStickersRef}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  fullscreenImageContainer: {
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  advancedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  fullscreenAdvancedContainer: {
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
}); 