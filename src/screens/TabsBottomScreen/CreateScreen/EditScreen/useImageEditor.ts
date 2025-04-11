import { useState, useEffect, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Dimensions } from 'react-native';
import { ADJUSTMENTS, saveEditedImage } from './imageUtils';
import * as FileSystem from 'expo-file-system';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define bottom sheet snap points as percentage of screen height
const MIN_SHEET_HEIGHT = 150; // Minimum height in collapsed state
const MID_SHEET_HEIGHT = SCREEN_HEIGHT * 0.4; // 40% of screen height
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.7; // 70% of screen height (reduced for better performance)

/**
 * Optimized custom hook for image editing functionality
 */
export const useImageEditor = (initialImageUri: string) => {
  // State for editing mode
  const [editMode, setEditMode] = useState<'filter' | 'adjust' | 'crop'>('filter');
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [adjustments, setAdjustments] = useState(ADJUSTMENTS.map(adj => adj.default));
  const [isSaving, setIsSaving] = useState(false);
  
  // Animated values for UI with better initialization
  const bottomSheetHeight = useSharedValue(MID_SHEET_HEIGHT);
  
  // Gesture state for image manipulation - optimized
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  
  // Skia values for image adjustments - memoized for better performance
  const brightnessValue = useSharedValue(adjustments[0]);
  const contrastValue = useSharedValue(adjustments[1]);
  const saturationValue = useSharedValue(adjustments[2]);
  const temperatureValue = useSharedValue(adjustments[3]);
  const blurValue = useSharedValue(adjustments[4]);
  const highlightsValue = useSharedValue(adjustments[5]);
  const shadowsValue = useSharedValue(adjustments[6]);
  const vignetteValue = useSharedValue(adjustments[7]);
  const fadeValue = useSharedValue(adjustments[8]);
  const sharpenValue = useSharedValue(adjustments[9]);
  const structureValue = useSharedValue(adjustments[10]);
  const grainValue = useSharedValue(adjustments[11]);
  const tintValue = useSharedValue(adjustments[12]);
  
  // Throttle updates for better performance
  useEffect(() => {
    // Use requestAnimationFrame to batch updates for better performance
    const updateAnimatedValues = () => {
      brightnessValue.value = adjustments[0];
      contrastValue.value = adjustments[1];
      saturationValue.value = adjustments[2];
      temperatureValue.value = adjustments[3];
      blurValue.value = adjustments[4];
      highlightsValue.value = adjustments[5];
      shadowsValue.value = adjustments[6];
      vignetteValue.value = adjustments[7];
      fadeValue.value = adjustments[8];
      sharpenValue.value = adjustments[9];
      structureValue.value = adjustments[10];
      grainValue.value = adjustments[11];
      tintValue.value = adjustments[12];
    };
    
    const frameId = requestAnimationFrame(updateAnimatedValues);
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [adjustments]);
  
  // Handle filter selection with performance optimization
  const handleFilterSelect = (index: number) => {
    if (index !== selectedFilter) {
      setSelectedFilter(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Handle adjustment change with performance optimization
  const handleAdjustmentChange = (index: number, value: number) => {
    // Only update if change is significant to reduce re-renders
    if (Math.abs(adjustments[index] - value) > 0.01) {
      const newAdjustments = [...adjustments];
      newAdjustments[index] = value;
      setAdjustments(newAdjustments);
    }
  };
  
  // Switch edit mode - simplified
  const switchEditMode = (mode: 'filter' | 'adjust' | 'crop') => {
    if (mode !== editMode) {
      setEditMode(mode);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Reset all adjustments - optimized
  const resetAdjustments = () => {
    const defaultValues = ADJUSTMENTS.map(adj => adj.default);
    setAdjustments(defaultValues);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  // Save the edited image - optimized
  const saveImage = async (onComplete: (uri: string) => void, canvasSnapshot?: string | null) => {
    try {
      // Set saving state before async operation
      setIsSaving(true);
      
      // Use haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      let imageToSave = initialImageUri;
      
      // If we have a canvas snapshot from text/stickers/drawings, use it instead
      if (canvasSnapshot) {
        // Convert the base64 snapshot to a file we can save
        const timestamp = new Date().getTime();
        const snapshotUri = `${FileSystem.cacheDirectory}snapshot_${timestamp}.jpg`;
        
        // Write the base64 data to a file
        await FileSystem.writeAsStringAsync(
          snapshotUri,
          canvasSnapshot,
          { encoding: FileSystem.EncodingType.Base64 }
        );
        
        // Use this snapshot for saving
        imageToSave = snapshotUri;
      }
      
      // Save the edited image with the current filter and adjustments
      const savedUri = await saveEditedImage(imageToSave, {
        selectedFilter,
        adjustments,
      });
      
      // Call the completion handler with the saved URI
      onComplete(savedUri);
    } catch (error) {
      console.error('Error saving image:', error);
      // Handle error appropriately
    } finally {
      // Set saving state after async operation
      setIsSaving(false);
    }
  };
  
  return {
    editMode,
    selectedFilter,
    adjustments,
    isSaving,
    bottomSheetHeight,
    scale,
    savedScale,
    translateX,
    translateY,
    savedTranslateX,
    savedTranslateY,
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
    switchEditMode,
    resetAdjustments,
    saveImage,
  };
}; 