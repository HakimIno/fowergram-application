import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderControlsProps {
  style: any; // Animated style object
  onGoBack: () => void;
  onToggleFullscreen: () => void;
  isFullscreenMode: boolean;
  onSave: () => void;
  isSaving: boolean;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  style,
  onGoBack,
  onToggleFullscreen,
  isFullscreenMode,
  onSave,
  isSaving
}) => {
  return (
    <Animated.View style={[styles.headerContainer, style]}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
        style={styles.headerGradient}
        pointerEvents="none"
      />
      
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={onGoBack}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={onToggleFullscreen}
          >
            <Ionicons 
              name={isFullscreenMode ? "contract" : "expand"} 
              size={22} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.headerActionButton, 
              styles.saveButton
            ]}
            onPress={onSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveButton: {
    width: 'auto',
    paddingHorizontal: 16,
    backgroundColor: '#3897f0',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
}); 