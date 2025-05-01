import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useImage } from '@shopify/react-native-skia';

import {
    EditorPhotoProps,
    DrawingCanvas,
    DrawingToolbar,
    ControlButtons,
    useDrawing,
    useImageSaver,
    ToolMode
} from './drawing';

// Main component
const EditorPhoto: React.FC<EditorPhotoProps> = ({ imageUri, onSave }) => {
    // State - use lazy initialization for initial values
    const [showToolbar, setShowToolbar] = useState(true);
    const [selectedColor, setSelectedColor] = useState('#FF0000');
    const [selectedWidth, setSelectedWidth] = useState(4);
    const [selectedStyle, setSelectedStyle] = useState('solid' as const);
    const [toolMode, setToolMode] = useState<ToolMode>('draw');

    // Load image just once and cache it
    const image = useImage(imageUri);

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
        setToolMode: setDrawingToolMode,
        canUndoPath,
        canRedoPath,
    } = useDrawing(selectedColor, selectedWidth);

    const { saveImage, requestMediaLibraryPermission } = useImageSaver(canvasRef);

    // Request permission just once
    useEffect(() => {
        requestMediaLibraryPermission();
    }, []);

    // Memoize gesture to prevent recreation on each render
    const gesture = useMemo(() => Gesture.Pan()
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
        .maxPointers(1), // Limit to single finger drawing
    [onTouchStart, onTouchMove, onTouchEnd]);

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

    const handleToolModeChange = useCallback((mode: ToolMode) => {
        setToolMode(mode);
        setDrawingToolMode(mode);
    }, [setDrawingToolMode]);

    const handleSaveImage = useCallback(async () => {
        return await saveImage(onSave);
    }, [saveImage, onSave]);

    const toggleToolbar = useCallback(() => {
        setShowToolbar(prev => !prev);
    }, []);

    // Don't render until image is loaded
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
                    toolMode={toolMode}
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
                toolMode={toolMode}
                onToolModeChange={handleToolModeChange}
                show={showToolbar}
                onToggle={toggleToolbar}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
});

export default React.memo(EditorPhoto);
