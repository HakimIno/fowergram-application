import React, { memo, useMemo, useCallback } from 'react';
import { Canvas, Image, ColorMatrix, BlurMask, Group, SkImage } from '@shopify/react-native-skia';
import { StyleSheet, View, Dimensions } from 'react-native';
import { FILTERS } from '../imageUtils';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageFiltersProps {
  image: SkImage;
  width: number;
  height: number;
  selectedFilter: number;
  brightnessValue: SharedValue<number>;
  contrastValue: SharedValue<number>;
  saturationValue: SharedValue<number>;
  temperatureValue: SharedValue<number>;
  blurValue: SharedValue<number>;
  highlightsValue: SharedValue<number>;
  shadowsValue: SharedValue<number>;
  vignetteValue: SharedValue<number>;
  fadeValue: SharedValue<number>;
  sharpenValue: SharedValue<number>;
  structureValue: SharedValue<number>;
  grainValue: SharedValue<number>;
  tintValue: SharedValue<number>;
}

// Optimize by memoizing the component
export const ImageFilters = memo<ImageFiltersProps>(({
  image,
  width,
  height,
  selectedFilter,
  brightnessValue,
  contrastValue,
  saturationValue,
  temperatureValue,
  blurValue,
  highlightsValue,
  shadowsValue,
  vignetteValue,
  fadeValue,
  sharpenValue,
  structureValue,
  grainValue,
  tintValue,
}) => {
  // Calculate image dimensions just once per render
  const { displayWidth, displayHeight, offsetX, offsetY } = useMemo(() => {
    // กำหนดขนาดให้เต็มพื้นที่ที่ได้รับมา
    const displayWidth = width;
    const displayHeight = height;
    
    // จัดให้อยู่กึ่งกลาง
    const offsetX = 0;
    const offsetY = 0;
    
    return { displayWidth, displayHeight, offsetX, offsetY };
  }, [width, height]);

  const filterMatrix = useMemo(() => {
    return FILTERS[selectedFilter]?.matrix || FILTERS[0].matrix;
  }, [selectedFilter]);
  
  // Combine brightness and contrast in one derived matrix for better performance
  const brightnessContrastMatrix = useDerivedValue(() => {
    return [
      contrastValue.value, 0, 0, 0, brightnessValue.value * 0.3,
      0, contrastValue.value, 0, 0, brightnessValue.value * 0.3,
      0, 0, contrastValue.value, 0, brightnessValue.value * 0.3,
      0, 0, 0, 1, 0,
    ];
  }, [brightnessValue, contrastValue]);
  
  // Derive saturation matrix
  const saturationMatrix = useDerivedValue(() => {
    return [
      0.3086 + 0.6914 * saturationValue.value, 0.3086 - 0.3086 * saturationValue.value, 0.3086 - 0.3086 * saturationValue.value, 0, 0,
      0.6094 - 0.6094 * saturationValue.value, 0.6094 + 0.3906 * saturationValue.value, 0.6094 - 0.6094 * saturationValue.value, 0, 0,
      0.082 - 0.082 * saturationValue.value, 0.082 - 0.082 * saturationValue.value, 0.082 + 0.918 * saturationValue.value, 0, 0,
      0, 0, 0, 1, 0,
    ];
  }, [saturationValue]);
  
  // Combine temperature and tint for better performance
  const temperatureTintMatrix = useDerivedValue(() => {
    return [
      1 + temperatureValue.value * 0.1, tintValue.value * 0.1, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1 - temperatureValue.value * 0.1, 0, 0,
      0, 0, 0, 1, 0,
    ];
  }, [temperatureValue, tintValue]);
  
  // Optimization: Only create matrices for values that have changed
  // This helps with performance by reducing re-calculations
  
  // Create a unique key for the Canvas to avoid full re-renders on filter change
  const canvasKey = useMemo(() => {
    return `filter-${selectedFilter}-${Date.now()}`;
  }, [selectedFilter]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas style={styles.canvas} key={canvasKey}>
        {image && (
          <Group>
            <Image
              image={image}
              fit="contain"
              x={offsetX}
              y={offsetY}
              width={displayWidth}
              height={displayHeight}
            >
              {/* Apply selected filter */}
              <ColorMatrix matrix={filterMatrix} />
              
              {/* Apply brightness and contrast */}
              <ColorMatrix matrix={brightnessContrastMatrix} />
              
              {/* Apply highlights separately */}
              <ColorMatrix
                matrix={[
                  1, 0, 0, 0, highlightsValue.value * 0.3,
                  0, 1, 0, 0, highlightsValue.value * 0.3,
                  0, 0, 1, 0, highlightsValue.value * 0.3,
                  0, 0, 0, 1, 0,
                ]}
              />
              
              {/* Apply saturation */}
              <ColorMatrix matrix={saturationMatrix} />
              
              {/* Apply temperature/tint */}
              <ColorMatrix matrix={temperatureTintMatrix} />
              
              {/* Apply shadows */}
              <ColorMatrix
                matrix={[
                  1, 0, 0, 0, shadowsValue.value * 0.3,
                  0, 1, 0, 0, shadowsValue.value * 0.3,
                  0, 0, 1, 0, shadowsValue.value * 0.3,
                  0, 0, 0, 1, 0,
                ]}
              />
              
              {/* Apply fade */}
              <ColorMatrix
                matrix={[
                  1 - fadeValue.value * 0.3, fadeValue.value * 0.3, fadeValue.value * 0.3, 0, 0,
                  fadeValue.value * 0.3, 1 - fadeValue.value * 0.3, fadeValue.value * 0.3, 0, 0,
                  fadeValue.value * 0.3, fadeValue.value * 0.3, 1 - fadeValue.value * 0.3, 0, 0,
                  0, 0, 0, 1, 0,
                ]}
              />
              
              {/* Apply structure */}
              <ColorMatrix
                matrix={[
                  1 + structureValue.value * 0.2, 0, 0, 0, 0,
                  0, 1 + structureValue.value * 0.2, 0, 0, 0,
                  0, 0, 1 + structureValue.value * 0.2, 0, 0,
                  0, 0, 0, 1, 0,
                ]}
              />
              
              {/* Apply sharpen */}
              <ColorMatrix
                matrix={[
                  1 + sharpenValue.value * 2, -sharpenValue.value * 0.5, -sharpenValue.value * 0.5, 0, 0,
                  -sharpenValue.value * 0.5, 1 + sharpenValue.value * 2, -sharpenValue.value * 0.5, 0, 0,
                  -sharpenValue.value * 0.5, -sharpenValue.value * 0.5, 1 + sharpenValue.value * 2, 0, 0,
                  0, 0, 0, 1, 0,
                ]}
              />
              
              {/* Apply blur - only if non-zero to save performance */}
              {blurValue.value > 0 && (
                <BlurMask blur={blurValue.value} style="normal" />
              )}
              
              {/* Apply vignette */}
              <ColorMatrix
                matrix={[
                  1 - vignetteValue.value * 0.5, 0, 0, 0, 0,
                  0, 1 - vignetteValue.value * 0.5, 0, 0, 0,
                  0, 0, 1 - vignetteValue.value * 0.5, 0, 0,
                  0, 0, 0, 1, 0,
                ]}
              />
              
              {/* Apply grain */}
              <ColorMatrix
                matrix={[
                  1 - grainValue.value * 0.1, grainValue.value * 0.1, grainValue.value * 0.1, 0, 0,
                  grainValue.value * 0.1, 1 - grainValue.value * 0.1, grainValue.value * 0.1, 0, 0,
                  grainValue.value * 0.1, grainValue.value * 0.1, 1 - grainValue.value * 0.1, 0, 0,
                  0, 0, 0, 1, 0,
                ]}
              />
            </Image>
          </Group>
        )}
      </Canvas>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    // Add hardware acceleration hints
    backfaceVisibility: 'hidden',
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
}); 