import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Canvas, Image, ColorMatrix } from '@shopify/react-native-skia';
import { Adjustment, Filter } from './imageUtils';

/**
 * Header component for the edit screen
 */
export const Header = ({ 
  onBack, 
  onSave, 
  isSaving 
}: { 
  onBack: () => void; 
  onSave: () => void; 
  isSaving: boolean;
}) => (
  <View style={styles.header}>
    <TouchableOpacity 
      onPress={onBack} 
      style={styles.headerButton}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
    >
      <Ionicons name="chevron-back" size={28} color="white" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Edit Photo</Text>
    <TouchableOpacity 
      onPress={onSave} 
      style={styles.saveButton}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      disabled={isSaving}
    >
      <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Done'}</Text>
    </TouchableOpacity>
  </View>
);

/**
 * Edit mode tabs component
 */
export const EditModeTabs = ({ 
  currentMode, 
  onModeChange 
}: { 
  currentMode: 'filter' | 'adjust' | 'crop'; 
  onModeChange: (mode: 'filter' | 'adjust' | 'crop') => void;
}) => (
  <View style={styles.editTabs}>
    <TouchableOpacity
      style={[styles.editTab, currentMode === 'filter' && styles.activeEditTab]}
      onPress={() => onModeChange('filter')}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons 
        name="image-filter-vintage" 
        size={22} 
        color={currentMode === 'filter' ? '#3897f0' : '#888'} 
      />
      <Text style={[styles.editTabText, currentMode === 'filter' && styles.activeEditTabText]}>Filters</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.editTab, currentMode === 'adjust' && styles.activeEditTab]}
      onPress={() => onModeChange('adjust')}
      activeOpacity={0.7}
    >
      <Feather 
        name="sliders" 
        size={22} 
        color={currentMode === 'adjust' ? '#3897f0' : '#888'} 
      />
      <Text style={[styles.editTabText, currentMode === 'adjust' && styles.activeEditTabText]}>Adjust</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.editTab, currentMode === 'crop' && styles.activeEditTab]}
      onPress={() => onModeChange('crop')}
      activeOpacity={0.7}
    >
      <Feather 
        name="crop" 
        size={22} 
        color={currentMode === 'crop' ? '#3897f0' : '#888'} 
      />
      <Text style={[styles.editTabText, currentMode === 'crop' && styles.activeEditTabText]}>Crop</Text>
    </TouchableOpacity>
  </View>
);

/**
 * Filter thumbnail component
 */
export const FilterThumbnail = ({ 
  filter, 
  index, 
  selectedIndex, 
  image, 
  onSelect 
}: { 
  filter: Filter; 
  index: number; 
  selectedIndex: number; 
  image: any; 
  onSelect: (index: number) => void;
}) => (
  <TouchableOpacity
    key={filter.name}
    onPress={() => onSelect(index)}
    style={[
      styles.filterThumbnail,
      { borderColor: selectedIndex === index ? '#3897f0' : 'transparent' }
    ]}
  >
    <Canvas style={styles.filterThumbnailCanvas}>
      {image && (
        <Image
          image={image}
          fit="cover"
          x={0}
          y={0}
          width={70}
          height={70}
        >
          <ColorMatrix matrix={filter.matrix} />
        </Image>
      )}
    </Canvas>
    <View style={[
      styles.filterNameContainer, 
      selectedIndex === index && styles.activeFilterNameContainer
    ]}>
      <Text style={[
        styles.filterName, 
        selectedIndex === index && styles.activeFilterName
      ]}>
        {filter.name}
      </Text>
    </View>
  </TouchableOpacity>
);

/**
 * Adjustment slider component
 */
export const AdjustmentSlider = ({ 
  adjustment, 
  index, 
  value, 
  onChange 
}: { 
  adjustment: Adjustment; 
  index: number; 
  value: number; 
  onChange: (index: number, value: number) => void;
}) => {
  const percentage = Math.round(((value - adjustment.min) / (adjustment.max - adjustment.min)) * 100);
  
  return (
    <View style={styles.adjustmentContainer}>
      <View style={styles.adjustmentLabelRow}>
        <Text style={styles.adjustmentName}>{adjustment.name}</Text>
        <Text style={styles.adjustmentValue}>{percentage}%</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={adjustment.min}
        maximumValue={adjustment.max}
        value={value}
        onValueChange={(value) => onChange(index, value)}
        minimumTrackTintColor="#3897f0"
        maximumTrackTintColor="#333"
        thumbTintColor="#fff"
        tapToSeek={true}
      />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderMinLabel}>Min</Text>
        <Text style={styles.sliderMaxLabel}>Max</Text>
      </View>
    </View>
  );
};

/**
 * Reset button component
 */
export const ResetButton = ({ onReset }: { onReset: () => void }) => (
  <TouchableOpacity 
    style={styles.resetButton} 
    onPress={onReset}
    activeOpacity={0.7}
  >
    <Feather name="refresh-ccw" size={16} color="#3897f0" style={styles.resetIcon} />
    <Text style={styles.resetButtonText}>Reset All</Text>
  </TouchableOpacity>
);

/**
 * Filter content component
 */
export const FilterContent = ({ 
  filters, 
  selectedFilter, 
  image, 
  onFilterSelect 
}: { 
  filters: Filter[]; 
  selectedFilter: number; 
  image: any; 
  onFilterSelect: (index: number) => void;
}) => (
  <Animated.View 
    entering={FadeIn.duration(300)} 
    exiting={FadeOut.duration(300)}
    style={styles.contentContainer}
  >
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
      decelerationRate="fast"
      snapToInterval={86} // Width of filter thumbnail + margins
    >
      {filters.map((filter, index) => (
        <FilterThumbnail
          key={filter.name}
          filter={filter}
          index={index}
          selectedIndex={selectedFilter}
          image={image}
          onSelect={onFilterSelect}
        />
      ))}
    </Animated.ScrollView>
  </Animated.View>
);

/**
 * Adjustment content component
 */
export const AdjustmentContent = ({ 
  adjustments, 
  values, 
  onAdjustmentChange, 
  onReset 
}: { 
  adjustments: Adjustment[]; 
  values: number[]; 
  onAdjustmentChange: (index: number, value: number) => void; 
  onReset: () => void;
}) => (
  <Animated.View 
    entering={FadeIn.duration(300)} 
    exiting={FadeOut.duration(300)}
    style={styles.contentContainer}
  >
    <View style={styles.adjustmentsContainer}>
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.adjustmentsScrollContent}
      >
        {adjustments.map((adjustment, index) => (
          <AdjustmentSlider
            key={adjustment.name}
            adjustment={adjustment}
            index={index}
            value={values[index]}
            onChange={onAdjustmentChange}
          />
        ))}
        <ResetButton onReset={onReset} />
      </Animated.ScrollView>
    </View>
  </Animated.View>
);

/**
 * Crop content component
 */
export const CropContent = () => (
  <Animated.View 
    entering={FadeIn.duration(300)} 
    exiting={FadeOut.duration(300)}
    style={styles.contentContainer}
  >
    <View style={styles.cropContainer}>
      <Text style={styles.cropInstructions}>
        <Feather name="info" size={14} color="rgba(255,255,255,0.7)" /> Pinch and drag to adjust the image
      </Text>
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 10,
    zIndex: 2,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
    backgroundColor: 'rgba(56, 151, 240, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  saveText: {
    color: '#3897f0',
    fontSize: 16,
    fontWeight: '600',
  },
  editTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  editTab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeEditTab: {
    backgroundColor: 'rgba(56, 151, 240, 0.15)',
  },
  editTabText: {
    color: '#888',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  activeEditTabText: {
    color: '#3897f0',
  },
  contentContainer: {
    flex: 1,
  },
  filtersContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    alignItems: 'center',
  },
  filterThumbnail: {
    marginHorizontal: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  filterThumbnailCanvas: {
    width: 70,
    height: 70,
  },
  filterNameContainer: {
    padding: 5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: '100%',
  },
  activeFilterNameContainer: {
    backgroundColor: 'rgba(56, 151, 240, 0.2)',
  },
  filterName: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  activeFilterName: {
    color: 'white',
    fontWeight: '600',
  },
  adjustmentsContainer: {
    paddingVertical: 15,
    flex: 1,
  },
  adjustmentsScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  adjustmentContainer: {
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adjustmentLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  adjustmentName: {
    color: 'white',
    fontWeight: '500',
    fontSize: 15,
  },
  adjustmentValue: {
    color: '#3897f0',
    fontWeight: '600',
    fontSize: 14,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  sliderMinLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
  },
  sliderMaxLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
  },
  resetButton: {
    backgroundColor: 'rgba(56, 151, 240, 0.15)',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  resetIcon: {
    marginRight: 8,
  },
  resetButtonText: {
    color: '#3897f0',
    fontWeight: '600',
    fontSize: 16,
  },
  cropContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    flex: 1,
  },
  cropInstructions: {
    color: 'white',
    opacity: 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
}); 