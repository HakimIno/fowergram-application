import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedSlider from '../../AnimatedSlider';
import { ToolMode } from '../../../types';
import ToolOption from '../ToolOption';

interface BrushSizeSliderProps {
    toolMode: ToolMode;
    brushSize: number;
    onSizeChange: (value: number) => void;
    onToolModeChange: (mode: ToolMode) => void;
}

const BrushSizeSlider = React.memo(({
    toolMode,
    brushSize,
    onSizeChange,
    onToolModeChange
}: BrushSizeSliderProps) => (
    <View style={styles.toolbarSection}>
        <Text style={styles.sectionTitle}>
            {toolMode === 'draw' ? 'ขนาดปากกา' : 'ขนาดยางลบ'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <View style={{ flex: 1 }}>
                <AnimatedSlider
                    value={brushSize}
                    onValueChange={onSizeChange}
                    minimumValue={1}
                    maximumValue={30}
                    minimumTrackTintColor="#3E67FF"
                    maximumTrackTintColor="#333333"
                    thumbTintColor="#ffffff"
                />
            </View>

            <View style={styles.toolsContainer}>
                <ToolOption
                    mode="draw"
                    currentMode={toolMode}
                    icon="pencil"
                    label="ปากกา"
                    onPress={() => onToolModeChange('draw')}
                />
                <ToolOption
                    mode="erase"
                    currentMode={toolMode}
                    icon="eraser"
                    label="ยางลบ"
                    onPress={() => onToolModeChange('erase')}
                />
            </View>
        </View>
    </View>
));

const styles = StyleSheet.create({
    toolbarSection: {
        paddingHorizontal: 6,
    },
    sectionTitle: {
        fontSize: 12,
        color: '#E0E0E0',
    },
    toolsContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
        gap: 12,
    },
});

export default BrushSizeSlider; 