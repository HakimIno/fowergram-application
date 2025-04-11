import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  children?: ReactNode;
}

/**
 * Header component for the edit screen
 */
export const Header: React.FC<HeaderProps> = ({ 
  onBack, 
  onSave, 
  isSaving,
  children
}) => (
  <View style={styles.header}>
    <View style={styles.leftContainer}>
      <TouchableOpacity 
        onPress={onBack} 
        style={styles.headerButton}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      >
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>
      {children}
    </View>
    
    <TouchableOpacity 
      onPress={onSave} 
      style={styles.saveButton}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      disabled={isSaving}
    >
      <Text style={styles.saveText}>{isSaving ? 'กำลังบันทึก...' : 'เสร็จสิ้น'}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  saveButton: {
    padding: 12,
    backgroundColor: '#3897f0',
    borderRadius: 25,
    paddingHorizontal: 20,
    shadowColor: '#3897f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
}); 