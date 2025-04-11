import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { F } from '@faker-js/faker/dist/airline-BLb3y-7w';

type EditMode = 'filter' | 'adjust' | 'crop' | 'draw' | 'text' | 'effects';

interface EditModeTabsProps {
  currentMode: EditMode;
  onModeChange: (mode: EditMode) => void;
  showAdvancedModes?: boolean;
}

export const EditModeTabs: React.FC<EditModeTabsProps> = ({
  currentMode,
  onModeChange,
  showAdvancedModes = false,
}) => {
  // Define basic tabs that are always shown
  const basicTabs = [
    {
      id: 'filter' as const,
      name: 'ฟิลเตอร์',
      icon: (color: string) => <MaterialCommunityIcons name="image-filter-vintage" size={22} color={color} />,
    },
    {
      id: 'adjust' as const,
      name: 'ปรับแต่ง',
      icon: (color: string) => <Feather name="sliders" size={22} color={color} />,
    },
    {
      id: 'crop' as const,
      name: 'ครอป',
      icon: (color: string) => <Feather name="crop" size={22} color={color} />,
    },
  ];

  // Advanced tabs only shown when showAdvancedModes is true
  const advancedTabs = [
    {
      id: 'draw' as const,
      name: 'วาด',
      icon: (color: string) => <MaterialCommunityIcons name="brush" size={22} color={color} />,
    },
    {
      id: 'text' as const,
      name: 'ข้อความ',
      icon: (color: string) => <MaterialCommunityIcons name="format-text" size={22} color={color} />,
    },
    {
      id: 'effects' as const,
      name: 'เอฟเฟกต์',
      icon: (color: string) => <MaterialCommunityIcons name="star-four-points" size={22} color={color} />,
    },
  ];

  // Get tabs based on mode
  const tabs = showAdvancedModes ? advancedTabs : basicTabs;

  return (


    <ScrollView
      horizontal
      style={styles.editTabs}
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled={true}
      directionalLockEnabled={false}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.editTab, currentMode === tab.id && styles.activeEditTab]}
          onPress={() => onModeChange(tab.id)}
          activeOpacity={0.7}
        >
          {tab.icon(currentMode === tab.id ? '#3897f0' : '#fff')}
          <Text style={[styles.editTabText, currentMode === tab.id && styles.activeEditTabText]}>
            {tab.name}
          </Text>
          {currentMode === tab.id && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    margin: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  editTabs: {
    flex: 1
  },
  editTab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    position: 'relative',
    minWidth: 100,
  },
  activeEditTab: {
    backgroundColor: 'rgba(56, 151, 240, 0.15)',
  },
  editTabText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  activeEditTabText: {
    color: '#3897f0',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    height: 3,
    width: 20,
    backgroundColor: '#3897f0',
    borderRadius: 1.5,
    alignSelf: 'center',
  },
});