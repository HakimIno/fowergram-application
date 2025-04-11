import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, STICKERS } from '../components/TextAndStickers';

interface TextToolsContentProps {
  isAddingText: boolean;
  currentText: string;
  selectedColor: string;
  selectedFontSize: number;
  showStickers: boolean;
  onTextChange: (text: string) => void;
  onColorChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  onAddText: () => void;
  onTextSubmit: () => void;
  onCancelTextInput: () => void;
  onToggleStickersPanel: () => void;
  onAddSticker: (stickerId: string) => void;
  onClearAll: () => void;
}

export const TextToolsContent: React.FC<TextToolsContentProps> = ({
  isAddingText,
  currentText,
  selectedColor,
  selectedFontSize,
  showStickers,
  onTextChange,
  onColorChange,
  onFontSizeChange,
  onAddText,
  onTextSubmit,
  onCancelTextInput,
  onToggleStickersPanel,
  onAddSticker,
  onClearAll
}) => {
  // When adding text, show text editor
  if (isAddingText) {
    return (
      <View style={styles.textEditorContainer}>
        <View style={styles.textInputHeader}>
          <Text style={styles.textInputTitle}>เพิ่มข้อความ</Text>
          <View style={styles.textInputActions}>
            <TouchableOpacity style={styles.textInputButton} onPress={onCancelTextInput}>
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.textInputButton} onPress={onTextSubmit}>
              <MaterialCommunityIcons name="check" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <TextInput
          style={styles.textInput}
          value={currentText}
          onChangeText={onTextChange}
          multiline
          autoFocus
          placeholderTextColor="rgba(255,255,255,0.5)"
          placeholder="พิมพ์ข้อความของคุณที่นี่..."
        />
        
        <View style={styles.textFormatTools}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected
                ]}
                onPress={() => onColorChange(color)}
              />
            ))}
          </ScrollView>
          
          <View style={styles.fontSizeTools}>
            <TouchableOpacity 
              style={styles.fontSizeButton}
              onPress={() => onFontSizeChange(Math.max(12, selectedFontSize - 2))}
            >
              <MaterialCommunityIcons name="format-font-size-decrease" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.fontSizeText}>{selectedFontSize}</Text>
            <TouchableOpacity 
              style={styles.fontSizeButton}
              onPress={() => onFontSizeChange(Math.min(48, selectedFontSize + 2))}
            >
              <MaterialCommunityIcons name="format-font-size-increase" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  
  // When showing stickers, show sticker grid
  if (showStickers) {
    return (
      <View style={styles.stickersContainer}>
        <View style={styles.stickersPanelHeader}>
          <Text style={styles.stickersPanelTitle}>สติกเกอร์</Text>
          <TouchableOpacity style={styles.stickersPanelClose} onPress={onToggleStickersPanel}>
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.stickersGrid}>
          {STICKERS.map((sticker) => (
            <TouchableOpacity
              key={sticker.id}
              style={styles.stickerItem}
              onPress={() => onAddSticker(sticker.id)}
            >
              <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
  
  // Default state - show instructions and actions
  return (
    <View style={styles.instructionsContainer}>
      <Text style={styles.instructionsTitle}>การใช้งานเพิ่มข้อความและสติกเกอร์</Text>
      <Text style={styles.instructionsText}>
        • แตะที่ "เพิ่มข้อความ" เพื่อใส่ข้อความ{'\n'}
        • แตะที่ "สติกเกอร์" เพื่อเพิ่มสติกเกอร์{'\n'}
        • แตะที่ข้อความหรือสติกเกอร์ที่เพิ่มแล้วเพื่อเลือก{'\n'}
        • ลากเพื่อเคลื่อนย้ายข้อความหรือสติกเกอร์
      </Text>
      
      <View style={styles.mainActions}>
        <TouchableOpacity
          style={styles.mainActionButton}
          onPress={onAddText}
        >
          <MaterialCommunityIcons name="format-text" size={28} color="white" />
          <Text style={styles.mainActionText}>เพิ่มข้อความ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.mainActionButton}
          onPress={onToggleStickersPanel}
        >
          <MaterialCommunityIcons name="sticker" size={28} color="white" />
          <Text style={styles.mainActionText}>สติกเกอร์</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.mainActionButton}
          onPress={onClearAll}
        >
          <MaterialCommunityIcons name="delete-sweep" size={28} color="white" />
          <Text style={styles.mainActionText}>ล้างทั้งหมด</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
  },
  colorOptionSelected: {
    borderColor: 'white',
    transform: [{ scale: 1.2 }],
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
    width: 80,
    paddingVertical: 12,
  },
  mainActionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
}); 