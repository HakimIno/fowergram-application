import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { 
  EditSubMode, 
  DRAWING_TOOLS, 
  TEXT_TOOLS, 
  EFFECTS_TOOLS,
  Tool
} from '../types';

interface CreativeToolbarProps {
  editSubMode: EditSubMode;
  activeTool: string;
  onToolSelect: (toolId: string) => void;
}

export const CreativeToolbar: React.FC<CreativeToolbarProps> = ({ 
  editSubMode, 
  activeTool, 
  onToolSelect 
}) => {
  // Select the appropriate tools based on the edit sub-mode
  const getToolsForSubMode = (subMode: EditSubMode): Tool[] => {
    switch (subMode) {
      case 'draw':
        return DRAWING_TOOLS;
      case 'text':
        return TEXT_TOOLS;
      case 'effects':
        return EFFECTS_TOOLS;
      default:
        return [];
    }
  };

  const tools = getToolsForSubMode(editSubMode);

  if (tools.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.creativeToolsContainer}
        alwaysBounceHorizontal={true}
        directionalLockEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[
              styles.creativeTool,
              activeTool === tool.id && styles.creativeToolActive
            ]}
            onPress={() => onToolSelect(tool.id)}
          >
            <View style={styles.creativeToolIconContainer}>
              {tool.icon(activeTool === tool.id ? '#3897f0' : 'rgba(255, 255, 255, 0.9)')}
            </View>
            <Text style={[
              styles.creativeToolText,
              activeTool === tool.id && styles.creativeToolTextActive
            ]}>
              {tool.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'visible',
  },
  creativeToolsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  creativeTool: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  creativeToolActive: {
    backgroundColor: 'rgba(56, 151, 240, 0.15)',
  },
  creativeToolIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  creativeToolText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    textAlign: 'center',
  },
  creativeToolTextActive: {
    color: '#3897f0',
    fontWeight: '500',
  },
}); 