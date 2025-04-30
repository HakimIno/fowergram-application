import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Dimensions, SafeAreaView, StatusBar as RNStatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from 'src/navigation/types';
import { StatusBar } from 'expo-status-bar';
import { useImage } from '@shopify/react-native-skia';
import Animated, { useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

// Import custom hooks
import { useImageEditor } from './useImageEditor';
import { useControlsVisibility } from './hooks/useControlsVisibility';
import { useImageGestures } from './hooks/useImageGestures';

// Import types
import { EditMode, EditSubMode } from './types';
import { FILTERS, ADJUSTMENTS } from './imageUtils';

// Import components
import { HeaderControls } from './components/HeaderControls';
import { BottomGradient } from './components/BottomGradient';
import { MainCanvasView } from './components/MainCanvasView';
import { BottomSheetView } from './components/BottomSheetView';
import { DrawingToolsContent } from './components/DrawingToolsContent';
import { TextToolsContent } from './components/TextToolsContent';
import {
  AdjustmentContent,
  CropContent,
  FilterContent
} from './components/EditComponents';

// Constants
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AUTO_HIDE_DELAY = 3000; // ms

// Types
type EditScreenRouteProp = RouteProp<RootStackParamList, 'edit_screen'>;
type EditScreenNavigationProp = NavigationProp<RootStackParamList>;

const EditScreen: React.FC = () => {
  const navigation = useNavigation<EditScreenNavigationProp>();
  const route = useRoute<EditScreenRouteProp>();

  const selectedMedia = route.params?.selectedMedia || {
    uri: '',
    type: 'image' as const,
  };

  // Load the image
  const image = useImage(selectedMedia.uri || '');

  // State
  const [editMode, setEditMode] = useState<EditMode>('basic');
  const [editSubMode, setEditSubMode] = useState<EditSubMode>('filter');
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [currentBottomSheetHeight, setCurrentBottomSheetHeight] = useState(0);
  const [activeTool, setActiveTool] = useState<string>('brush');
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  // Drawing state
  const [brushColor, setBrushColor] = useState('#FF3B30'); // Default red color
  const [brushSize, setBrushSize] = useState(5); // Default brush size

  // Text editor states
  const [isAddingText, setIsAddingText] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [selectedFontFamily, setSelectedFontFamily] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedFontSize, setSelectedFontSize] = useState(24);
  const [showStickers, setShowStickers] = useState(false);

  // Animation values
  const imageScale = useSharedValue(1);

  // Custom hooks
  const {
    showControls,
    setShowControls,
    controlsOpacity,
    controlsAnimatedStyle,
    setupControlsAutoHide,
    clearControlsAutoHide
  } = useControlsVisibility(AUTO_HIDE_DELAY);

  const {
    scale,
    translateX,
    translateY,
    animatedImageStyle,
    gestures,
  } = useImageGestures({
    onControlsToggle: setShowControls,
    setupControlsAutoHide,
    clearControlsAutoHide
  });

  // Image editor hook
  const {
    selectedFilter,
    adjustments,
    isSaving,
    bottomSheetHeight,
    brightnessValue,
    contrastValue,
    saturationValue,
    temperatureValue,
    blurValue,
    highlightsValue,
    shadowsValue,
    vignetteValue,
    fadeValue,
    sharpenValue,
    structureValue,
    grainValue,
    tintValue,
    handleFilterSelect,
    handleAdjustmentChange,
    resetAdjustments,
    saveImage,
  } = useImageEditor(selectedMedia.uri);

  // Refs for advanced components
  const advancedImageEditorRef = useRef<any>(null);
  const textAndStickersRef = useRef<any>(null);

  // Handle bottom sheet height changes - กำหนดเป็นค่าคงที่เดียวกับในไฟล์อื่น ๆ
  const FIXED_SHEET_HEIGHT = SCREEN_HEIGHT * 0.35;
  const handleBottomSheetHeightChange = useCallback((height: number) => {
    // ตอนนี้เราไม่ต้องการที่จะเปลี่ยนความสูง เก็บไว้เป็นค่าคงที่
    requestAnimationFrame(() => {
      bottomSheetHeight.value = FIXED_SHEET_HEIGHT;
    });
    setCurrentBottomSheetHeight(FIXED_SHEET_HEIGHT);
  }, [bottomSheetHeight]);

  // Handle save completion
  const handleSaveComplete = useCallback((savedUri: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('create_screen', { editedImageUri: savedUri });
  }, [navigation]);

  // Toggle fullscreen preview
  const toggleFullscreen = useCallback(() => {
    setIsFullscreenMode(!isFullscreenMode);

    if (!isFullscreenMode) {
      // Entering fullscreen
      setShowControls(true);
      imageScale.value = withSequence(
        withTiming(0.95, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );

      // Reset position and scale for better viewing experience
      translateX.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });

      setupControlsAutoHide();
    } else {
      // Exiting fullscreen
      setShowControls(true);
      controlsOpacity.value = withTiming(1, { duration: 200 });

      // Reset position and scale when exiting fullscreen
      translateX.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });

      clearControlsAutoHide();
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [isFullscreenMode, imageScale, controlsOpacity, setupControlsAutoHide, clearControlsAutoHide, setShowControls, translateX, translateY, scale]);

  // Switch between edit modes
  const switchEditMode = useCallback((mode: EditMode, subMode: EditSubMode) => {
    if (mode !== editMode || subMode !== editSubMode) {
      // Reset image position
      translateX.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });

      // Show/hide advanced tools based on mode
      setShowAdvancedTools(mode === 'creative');

      Haptics.selectionAsync();
    }

    setEditMode(mode);
    setEditSubMode(subMode);
  }, [editMode, editSubMode, translateX, translateY, scale]);

  // Handle tool selection
  const handleToolSelection = useCallback((toolId: string) => {
    setActiveTool(toolId);
    Haptics.selectionAsync();
  }, []);

  // Start the save process
  const startSaveProcess = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const isCreativeMode = editMode === 'creative';

    // Special handling for canvas-based edits
    if (isCreativeMode && (editSubMode === 'text' || editSubMode === 'draw')) {
      if (editSubMode === 'text' && textAndStickersRef.current) {
        if (typeof textAndStickersRef.current.clearSelection === 'function') {
          textAndStickersRef.current.clearSelection();
        }

        setTimeout(() => {
          const canvasSnapshot = typeof textAndStickersRef.current?.getCanvasSnapshot === 'function'
            ? textAndStickersRef.current.getCanvasSnapshot()
            : null;

          if (canvasSnapshot) {
            saveImage((savedUri) => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.navigate('create_screen', { editedImageUri: savedUri || selectedMedia.uri });
            }, canvasSnapshot);
          } else {
            saveImage(handleSaveComplete);
          }
        }, 100);
      }
      else if (editSubMode === 'draw' && advancedImageEditorRef.current) {
        const canvasSnapshot = typeof advancedImageEditorRef.current?.getCanvasSnapshot === 'function'
          ? advancedImageEditorRef.current.getCanvasSnapshot()
          : null;

        if (canvasSnapshot) {
          saveImage((savedUri) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.navigate('create_screen', { editedImageUri: savedUri || selectedMedia.uri });
          }, canvasSnapshot);
        } else {
          saveImage(handleSaveComplete);
        }
      } else {
        saveImage(handleSaveComplete);
      }
    } else {
      saveImage(handleSaveComplete);
    }
  }, [saveImage, handleSaveComplete, editMode, editSubMode, navigation, selectedMedia.uri]);

  // Go back
  const handleGoBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  // Drawing action handlers
  const handleUndo = useCallback(() => {
    if (advancedImageEditorRef.current && typeof advancedImageEditorRef.current.undoLastPath === 'function') {
      const success = advancedImageEditorRef.current.undoLastPath();
      if (success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }, []);

  const handleClearDrawing = useCallback(() => {
    if (advancedImageEditorRef.current && typeof advancedImageEditorRef.current.clearAllPaths === 'function') {
      const success = advancedImageEditorRef.current.clearAllPaths();
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, []);

  // Text action handlers
  const handleAddText = useCallback(() => {
    setIsAddingText(true);
    setCurrentText('เพิ่มข้อความที่นี่');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleTextSubmit = useCallback(() => {
    if (textAndStickersRef.current && typeof textAndStickersRef.current.addText === 'function' && currentText.trim()) {
      try {
        textAndStickersRef.current.addText(
          currentText,
          selectedColor || '#FFFFFF',
          selectedFontSize,
          selectedFontFamily || 'System'
        );

        setCurrentText('');
        setIsAddingText(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error adding text:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [currentText, selectedColor, selectedFontSize, selectedFontFamily]);

  const cancelTextInput = useCallback(() => {
    setIsAddingText(false);
    setCurrentText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const toggleStickersPanel = useCallback(() => {
    setShowStickers(!showStickers);
    if (isAddingText) {
      setIsAddingText(false);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [showStickers, isAddingText]);

  const handleAddSticker = useCallback((stickerId: string) => {
    if (textAndStickersRef.current && typeof textAndStickersRef.current.addSticker === 'function') {
      try {
        textAndStickersRef.current.addSticker(stickerId);
        setShowStickers(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error adding sticker:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, []);

  const handleClearAllTextAndStickers = useCallback(() => {
    if (textAndStickersRef.current && typeof textAndStickersRef.current.clearAll === 'function') {
      try {
        textAndStickersRef.current.clearAll();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error clearing all items:', error);
      }
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        <View style={styles.imageCanvasContainer}>
       
          <MainCanvasView
            image={image}
            showAdvancedTools={showAdvancedTools}
            editMode={editMode}
            editSubMode={editSubMode}
            isFullscreenMode={isFullscreenMode}
            animatedImageStyle={animatedImageStyle}
            selectedFilter={String(selectedFilter || 0)}
            adjustmentsValues={{
              brightnessValue,
              contrastValue,
              saturationValue,
              temperatureValue,
              blurValue,
              highlightsValue,
              shadowsValue,
              vignetteValue,
              fadeValue,
              sharpenValue,
              structureValue,
              grainValue,
              tintValue
            }}
            activeTool={activeTool}
            brushColor={brushColor}
            brushSize={brushSize}
            advancedImageEditorRef={advancedImageEditorRef}
            textAndStickersRef={textAndStickersRef}
            currentBottomSheetHeight={currentBottomSheetHeight}
          />

        </View>

       
        {/* {showControls && !isFullscreenMode && (
          <BottomSheetView
            editMode={editMode}
            editSubMode={editSubMode}
            switchEditMode={switchEditMode}
            currentBottomSheetHeight={currentBottomSheetHeight}
            onHeightChange={handleBottomSheetHeightChange}
            isCreativeMode={editMode === 'creative'}
            renderCreativeToolbar={() => null}
            renderContent={() => {
              // Basic edit mode content
              if (editMode === 'basic') {
                if (editSubMode === 'filter') {
                  return (
                    <FilterContent
                      filters={FILTERS}
                      selectedFilter={selectedFilter}
                      image={image}
                      onFilterSelect={handleFilterSelect}
                    />
                  );
                } else if (editSubMode === 'adjust') {
                  return (
                    <AdjustmentContent
                      adjustments={ADJUSTMENTS}
                      values={[
                        brightnessValue.value,
                        contrastValue.value,
                        saturationValue.value,
                        temperatureValue.value,
                        blurValue.value,
                        highlightsValue.value,
                        shadowsValue.value,
                        vignetteValue.value,
                        fadeValue.value,
                        sharpenValue.value,
                        structureValue.value,
                        grainValue.value,
                        tintValue.value
                      ]}
                      onAdjustmentChange={handleAdjustmentChange}
                      onReset={resetAdjustments}
                    />
                  );
                } else if (editSubMode === 'crop') {
                  return <CropContent />;
                }
              }
              // Creative mode content
              else if (editMode === 'creative') {
                // Render creative tools
                if (editSubMode === 'draw') {
                  return (
                    <DrawingToolsContent
                      activeTool={activeTool}
                      brushColor={brushColor}
                      brushSize={brushSize}
                      onColorChange={setBrushColor}
                      onSizeChange={setBrushSize}
                      onUndo={handleUndo}
                      onClear={handleClearDrawing}
                    />
                  );
                } else if (editSubMode === 'text') {
                  return (
                    <TextToolsContent
                      isAddingText={isAddingText}
                      currentText={currentText}
                      selectedColor={selectedColor}
                      selectedFontSize={selectedFontSize}
                      showStickers={showStickers}
                      onTextChange={setCurrentText}
                      onColorChange={setSelectedColor}
                      onFontSizeChange={setSelectedFontSize}
                      onAddText={handleAddText}
                      onTextSubmit={handleTextSubmit}
                      onCancelTextInput={cancelTextInput}
                      onToggleStickersPanel={toggleStickersPanel}
                      onAddSticker={handleAddSticker}
                      onClearAll={handleClearAllTextAndStickers}
                    />
                  );
                }
              }

              return null;
            }}
          />
        )} */}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// Base styles for the edit screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageCanvasContainer: {
    flex: 1,
    position: 'relative',
  },
});

export default EditScreen;