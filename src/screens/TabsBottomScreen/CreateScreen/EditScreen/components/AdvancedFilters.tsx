import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Canvas, Image, ColorMatrix, BlurMask, Shader } from '@shopify/react-native-skia';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';

interface FilterOption {
  name: string;
  matrix: number[];
}

type FilterOptions = {
  [key: string]: FilterOption;
};

interface AdvancedFiltersProps {
  image: any;
  width: number;
  height: number;
  onFilterChange?: (filter: string) => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  image,
  width,
  height,
  onFilterChange,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('normal');
  const [intensity, setIntensity] = useState(1);

  // Advanced filter presets
  const filters: FilterOptions = {
    normal: {
      name: 'Normal',
      matrix: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    },
    vintage: {
      name: 'Vintage',
      matrix: [0.9, 0.5, 0.1, 0, 0, 0.3, 0.8, 0.1, 0, 0, 0.2, 0.3, 0.5, 0, 0, 0, 0, 0, 1, 0],
    },
    dramatic: {
      name: 'Dramatic',
      matrix: [1.5, -0.3, -0.1, 0, -0.1, -0.3, 1.5, -0.1, 0, -0.1, -0.3, -0.3, 1.5, 0, -0.1, 0, 0, 0, 1, 0],
    },
    cinematic: {
      name: 'Cinematic',
      matrix: [1.3, -0.2, 0, 0, -0.05, -0.2, 1.2, -0.1, 0, -0.05, 0, -0.1, 1.3, 0, -0.05, 0, 0, 0, 1, 0],
    },
    moody: {
      name: 'Moody',
      matrix: [0.8, 0.1, 0, 0, -0.1, 0.1, 0.8, 0.1, 0, -0.1, 0, 0.1, 0.9, 0, -0.1, 0, 0, 0, 1, 0],
    },
    goldenHour: {
      name: 'Golden Hour',
      matrix: [1.2, 0.2, 0, 0, 0, 0.1, 1.1, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 1, 0],
    },
    cyberpunk: {
      name: 'Cyberpunk',
      matrix: [0.8, 0, 0.2, 0, 0, 0, 1, 0.4, 0, 0, 0.2, 0, 1.3, 0, 0, 0, 0, 0, 1, 0],
    },
    forestMist: {
      name: 'Forest Mist',
      matrix: [0.8, 0.2, 0, 0, 0, 0.2, 1, 0.1, 0, 0, 0, 0.1, 0.9, 0, 0, 0, 0, 0, 1, 0],
    },
  };

  // Apply filter with intensity
  const applyFilter = (filter: string) => {
    setSelectedFilter(filter);
    onFilterChange?.(filter);
  };

  // Render filter preview
  const renderFilterPreview = (filter: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterPreview,
        selectedFilter === filter && styles.selectedFilter,
      ]}
      onPress={() => applyFilter(filter)}
    >
      <Canvas style={styles.previewCanvas}>
        {image && (
          <Image
            image={image}
            fit="cover"
            x={0}
            y={0}
            width={80}
            height={80}
          >
            <ColorMatrix matrix={filters[filter].matrix} />
          </Image>
        )}
      </Canvas>
      <Text style={[
        styles.filterName,
        selectedFilter === filter && styles.selectedFilterName,
      ]}>
        {filters[filter].name}
      </Text>
    </TouchableOpacity>
  );

  // Render intensity slider
  const renderIntensitySlider = () => (
    <View style={styles.intensityContainer}>
      <Text style={styles.intensityLabel}>Intensity</Text>
      <Slider
        style={styles.intensitySlider}
        minimumValue={0}
        maximumValue={2}
        value={intensity}
        onValueChange={setIntensity}
        minimumTrackTintColor="#3897f0"
        maximumTrackTintColor="#666"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {Object.keys(filters).map(renderFilterPreview)}
      </ScrollView>

      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.controlsContainer}
      >
        {renderIntensitySlider()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  filterPreview: {
    marginRight: 16,
    alignItems: 'center',
  },
  selectedFilter: {
    backgroundColor: 'rgba(56,151,240,0.2)',
    borderRadius: 8,
    padding: 4,
  },
  previewCanvas: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  filterName: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
  },
  selectedFilterName: {
    color: '#3897f0',
    fontWeight: 'bold',
  },
  controlsContainer: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intensityLabel: {
    color: '#fff',
    marginRight: 16,
    width: 80,
  },
  intensitySlider: {
    flex: 1,
  },
}); 