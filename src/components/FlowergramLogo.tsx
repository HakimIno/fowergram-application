import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
  Canvas,
  Path,
  useFont,
  Skia,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';
import { Theme } from 'src/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FlowergramLogoProps {
  width?: number;
  height?: number;
  fontSize?: number;
  theme: Theme;
}

export const FlowergramLogo: React.FC<FlowergramLogoProps> = ({
  width = SCREEN_WIDTH * 0.8,
  height = 200,
  fontSize = 64,
  theme
}) => {
  // Font for generating the text path
  const font = useFont(require('../assets/fonts/Pacifico-Regular.ttf'), fontSize);
  
  // Create text path
  const textPath = React.useMemo(() => {
    if (font === null) {
      return null;
    }
    
    const text = 'flowergram';
    const textWidth = font.getTextWidth(text);
    
    return Skia.Path.MakeFromText(
      text,
      (width - textWidth) / 2, // Center horizontally
      height / 2 + fontSize / 3, // Center vertically with baseline adjustment
      font
    );
  }, [font, width, height, fontSize]);
  
  // Define gradient colors
  const rainbowColors = [
    theme.textColor, // Violet
    theme.textColor, // Royal Blue  
    theme.textColor, // Cyan
    theme.textColor, // Lime Green
    theme.textColor, // Gold
    theme.textColor, // Coral
    theme.textColor, // Hot Pink
  ];
  
  // No text path if font is not loaded
  if (!textPath) {
    return <View style={{ width, height }} />;
  }
  
  return (
    <View style={[styles.container]}>
      <Canvas style={{ width, height }}>
        <Path
          path={textPath}
          style="fill"
          opacity={0.95}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, height)}
            colors={rainbowColors}
          />
        </Path>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FlowergramLogo; 