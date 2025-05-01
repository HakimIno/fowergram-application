import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToolMode, StrokeStyleType } from '../../../types';
import StyleList from './StyleList';

interface StylePickerProps {
    selectedStyle: StrokeStyleType;
    onStyleSelect: (style: StrokeStyleType) => void;
}

const StylePicker = React.memo(({
    selectedStyle,
    onStyleSelect
}: StylePickerProps) => {

    return (
        <View style={styles.toolbarSection}>
            <Text style={styles.sectionTitle}>รูปแบบเส้น</Text>
            <StyleList
                selectedStyle={selectedStyle}
                onStyleSelect={onStyleSelect}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    toolbarSection: {
        paddingHorizontal: 6,
    },
    sectionTitle: {
        fontSize: 12,
        marginBottom: 6,
        color: '#E0E0E0',
    },
});

export default StylePicker; 