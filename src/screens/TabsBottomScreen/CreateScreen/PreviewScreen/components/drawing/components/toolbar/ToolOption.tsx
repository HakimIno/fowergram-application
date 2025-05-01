import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ToolMode } from '../../types';

interface ToolOptionProps {
    mode: ToolMode,
    currentMode: ToolMode,
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    label: string,
    onPress: () => void
}

const ToolOption = React.memo(({
    mode,
    currentMode,
    icon,
    label,
    onPress
}: ToolOptionProps) => (
    <TouchableOpacity
        style={[
            styles.toolOption,
            mode === currentMode && styles.selectedOption
        ]}
        onPress={onPress}
    >
        <MaterialCommunityIcons name={icon} size={22} color="white" />
    </TouchableOpacity>
));

const styles = StyleSheet.create({
    toolOption: {
        paddingHorizontal: 2,
        paddingVertical: 1,
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#333',
        backgroundColor: '#2A2A2A',
    },
    toolLabel: {
        color: '#E0E0E0',
        fontSize: 12,
        marginTop: 6,
    },
    selectedOption: {
        borderColor: '#007AFF',
        borderWidth: 1,
        backgroundColor: '#0A3A8F',
    },
});

export default ToolOption; 