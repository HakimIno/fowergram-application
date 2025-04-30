import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useImage } from '@shopify/react-native-skia';
import * as MediaLibrary from 'expo-media-library';

// Import from our modular drawing system
import {
    EditorPhotoProps,
    DrawingCanvas,
    DrawingToolbar,
    ControlButtons,
    useDrawing,
    useImageSaver,
} from './drawing';

// Main component
const EditorPhoto: React.FC<EditorPhotoProps> = ({ imageUri, onSave }) => {
    // State
    const [showToolbar, setShowToolbar] = useState(true);
    const [selectedColor, setSelectedColor] = useState('#FF0000');
    const [selectedWidth, setSelectedWidth] = useState(4);
    const [selectedStyle, setSelectedStyle] = useState('solid' as const);

    // Load image
    const image = useImage(imageUri);

    // Initialize drawing system
    const {
        canvasRef,
        paths,
        currentPath,
        currentPaint,
        createPaint,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        undoLastPath,
        redoLastPath,
        clearCanvas,
        setCurrentColor,
        setStrokeWidth,
        setStrokeStyle,
        canUndoPath,
        canRedoPath,
    } = useDrawing(selectedColor, selectedWidth);

    // Initialize image saver
    const { saveImage, requestMediaLibraryPermission } = useImageSaver(canvasRef);

    // Request permissions for saving images
    useEffect(() => {
        requestMediaLibraryPermission();
    }, []);

    // Configure pan gesture for drawing
    const gesture = Gesture.Pan()
        .onStart((e) => {
            runOnJS(onTouchStart)(e.x, e.y);
        })
        .onUpdate((e) => {
            runOnJS(onTouchMove)(e.x, e.y);
        })
        .onEnd(() => {
            runOnJS(onTouchEnd)();
        })
        .minDistance(1)
        .averageTouches(true) 
        .maxPointers(1);       // Limit to single finger drawing

    // Selection handlers
    const handleColorSelect = useCallback((color: string) => {
        setSelectedColor(color);
        setCurrentColor(color);
    }, [setCurrentColor]);

    const handleWidthSelect = useCallback((width: number) => {
        setSelectedWidth(width);
        setStrokeWidth(width);
    }, [setStrokeWidth]);

    const handleStyleSelect = useCallback((style: any) => {
        setSelectedStyle(style);
        setStrokeStyle(style);
    }, [setStrokeStyle]);

    const handleSaveImage = useCallback(async () => {
        const savedUri = await saveImage(onSave);
        return savedUri;
    }, [saveImage, onSave]);

    const toggleToolbar = useCallback(() => {
        setShowToolbar(prev => !prev);
    }, []);

    if (!image) {
        return null;
    }

    return (
        <View style={styles.container}>
            <GestureDetector gesture={gesture}>
                <DrawingCanvas
                    canvasRef={canvasRef}
                    image={image}
                    paths={paths}
                    currentPath={currentPath}
                    currentPaint={currentPaint}
                    createPaint={createPaint}
                />
            </GestureDetector>

            <ControlButtons
                onUndo={undoLastPath}
                onRedo={redoLastPath}
                onSave={handleSaveImage}
                onClear={clearCanvas}
                canUndo={canUndoPath}
                canRedo={canRedoPath}
                showToolbar={showToolbar}
                onToggleToolbar={toggleToolbar}
            />

            <DrawingToolbar
                selectedColor={selectedColor}
                onColorSelect={handleColorSelect}
                selectedWidth={selectedWidth}
                onWidthSelect={handleWidthSelect}
                selectedStyle={selectedStyle}
                onStyleSelect={handleStyleSelect}
                show={showToolbar}
                onToggle={toggleToolbar}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default EditorPhoto;
