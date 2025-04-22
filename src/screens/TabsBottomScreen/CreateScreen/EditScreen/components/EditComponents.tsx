import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Animated, { FadeIn, FadeOut, useAnimatedStyle } from 'react-native-reanimated';
import { Canvas, Image, ColorMatrix } from '@shopify/react-native-skia';
import { Adjustment, Filter, FILTER_CATEGORIES } from '../imageUtils';
import { BlurView } from 'expo-blur';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { BottomSheetContent } from './BottomSheetContent';

// หมวดหมู่การแก้ไขภาพ
const EDIT_CATEGORIES = [
  {
    id: 'basic',
    name: 'พื้นฐาน',
    icon: 'sliders-h',
    adjustments: ['brightness', 'contrast', 'saturation', 'exposure', 'highlights', 'shadows']
  },
  {
    id: 'color',
    name: 'สี',
    icon: 'palette',
    adjustments: ['temperature', 'tint', 'vibrance', 'color-balance', 'color-mix', 'duotone']
  },
  {
    id: 'effects',
    name: 'เอฟเฟกต์',
    icon: 'magic',
    adjustments: ['blur', 'sharpen', 'structure', 'vignette', 'grain', 'noise', 'pixelate', 'mosaic']
  },
  {
    id: 'style',
    name: 'สไตล์',
    icon: 'paint-brush',
    adjustments: ['fade', 'split-tone', 'colorize', 'posterize', 'emboss', 'edge-detect']
  },
  {
    id: 'transform',
    name: 'ปรับแต่ง',
    icon: 'crop',
    adjustments: ['rotate', 'flip', 'perspective', 'aspect-ratio', 'resize']
  },
  {
    id: 'filters',
    name: 'ฟิลเตอร์',
    icon: 'filter',
    adjustments: ['preset-filters', 'custom-filters', 'lut', 'gradient-map']
  }
];

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
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={28} color="white" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>แก้ไขรูปภาพ</Text>
    <TouchableOpacity
      onPress={onSave}
      style={styles.saveButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      disabled={isSaving}
    >
      <Text style={styles.saveText}>{isSaving ? 'กำลังบันทึก...' : 'เสร็จสิ้น'}</Text>
    </TouchableOpacity>
  </View>
);

/**
 * Edit categories component - improved version
 */
export const EditCategories = ({
  currentCategory,
  onCategoryChange
}: {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
}) => {
  // Group the categories into rows of 3 for better layout
  const rows = [];
  for (let i = 0; i < EDIT_CATEGORIES.length; i += 3) {
    rows.push(EDIT_CATEGORIES.slice(i, i + 3));
  }

  return (
    <View style={styles.categoriesWrapper}>
      <BlurView intensity={15} tint="dark" style={styles.categoriesBlur}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {EDIT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                currentCategory === category.id && styles.activeCategoryButton
              ]}
              onPress={() => onCategoryChange(category.id)}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name={category.icon}
                size={20}
                color={currentCategory === category.id ? '#4f46e5' : '#fff'}
              />
              <Text style={[
                styles.categoryText,
                currentCategory === category.id && styles.activeCategoryText
              ]}>
                {category.name}
              </Text>
              {currentCategory === category.id && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BlurView>
    </View>
  );
};

/**
 * Adjustment icon component - improved version
 */
export const AdjustmentIcon = ({
  adjustment,
  value,
  onPress,
  isSelected
}: {
  adjustment: Adjustment;
  value: number;
  onPress: () => void;
  isSelected: boolean;
}) => {
  const getIcon = useCallback(() => {
    switch (adjustment.name.toLowerCase()) {
      case 'brightness':
        return 'sun';
      case 'contrast':
        return 'adjust';
      case 'saturation':
        return 'tint';
      case 'temperature':
        return 'thermometer-half';
      case 'tint':
        return 'palette';
      case 'highlights':
        return 'sun';
      case 'shadows':
        return 'moon';
      case 'blur':
        return 'blur';
      case 'sharpen':
        return 'cut';
      case 'structure':
        return 'layer-group';
      case 'vignette':
        return 'circle';
      case 'fade':
        return 'feather';
      case 'grain':
        return 'noise';
      default:
        return 'sliders-h';
    }
  }, [adjustment.name]);

  const isActive = Math.abs(value - adjustment.default) > 0.01;

  const getPercentage = useCallback(() => {
    if (isActive) {
      // Calculate percentage from range
      const range = adjustment.max - adjustment.min;
      const normalizedValue = value - adjustment.min;
      return Math.round((normalizedValue / range) * 100);
    }
    return null;
  }, [isActive, value, adjustment.max, adjustment.min, adjustment.default]);

  return (
    <TouchableOpacity
      style={[
        styles.adjustmentIcon,
        isActive && styles.activeAdjustmentIcon,
        isSelected && styles.selectedAdjustmentIcon
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.adjustmentIconContent}>
        <FontAwesome5
          name={getIcon()}
          size={22}
          color={isActive ? '#4f46e5' : '#fff'}
        />
        <Text style={[
          styles.adjustmentIconText,
          isActive && styles.activeAdjustmentIconText
        ]}>
          {adjustment.name}
        </Text>
      </View>

      {isActive && (
        <View style={styles.adjustmentValueBadge}>
          <Text style={styles.adjustmentValueText}>
            {getPercentage()}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * Adjustment content component - improved version
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
}) => {
  const [selectedCategory, setSelectedCategory] = useState('basic');
  const [selectedAdjustment, setSelectedAdjustment] = useState<number | null>(null);

  const currentCategory = EDIT_CATEGORIES.find(cat => cat.id === selectedCategory);
  const categoryAdjustments = currentCategory?.adjustments || [];

  const filteredAdjustmentIndices = adjustments
    .map((adj, index) => ({ index, name: adj.name.toLowerCase() }))
    .filter(item => categoryAdjustments.includes(item.name))
    .map(item => item.index);

  const handleAdjustmentSelect = useCallback((index: number) => {
    if (selectedAdjustment === index) {
      setSelectedAdjustment(null);
    } else {
      setSelectedAdjustment(index);
    }
  }, [selectedAdjustment]);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.adjustmentContent}
    >
      {/* Categories */}
      <GestureHandlerRootView style={{ width: '100%' }}>
        <EditCategories
          currentCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </GestureHandlerRootView>

      {/* Adjustments Icons Grid */}
      <GestureHandlerRootView style={styles.adjustmentsGridContainer}>
        <ScrollView
          contentContainerStyle={styles.adjustmentsGrid}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {filteredAdjustmentIndices.map((adjIndex) => (
            <AdjustmentIcon
              key={adjustments[adjIndex].name}
              adjustment={adjustments[adjIndex]}
              value={values[adjIndex]}
              onPress={() => handleAdjustmentSelect(adjIndex)}
              isSelected={selectedAdjustment === adjIndex}
            />
          ))}

          {/* Reset Button inside scroll to ensure it's always accessible */}
          <View style={styles.resetButtonContainer}>
            <ResetButton onReset={onReset} />
          </View>
        </ScrollView>
      </GestureHandlerRootView>

      {/* Slider for selected adjustment */}
      {selectedAdjustment !== null && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.sliderContainer}
        >
          <BlurView intensity={15} tint="dark" style={styles.sliderBlurContainer}>
            <AdjustmentSlider
              adjustment={adjustments[selectedAdjustment]}
              index={selectedAdjustment}
              value={values[selectedAdjustment]}
              onChange={onAdjustmentChange}
            />
          </BlurView>
        </Animated.View>
      )}
    </Animated.View>
  );
};

/**
 * Filter thumbnail component - improved version
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
    style={[
      styles.filterThumbnail,
      selectedIndex === index && styles.selectedFilterThumbnail
    ]}
    onPress={() => onSelect(index)}
    activeOpacity={0.7}
  >
    <Canvas style={styles.filterCanvas}>
      {image && (
        <Image
          image={image}
          fit="cover"
          x={0}
          y={0}
          width={80}
          height={80}
        >
          <ColorMatrix matrix={filter.matrix} />
        </Image>
      )}
    </Canvas>
    <Text style={[
      styles.filterName,
      selectedIndex === index && styles.selectedFilterName
    ]}>
      {filter.name}
    </Text>
  </TouchableOpacity>
);


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

  const increment = useCallback(() => {
    const newValue = Math.min(adjustment.max, value + (adjustment.max - adjustment.min) * 0.05);
    onChange(index, newValue);
  }, [value, adjustment.max, adjustment.min, index, onChange]);

  const decrement = useCallback(() => {
    const newValue = Math.max(adjustment.min, value - (adjustment.max - adjustment.min) * 0.05);
    onChange(index, newValue);
  }, [value, adjustment.max, adjustment.min, index, onChange]);

  const reset = useCallback(() => {
    onChange(index, adjustment.default);
  }, [index, adjustment.default, onChange]);

  return (
    <View style={styles.sliderWrapper}>
      <View style={styles.sliderLabelContainer}>
        <Text style={styles.sliderLabel}>{adjustment.name}</Text>
        <Text style={styles.sliderValue}>
          {percentage}%
        </Text>
      </View>

      <View style={styles.sliderRow}>
        <TouchableOpacity
          style={styles.sliderButton}
          onPress={decrement}
        >
          <Feather name="minus" size={18} color="#fff" />
        </TouchableOpacity>

        <Slider
          style={styles.slider}
          minimumValue={adjustment.min}
          maximumValue={adjustment.max}
          value={value}
          onValueChange={(val) => onChange(index, val)}
          minimumTrackTintColor="#4f46e5"
          maximumTrackTintColor="rgba(255,255,255,0.3)"
          thumbTintColor="#fff"
        />

        <TouchableOpacity
          style={styles.sliderButton}
          onPress={increment}
        >
          <Feather name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.resetValueButton}
        onPress={reset}
      >
        <Text style={styles.resetValueText}>รีเซ็ตค่า</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Reset button component - improved version
 */
export const ResetButton = ({ onReset }: { onReset: () => void }) => (
  <TouchableOpacity
    style={styles.resetButton}
    onPress={onReset}
    activeOpacity={0.7}
  >
    <Feather name="refresh-cw" size={16} color="#fff" />
    <Text style={styles.resetText}>รีเซ็ตทั้งหมด</Text>
  </TouchableOpacity>
);

/**
 * Filter content component - improved version with categories
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
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('basic');

  // Use useCallback to memoize this function
  const getFilterIndexInFlatArray = useCallback((categoryId: string, filterIndexInCategory: number): number => {
    let count = 0;
    for (const category of FILTER_CATEGORIES) {
      if (category.id === categoryId) {
        return count + filterIndexInCategory;
      }
      count += category.filters.length;
    }
    return 0;
  }, []);

  // Current category
  const currentCategory = useMemo(() =>
    FILTER_CATEGORIES.find((cat) => cat.id === selectedCategory) || FILTER_CATEGORIES[0],
    [selectedCategory]);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={styles.contentContainer}
    >
      {/* Filter Categories */}
      <GestureHandlerRootView style={{ width: '100%' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterCategoriesContainer}
          scrollEventThrottle={16}
          bounces={false}  // ปิดการกระเด้ง
          nestedScrollEnabled={true}
          disableIntervalMomentum={false}
        >
          {FILTER_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.filterCategoryText,
                selectedCategory === category.id && styles.selectedFilterCategoryText
              ]}>
                {category.name}
              </Text>
              {selectedCategory === category.id && (
                <View style={styles.filterCategoryIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </GestureHandlerRootView>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          scrollEventThrottle={16}
          bounces={false}  // ปิดการกระเด้ง
          nestedScrollEnabled={true}
          disableIntervalMomentum={false}
        >
          {currentCategory.filters.map((filter, index) => (
            <FilterThumbnail
              key={filter.name}
              filter={filter}
              index={getFilterIndexInFlatArray(currentCategory.id, index)}
              selectedIndex={selectedFilter}
              image={image}
              onSelect={onFilterSelect}
            />
          ))}
        </ScrollView>
      </View>
    </Animated.View>
  );
};

/**
 * Crop content component - improved version
 */
export const CropContent = () => (
  <Animated.View
    entering={FadeIn.duration(300)}
    exiting={FadeOut.duration(300)}
    style={styles.contentContainer}
  >
    <View style={styles.cropContainer}>
      <BlurView intensity={15} tint="dark" style={styles.cropInstructionsContainer}>
        <Text style={styles.cropInstructions}>
          <Feather name="info" size={14} color="rgba(255,255,255,0.7)" /> ลากเพื่อปรับขนาดรูปภาพ
        </Text>
      </BlurView>

      <View style={styles.cropActionRow}>
        <TouchableOpacity style={styles.cropActionButton}>
          <BlurView intensity={15} tint="dark" style={styles.cropActionButtonBlur}>
            <MaterialCommunityIcons name="rotate-left" size={22} color="#fff" />
            <Text style={styles.cropActionText}>หมุนซ้าย</Text>
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cropActionButton}>
          <BlurView intensity={15} tint="dark" style={styles.cropActionButtonBlur}>
            <MaterialCommunityIcons name="rotate-right" size={22} color="#fff" />
            <Text style={styles.cropActionText}>หมุนขวา</Text>
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cropActionButton}>
          <BlurView intensity={15} tint="dark" style={styles.cropActionButtonBlur}>
            <MaterialCommunityIcons name="aspect-ratio" size={22} color="#fff" />
            <Text style={styles.cropActionText}>สัดส่วน</Text>
          </BlurView>
        </TouchableOpacity>
      </View>
    </View>
  </Animated.View>
);

// Improved styles
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
    backgroundColor: '#4f46e5',
    borderRadius: 25,
    paddingHorizontal: 20,
    shadowColor: '#4f46e5',
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
    color: '#4f46e5',
  },
  contentContainer: {
    flex: 1,
  },
  filtersContainer: {
    flex: 1,
    padding: 10,
  },
  filtersTitleContainer: {
    marginBottom: 15,
    alignSelf: 'flex-start',
    marginLeft: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  filtersTitleBlur: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  filtersTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  filtersList: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  filterThumbnail: {
    marginRight: 20,
    alignItems: 'center',
    position: 'relative',
  },
  selectedFilterThumbnail: {
    transform: [{ scale: 1.05 }],
  },
  filterCanvas: {
    width: 80,
    height: 80,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedFilterName: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  filterName: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
  },
  activeFilterIndicator: {
    position: 'absolute',
    bottom: 20,
    height: 3,
    width: 20,
    backgroundColor: '#4f46e5',
    borderRadius: 1.5,
  },
  cropContainer: {
    flex: 1,
    padding: 15,
  },
  cropInstructionsContainer: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cropInstructions: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cropActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
  },
  cropActionButton: {
    overflow: 'hidden',
    borderRadius: 18,
  },
  cropActionButtonBlur: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cropActionText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  categoriesWrapper: {
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
  },
  categoriesBlur: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 5,
  },
  categoriesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeCategoryButton: {
    backgroundColor: 'rgba(56, 151, 240, 0.2)',
    borderColor: 'rgba(56, 151, 240, 0.5)',
  },
  categoryText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#4f46e5',
    borderRadius: 1.5,
  },
  adjustmentContent: {
    flex: 1,
    paddingBottom: 20,
  },
  adjustmentsGridContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  adjustmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 100, // Extra space for scrolling
  },
  adjustmentIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',  // 3 items per row
    aspectRatio: 1,
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  adjustmentIconContent: {
    alignItems: 'center',
  },
  activeAdjustmentIcon: {
    backgroundColor: 'rgba(56, 151, 240, 0.15)',
    borderColor: 'rgba(56, 151, 240, 0.3)',
  },
  selectedAdjustmentIcon: {
    backgroundColor: 'rgba(56, 151, 240, 0.25)',
    borderColor: 'rgba(56, 151, 240, 0.7)',
  },
  adjustmentIconText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  activeAdjustmentIconText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  adjustmentValueBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    width: 32,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustmentValueText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  resetButtonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.4)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  resetText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    right: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sliderBlurContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 18,
  },
  sliderWrapper: {
    width: '100%',
  },
  sliderLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sliderLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sliderValue: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '700',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
  resetValueButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetValueText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  filterCategoriesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  filterCategoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  selectedFilterCategoryButton: {
    color: '#fff',
  },
  filterCategoryText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedFilterCategoryText: {
    color: '#4f46e5',
  },
  filterCategoryIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#4f46e5',
    borderRadius: 1.5,
  },
}); 