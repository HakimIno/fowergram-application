import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView } from 'react-native';
import { Canvas, Image, useCanvasRef, Group, Text as SkiaText, useFont, FontStyle } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';

interface TextAndStickersProps {
  width: number;
  height: number;
  image?: any;
}

interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  rotation: number;
}

interface StickerItem {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

// Available stickers
export const STICKERS = [
  { id: 'heart', emoji: '❤️' },
  { id: 'star', emoji: '⭐' },
  { id: 'fire', emoji: '🔥' },
  { id: 'laugh', emoji: '😂' },
  { id: 'cool', emoji: '😎' },
  { id: 'party', emoji: '🎉' },
  { id: 'thumbsup', emoji: '👍' },
  { id: 'crown', emoji: '👑' },
  { id: 'rainbow', emoji: '🌈' },
  { id: 'flower', emoji: '🌸' },
  { id: 'camera', emoji: '📸' },
  { id: 'butterfly', emoji: '🦋' },
];

// Available fonts
export const FONTS = [
  { id: 'default', name: 'Default', fontFamily: 'System' },
  { id: 'bold', name: 'Bold', fontFamily: 'System-Bold' },
  { id: 'italic', name: 'Italic', fontFamily: 'System-Italic' },
  { id: 'monospace', name: 'Monospace', fontFamily: 'monospace' },
];

// Available colors
export const COLORS = [
  '#FFFFFF', // White
  '#000000', // Black
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#5AC8FA', // Light Blue
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#AF52DE', // Magenta
];

// Define the ref type
export type TextAndStickersRefType = {
  addText: (text: string, color: string, fontSize: number, fontFamily: string) => void;
  addSticker: (stickerId: string) => void;
  deleteSelectedItem: () => void;
  clearAll: () => void;
  getItems: () => { textItems: TextItem[], stickerItems: StickerItem[] };
  clearSelection: () => void;
  getCanvasSnapshot: () => string | null;
};

export const TextAndStickers = forwardRef<TextAndStickersRefType, TextAndStickersProps>(
  ({ width, height, image }, ref) => {
    // References
    const canvasRef = useCanvasRef();
    
    // Load default font
    const defaultFont = useFont(null, 24);
    
    // State
    const [textItems, setTextItems] = useState<TextItem[]>([]);
    const [stickerItems, setStickerItems] = useState<StickerItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<{ type: 'text' | 'sticker', id: string } | null>(null);
    
    // Handle adding new text
    const addText = useCallback((
      text: string,
      color: string = COLORS[0],
      fontSize: number = 24,
      fontFamily: string = FONTS[0].fontFamily
    ) => {
      if (text.trim()) {
        const newTextItem: TextItem = {
          id: Date.now().toString(),
          text,
          x: width / 2 - 50,
          y: height / 2 - 50,
          fontSize,
          color,
          fontFamily,
          rotation: 0,
        };
        
        setTextItems((prev) => [...prev, newTextItem]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return true;
      }
      return false;
    }, [width, height]);
    
    // Handle adding sticker
    const addSticker = useCallback((stickerId: string) => {
      const newSticker: StickerItem = {
        id: Date.now().toString(),
        stickerId,
        x: width / 2 - 25,
        y: height / 2 - 25,
        scale: 1,
        rotation: 0,
      };
      
      setStickerItems((prev) => [...prev, newSticker]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return true;
    }, [width, height]);
    
    // Handle item selection
    const handleSelectItem = useCallback((type: 'text' | 'sticker', id: string) => {
      setSelectedItem({ type, id });
      Haptics.selectionAsync();
    }, []);
    
    // Handle item deletion
    const deleteSelectedItem = useCallback(() => {
      if (selectedItem) {
        if (selectedItem.type === 'text') {
          setTextItems((prev) => prev.filter(item => item.id !== selectedItem.id));
        } else {
          setStickerItems((prev) => prev.filter(item => item.id !== selectedItem.id));
        }
        setSelectedItem(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return true;
      }
      return false;
    }, [selectedItem]);
    
    // Clear all items
    const clearAll = useCallback(() => {
      setTextItems([]);
      setStickerItems([]);
      setSelectedItem(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    }, []);
    
    // Get all items
    const getItems = useCallback(() => {
      return { textItems, stickerItems };
    }, [textItems, stickerItems]);
    
    // Gesture handlers
    const panTextGesture = useCallback((id: string) => 
      Gesture.Pan()
        .onUpdate((e) => {
          setTextItems((prev) => 
            prev.map((item) => 
              item.id === id 
                ? { ...item, x: item.x + e.translationX, y: item.y + e.translationY }
                : item
            )
          );
        })
        .onEnd(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }),
    []);
    
    const panStickerGesture = useCallback((id: string) => 
      Gesture.Pan()
        .onUpdate((e) => {
          setStickerItems((prev) => 
            prev.map((item) => 
              item.id === id 
                ? { ...item, x: item.x + e.translationX, y: item.y + e.translationY }
                : item
            )
          );
        })
        .onEnd(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }),
    []);

    // Helper to create font style
    const getFontStyle = useCallback((fontSize: number) => {
      if (defaultFont) {
        return { ...defaultFont, size: fontSize };
      }
      return null;
    }, [defaultFont]);

    // Clear selection - useful before taking a screenshot
    const clearSelection = useCallback(() => {
      setSelectedItem(null);
      return true;
    }, []);
    
    // Get a snapshot of the canvas
    const getCanvasSnapshot = useCallback(() => {
      if (canvasRef.current) {
        try {
          // Make a snapshot of the canvas
          const snapshot = canvasRef.current.makeImageSnapshot();
          if (snapshot) {
            // Convert to a base64 data URL
            return snapshot.encodeToBase64();
          }
        } catch (error) {
          console.error('Error taking canvas snapshot:', error);
        }
      }
      return null;
    }, [canvasRef]);

    // Expose methods to parent through ref
    useImperativeHandle(ref, () => ({
      addText,
      addSticker,
      deleteSelectedItem,
      clearAll,
      getItems,
      clearSelection,
      getCanvasSnapshot
    }));

    // Render
    return (
      <GestureHandlerRootView style={styles.container}>
        {/* Image Canvas */}
        <Canvas style={[styles.canvas, { width, height }]} ref={canvasRef}>
          {/* Background Image */}
          {image && (
            <Image
              image={image}
              fit="contain"
              x={0}
              y={0}
              width={width}
              height={height}
            />
          )}
          
          {/* Draw Text Items */}
          <Group>
            {textItems.map((item) => (
              <SkiaText
                key={item.id}
                x={item.x}
                y={item.y + item.fontSize} // Adjust for baseline
                text={item.text}
                font={getFontStyle(item.fontSize)}
                color={item.color}
              />
            ))}
          </Group>
          
          {/* Draw Sticker Items (using text emojis for simplicity) */}
          <Group>
            {stickerItems.map((item) => {
              const sticker = STICKERS.find(s => s.id === item.stickerId);
              return sticker ? (
                <SkiaText
                  key={item.id}
                  x={item.x}
                  y={item.y + 30} // Adjust for emoji height
                  text={sticker.emoji}
                  font={getFontStyle(30 * item.scale)}
                />
              ) : null;
            })}
          </Group>
        </Canvas>
        
        {/* Interactive Text Items */}
        {textItems.map((item) => (
          <GestureDetector key={item.id} gesture={panTextGesture(item.id)}>
            <TouchableOpacity
              style={[
                styles.textOverlay,
                { 
                  left: item.x, 
                  top: item.y,
                  borderColor: selectedItem?.id === item.id ? item.color : 'transparent',
                  borderWidth: selectedItem?.id === item.id ? 2 : 0,
                }
              ]}
              onPress={() => handleSelectItem('text', item.id)}
            >
              <Text style={{ color: 'transparent' }}>{item.text}</Text>
            </TouchableOpacity>
          </GestureDetector>
        ))}
        
        {/* Interactive Sticker Items */}
        {stickerItems.map((item) => {
          const sticker = STICKERS.find(s => s.id === item.stickerId);
          return sticker ? (
            <GestureDetector key={item.id} gesture={panStickerGesture(item.id)}>
              <TouchableOpacity
                style={[
                  styles.stickerOverlay,
                  { 
                    left: item.x, 
                    top: item.y,
                    borderColor: selectedItem?.id === item.id ? 'white' : 'transparent',
                    borderWidth: selectedItem?.id === item.id ? 2 : 0,
                  }
                ]}
                onPress={() => handleSelectItem('sticker', item.id)}
              >
                <Text style={{ fontSize: 30 * item.scale, opacity: 0 }}>{sticker.emoji}</Text>
              </TouchableOpacity>
            </GestureDetector>
          ) : null;
        })}
      </GestureHandlerRootView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  canvas: {
    flex: 1,
  },
  textOverlay: {
    position: 'absolute',
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    minWidth: 40,
    minHeight: 30,
  },
  stickerOverlay: {
    position: 'absolute',
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'transparent',
    minWidth: 40,
    minHeight: 40,
  },
  // New bottom sheet content styles
  instructionsContainer: {
    padding: 16,
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  mainActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  mainActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    paddingVertical: 12,
  },
  mainActionText: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
  },
  editActionsContainer: {
    padding: 16,
  },
  editActionsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  editActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    paddingVertical: 12,
  },
  editActionText: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
  },
  textEditorContainer: {
    padding: 16,
  },
  textInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  textInputTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  textInputActions: {
    flexDirection: 'row',
    gap: 12,
  },
  textInputButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    color: 'white',
    fontSize: 16,
    padding: 12,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  textFormatTools: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  colorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  colorOptionSelected: {
    transform: [{ scale: 1.2 }],
    borderColor: 'white',
  },
  fontSizeTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fontSizeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  stickersContainer: {
    padding: 16,
  },
  stickersPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stickersPanelTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  stickersPanelClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stickerItem: {
    width: '25%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  stickerEmoji: {
    fontSize: 32,
  },
}); 