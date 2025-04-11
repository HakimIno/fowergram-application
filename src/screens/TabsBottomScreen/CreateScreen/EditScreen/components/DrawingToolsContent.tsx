import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { DRAWING_COLORS } from '../types';

interface DrawingToolsContentProps {
  activeTool: string;
  brushColor: string;
  brushSize: number;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onUndo: () => void;
  onClear: () => void;
}

export const DrawingToolsContent: React.FC<DrawingToolsContentProps> = ({
  activeTool,
  brushColor,
  brushSize,
  onColorChange,
  onSizeChange,
  onUndo,
  onClear
}) => {
  // For color selection
  const renderColorOptions = () => {
    return (
      <View style={styles.colorOptions}>
        {DRAWING_COLORS.map((clr) => (
          <TouchableOpacity
            key={clr}
            style={[
              styles.colorOption,
              { backgroundColor: clr },
              brushColor === clr && styles.colorOptionSelected,
              clr === '#FFFFFF' && styles.whiteColorOption,
            ]}
            onPress={() => onColorChange(clr)}
          />
        ))}
      </View>
    );
  };
  
  // For brush size
  const renderBrushSizeOptions = () => {
    const sizes = [3, 5, 8, 12, 16];
    
    return (
      <View style={styles.brushSizeOptions}>
        {sizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.brushSizeOption,
              brushSize === size && styles.brushSizeOptionSelected,
            ]}
            onPress={() => onSizeChange(size)}
          >
            <View 
              style={[
                styles.brushSizeSample, 
                { 
                  width: size * 2, 
                  height: size * 2, 
                  backgroundColor: brushColor === '#FFFFFF' ? '#000000' : brushColor 
                }
              ]} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Return different tool options based on active tool
  if (activeTool === 'color') {
    return (
      <View style={styles.drawingToolContent}>
        <Text style={styles.drawingToolLabel}>เลือกสี</Text>
        {renderColorOptions()}
      </View>
    );
  }
  
  if (activeTool === 'marker' || activeTool === 'brush' || activeTool === 'neon') {
    return (
      <View style={styles.drawingToolContent}>
        <View style={styles.brushControlsRow}>
          <View>
            <Text style={styles.drawingToolLabel}>ขนาดพู่กัน</Text>
            {renderBrushSizeOptions()}
          </View>
          
          <View style={styles.drawingActions}>
            <TouchableOpacity 
              style={styles.drawingActionButton}
              onPress={onUndo}
            >
              <Feather name="rotate-ccw" size={24} color="white" />
              <Text style={styles.drawingActionText}>เลิกทำ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.drawingActionButton}
              onPress={onClear}
            >
              <Feather name="trash-2" size={24} color="white" />
              <Text style={styles.drawingActionText}>ล้าง</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.drawingToolLabel}>สี</Text>
        {renderColorOptions()}
      </View>
    );
  }
  
  // Default empty view
  return null;
};

const styles = StyleSheet.create({
  drawingToolContent: {
    padding: 16,
  },
  drawingToolLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  colorOptionSelected: {
    borderColor: 'white',
    transform: [{ scale: 1.2 }],
  },
  whiteColorOption: {
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  brushSizeOptions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  brushSizeOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  brushSizeOptionSelected: {
    borderColor: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  brushSizeSample: {
    borderRadius: 50,
  },
  brushControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  drawingActions: {
    flexDirection: 'row',
    gap: 20,
  },
  drawingActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawingActionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
}); 