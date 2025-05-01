import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToolMode } from '../../../types';
import ToolOption from '../ToolOption';

interface ToolSelectorProps {
  toolMode: ToolMode;
  onToolModeChange: (mode: ToolMode) => void;
}

const ToolSelector = React.memo(({ toolMode, onToolModeChange }: ToolSelectorProps) => (
  <View style={styles.toolbarSection}>
    <Text style={styles.sectionTitle}>เครื่องมือ</Text>
   
  </View>
));

const styles = StyleSheet.create({
  toolbarSection: {
    marginBottom: 6,
    padding: 10
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

export default ToolSelector; 