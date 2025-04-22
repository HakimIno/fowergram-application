import React, { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { 
  Canvas, 
  Path, 
  Group, 
  Circle,
  vec,
  LinearGradient,
  SweepGradient,
  BlurMask,
  Paint,
  Shadow,
  RadialGradient,
  mix,
  Turbulence,
  Color,
  Skia
} from '@shopify/react-native-skia';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSequence,
  Easing,
  cancelAnimation,
  withRepeat,
  withDelay,
  interpolate,
  useAnimatedReaction
} from 'react-native-reanimated';

// Optimized constants
const LOGO_SIZE = 45;
const NUMBER_OF_PETALS = 10; // Increased from 8 for more elegance
const SMALL_PETALS_MULTIPLIER = 2; // For denser small petals

interface FlowerLogoProps {
  onRefresh?: () => void;
  isRefreshing: boolean;
  color?: string;
  size?: number;
}

export const FlowerLogo: React.FC<FlowerLogoProps> = ({ 
  onRefresh, 
  isRefreshing,
  color = '#4f46e5',
  size = LOGO_SIZE
}) => {
  // Reanimated shared values with initial values
  const scaleValue = useSharedValue(1);
  const rotationValue = useSharedValue(0);
  const petalRotationValue = useSharedValue(0);
  const glowIntensity = useSharedValue(0.5);
  const hasStartedFirstAnimation = useSharedValue(false);
  const innerCircleScale = useSharedValue(0.8);
  
  // Colors - enhanced color palette
  const secondaryColor = useMemo(() => 
    color === '#4f46e5' ? '#1e1b4b' : '#8b5cf6', 
    [color]
  );
  
  const tertiaryColor = useMemo(() => 
    color === '#4f46e5' ? '#4338ca' : '#a78bfa', 
    [color]
  );
  
  // Highlight color
  const highlightColor = useMemo(() => 
    color === '#4f46e5' ? '#818cf8' : '#c4b5fd',
    [color]
  );
  
  // Pre-calculate petal paths for better performance
  const petalPath = useMemo(() => 
    createPetalPath(size / 2, size / 2, size),
    [size]
  );
  
  // Pre-calculate a smaller inner petal for the secondary layer
  const innerPetalPath = useMemo(() => 
    createInnerPetalPath(size / 2, size / 2, size * 0.65),
    [size]
  );
  
  // Add a thin ornamental petal for more detail
  const thinPetalPath = useMemo(() => 
    createThinPetalPath(size / 2, size / 2, size * 0.75),
    [size]
  );
  
  // Handle initial render to prevent initial animation glitch
  useEffect(() => {
    // Set flag to true only once when component mounts
    if (!hasStartedFirstAnimation.value) {
      hasStartedFirstAnimation.value = true;
      
      // Initial subtle animation for the glow and inner circle
      glowIntensity.value = withRepeat(
        withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        -1, // infinite
        true // yoyo
      );
      
      innerCircleScale.value = withRepeat(
        withTiming(0.9, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        -1, // infinite
        true // yoyo
      );
    }
  }, []);
  
  // Handle refresh state with immediate cancellation when not refreshing
  useEffect(() => {
    // Skip animation on initial render to prevent glitch
    if (!hasStartedFirstAnimation.value) return;
    
    if (isRefreshing) {
      // Enhanced rotation animation
      rotationValue.value = 0;
      rotationValue.value = withRepeat(
        withTiming(360, { 
          duration: 3000, 
          easing: Easing.linear 
        }),
        -1, // infinite
        false // don't yoyo
      );
      
      // Enhanced petal animation - more organic movement
      petalRotationValue.value = withRepeat(
        withSequence(
          withTiming(15, { 
            duration: 1000, 
            easing: Easing.inOut(Easing.cubic) 
          }),
          withTiming(-15, { 
            duration: 1000, 
            easing: Easing.inOut(Easing.cubic) 
          })
        ),
        -1, // infinite
        true // yoyo
      );
      
      // Increase glow during refreshing
      glowIntensity.value = withTiming(0.9, { 
        duration: 500, 
        easing: Easing.out(Easing.cubic) 
      });
      
      // Pulse the inner circle
      innerCircleScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.out(Easing.cubic) }),
          withTiming(0.9, { duration: 600, easing: Easing.in(Easing.cubic) })
        ),
        -1, // infinite
        true // yoyo
      );
    } else {
      // If was refreshing and now finished, do completion animation
      if (petalRotationValue.value !== 0 || rotationValue.value !== 0) {
        // Cancel current animations
        cancelAnimation(petalRotationValue);
        cancelAnimation(rotationValue);
        cancelAnimation(innerCircleScale);
        
        // Do one full 360° rotation as completion animation
        rotationValue.value = 0;
        rotationValue.value = withTiming(360, { 
          duration: 1000,  // 1 second rotation
          easing: Easing.out(Easing.cubic) 
        }, () => {
          rotationValue.value = 0; // Reset after completion
        });
        
        // Bounce the scale slightly as completion feedback
        scaleValue.value = withSequence(
          withTiming(1.15, { duration: 200, easing: Easing.out(Easing.cubic) }),
          withTiming(0.95, { duration: 150, easing: Easing.in(Easing.cubic) }),
          withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) })
        );
        
        // Reset petal rotation with a slight bounce
        petalRotationValue.value = withSequence(
          withTiming(8, { duration: 200, easing: Easing.out(Easing.cubic) }),
          withTiming(-5, { duration: 150, easing: Easing.in(Easing.cubic) }),
          withTiming(0, { duration: 150, easing: Easing.out(Easing.cubic) })
        );
        
        // Reduce glow back to normal with delay
        glowIntensity.value = withDelay(400, withTiming(0.5, { 
          duration: 600, 
          easing: Easing.inOut(Easing.cubic) 
        }));
        
        // Reset inner circle with subtle animation
        innerCircleScale.value = withSequence(
          withTiming(1.2, { duration: 200, easing: Easing.out(Easing.cubic) }),
          withTiming(0.8, { duration: 600, easing: Easing.inOut(Easing.cubic) })
        );
      }
    }
    
    // Cleanup animations when component unmounts
    return () => {
      cancelAnimation(petalRotationValue);
      cancelAnimation(rotationValue);
      cancelAnimation(scaleValue);
      cancelAnimation(glowIntensity);
      cancelAnimation(innerCircleScale);
    };
  }, [isRefreshing]);
  
  // Handle press
  const handlePress = useCallback(() => {
    if (isRefreshing) return;
    
    // Enhanced scale animation on press
    scaleValue.value = withSequence(
      withTiming(0.85, { duration: 80, easing: Easing.cubic }),
      withTiming(1.1, { duration: 100, easing: Easing.out(Easing.elastic(1.2)) }),
      withTiming(1, { duration: 120, easing: Easing.inOut(Easing.cubic) })
    );
    
    // Enhanced rotation animation on press
    rotationValue.value = withSequence(
      withTiming(25, { duration: 100, easing: Easing.inOut(Easing.cubic) }),
      withTiming(-5, { duration: 100, easing: Easing.inOut(Easing.cubic) }),
      withTiming(0, { duration: 150, easing: Easing.inOut(Easing.cubic) })
    );
    
    // Brief glow intensity increase on press
    glowIntensity.value = withSequence(
      withTiming(0.9, { duration: 150, easing: Easing.inOut(Easing.cubic) }),
      withTiming(0.5, { duration: 400, easing: Easing.inOut(Easing.cubic) })
    );
    
    // Call onRefresh callback
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh, isRefreshing]);
  
  // Handle press states
  const handlePressIn = useCallback(() => {
    if (isRefreshing) return;
    scaleValue.value = withTiming(0.95, { duration: 80 });
    glowIntensity.value = withTiming(0.7, { duration: 150 });
  }, [isRefreshing]);
  
  const handlePressOut = useCallback(() => {
    if (isRefreshing) return;
    scaleValue.value = withTiming(1, { duration: 80 });
    glowIntensity.value = withTiming(0.5, { duration: 200 });
  }, [isRefreshing]);
  
  // Create petal path - improved shape for more elegant appearance
  function createPetalPath(centerX: number, centerY: number, petalSize: number) {
    const petalLength = petalSize * 0.43;
    const petalWidth = petalSize * 0.13;
    
    // Control points - adjusted for more elegant curves
    const startX = centerX;
    const startY = centerY;
    const endX = centerX;
    const endY = centerY - petalLength;
    
    const ctrl1X = centerX + petalWidth;
    const ctrl1Y = centerY - petalLength * 0.3;
    const ctrl2X = centerX + petalWidth * 0.85;
    const ctrl2Y = centerY - petalLength * 0.75;
    
    const ctrl3X = centerX - petalWidth * 0.85;
    const ctrl3Y = centerY - petalLength * 0.75;
    const ctrl4X = centerX - petalWidth;
    const ctrl4Y = centerY - petalLength * 0.3;
    
    return `
      M ${startX} ${startY}
      C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}
      C ${ctrl3X} ${ctrl3Y}, ${ctrl4X} ${ctrl4Y}, ${startX} ${startY}
      Z
    `;
  }
  
  // Create inner petal path with slightly different shape for layering
  function createInnerPetalPath(centerX: number, centerY: number, petalSize: number) {
    const petalLength = petalSize * 0.38;
    const petalWidth = petalSize * 0.11;
    
    // Control points - adjusted for more elegant curves
    const startX = centerX;
    const startY = centerY;
    const endX = centerX;
    const endY = centerY - petalLength;
    
    const ctrl1X = centerX + petalWidth;
    const ctrl1Y = centerY - petalLength * 0.25;
    const ctrl2X = centerX + petalWidth * 0.85;
    const ctrl2Y = centerY - petalLength * 0.7;
    
    const ctrl3X = centerX - petalWidth * 0.85;
    const ctrl3Y = centerY - petalLength * 0.7;
    const ctrl4X = centerX - petalWidth;
    const ctrl4Y = centerY - petalLength * 0.25;
    
    return `
      M ${startX} ${startY}
      C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}
      C ${ctrl3X} ${ctrl3Y}, ${ctrl4X} ${ctrl4Y}, ${startX} ${startY}
      Z
    `;
  }
  
  // Create thin ornamental petal for additional detail
  function createThinPetalPath(centerX: number, centerY: number, petalSize: number) {
    const petalLength = petalSize * 0.4;
    const petalWidth = petalSize * 0.06;  // Much thinner
    
    const startX = centerX;
    const startY = centerY;
    const endX = centerX;
    const endY = centerY - petalLength;
    
    const ctrl1X = centerX + petalWidth;
    const ctrl1Y = centerY - petalLength * 0.35;
    const ctrl2X = centerX + petalWidth * 0.9;
    const ctrl2Y = centerY - petalLength * 0.8;
    
    const ctrl3X = centerX - petalWidth * 0.9;
    const ctrl3Y = centerY - petalLength * 0.8;
    const ctrl4X = centerX - petalWidth;
    const ctrl4Y = centerY - petalLength * 0.35;
    
    return `
      M ${startX} ${startY}
      C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}
      C ${ctrl3X} ${ctrl3Y}, ${ctrl4X} ${ctrl4Y}, ${startX} ${startY}
      Z
    `;
  }
  
  // Container animation style - optimized to prevent unnecessary re-renders
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleValue.value },
        { rotate: `${rotationValue.value}deg` }
      ]
    };
  }, []);
  
  // Pre-calculate angles for better performance
  const petalAngles = useMemo(() => 
    Array(NUMBER_OF_PETALS).fill(0).map((_, index) => 
      (index / NUMBER_OF_PETALS) * 360
    ), 
    []
  );
  
  // Create staggered angles for the inner petals for a more complex design
  const innerPetalAngles = useMemo(() => 
    Array(NUMBER_OF_PETALS).fill(0).map((_, index) => 
      ((index + 0.5) / NUMBER_OF_PETALS) * 360
    ), 
    []
  );
  
  // Create additional layer of small petals
  const smallPetalAngles = useMemo(() => 
    Array(NUMBER_OF_PETALS * SMALL_PETALS_MULTIPLIER).fill(0).map((_, index) => 
      (index / (NUMBER_OF_PETALS * SMALL_PETALS_MULTIPLIER)) * 360
    ), 
    []
  );
  
  // Thin decorative petals
  const thinPetalAngles = useMemo(() => 
    Array(NUMBER_OF_PETALS * 3).fill(0).map((_, index) => 
      (index / (NUMBER_OF_PETALS * 3)) * 360
    ), 
    []
  );
  
  // Animation-driven values using Animated.View
  const AnimatedCanvas = Animated.createAnimatedComponent(Canvas);
  
  return (
    <Pressable 
      style={styles.container} 
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[
        styles.logoContainer, 
        containerStyle, 
        { width: size, height: size }
      ]}>
        <Canvas style={{ width: size, height: size }}>
          {/* Thin decorative petals for a more intricate design */}
          {thinPetalAngles.map((baseAngle, index) => (
            <Group 
              key={`thin-petal-${index}`}
              origin={{ x: size / 2, y: size / 2 }}
              transform={[
                { rotate: ((baseAngle + index * 0.5) * Math.PI) / 180 },
                { scale: 0.9 }
              ]}
            >
              <Path
                path={thinPetalPath}
                opacity={0.3}
              >
                <LinearGradient
                  start={vec(size/2, size/2 - size*0.2)}
                  end={vec(size/2, size/2)}
                  colors={[highlightColor, "rgba(0,0,0,0)"]}
                />
                <BlurMask blur={1} style="solid" />
              </Path>
            </Group>
          ))}
          
          {/* Base layer of small petals */}
          {smallPetalAngles.map((baseAngle, index) => {
            // Using closure to avoid direct references to shared value properties
            // by accessing them at render time
            const angle = (() => {
              'worklet';
              // This is now safe because it's wrapped in a closure that executes
              // in the UI thread during animation
              return baseAngle; // Will be animated by parent rotation
            })();
            
            return (
              <Group 
                key={`small-petal-${index}`}
                origin={{ x: size / 2, y: size / 2 }}
                transform={[
                  { rotate: (angle * Math.PI) / 180 },
                  { scale: 0.35 }
                ]}
              >
                <Path
                  path={petalPath}
                  style="fill"
                  opacity={0.4}
                >
                  <LinearGradient
                    start={vec(size/2, size/2 - size*0.2)}
                    end={vec(size/2, size/2)}
                    colors={[secondaryColor, '#0c0919']}
                  />
                </Path>
              </Group>
            );
          })}
          
          {/* Main petals */}
          {petalAngles.map((baseAngle, index) => {
            // Alternate lighting direction for more realistic effect
            const isLitFromLeft = index % 2 === 0;
            
            return (
              <Group 
                key={`petal-${index}`}
                origin={{ x: size / 2, y: size / 2 }}
                transform={[
                  { rotate: (baseAngle * Math.PI) / 180 }
                ]}
              >
                <Path
                  path={petalPath}
                  opacity={0.95}
                >
                  <LinearGradient
                    start={vec(isLitFromLeft ? size/2 - size*0.1 : size/2 + size*0.1, size/2 - size*0.2)}
                    end={vec(size/2, size/2)}
                    colors={[tertiaryColor, color]}
                  />
                </Path>
                
                {/* Add subtle highlight along the edge */}
                <Path
                  path={petalPath}
                  style="stroke"
                  strokeWidth={0.8}
                  opacity={0.3}
                >
                  <LinearGradient
                    start={vec(size/2 - size*0.1, size/2 - size*0.3)}
                    end={vec(size/2 + size*0.1, size/2)}
                    colors={[highlightColor, "rgba(255,255,255,0)"]}
                  />
                  <BlurMask blur={2} style="solid" />
                </Path>
              </Group>
            );
          })}
          
          {/* Inner petals */}
          {innerPetalAngles.map((baseAngle, index) => {
            // Alternate lighting direction for inner petals too
            const isLitFromRight = index % 2 !== 0;
            
            return (
              <Group 
                key={`inner-${index}`}
                origin={{ x: size / 2, y: size / 2 }}
                transform={[
                  { rotate: (baseAngle * Math.PI) / 180 },
                  { scale: 0.75 }
                ]}
              >
                <Path
                  path={innerPetalPath}
                  opacity={0.85}
                >
                  <LinearGradient
                    start={vec(isLitFromRight ? size/2 + size*0.08 : size/2 - size*0.08, size/2 - size*0.15)}
                    end={vec(size/2, size/2)}
                    colors={[tertiaryColor, secondaryColor]}
                  />
                </Path>
              </Group>
            );
          })}
          
          {/* Glow effect */}
          <Circle 
            cx={size / 2}
            cy={size / 2}
            r={size * 0.25}
            opacity={0.6} // Fixed value to avoid warnings
          >
            <BlurMask blur={10} style="solid" />
            <RadialGradient
              c={vec(size/2, size/2)}
              r={size * 0.25}
              colors={[highlightColor, "rgba(255,255,255,0)"]}
            />
          </Circle>
          
          {/* Flower center with directional light */}
          <Circle 
            cx={size / 2}
            cy={size / 2}
            r={size * 0.16}
          >
            <RadialGradient
              c={vec(size * 0.46, size * 0.46)} // Light source from top-left
              r={size * 0.18}
              colors={[tertiaryColor, color, secondaryColor]}
            />
          </Circle>
          
          {/* Center highlight - moved to create natural lighting */}
          <Circle 
            cx={size * 0.45}
            cy={size * 0.45}
            r={size * 0.04}
            opacity={0.7}
          >
            <BlurMask blur={2} style="solid" />
            <RadialGradient
              c={vec(size * 0.45, size * 0.45)}
              r={size * 0.04}
              colors={["white", "rgba(255,255,255,0)"]}
            />
          </Circle>
          
          {/* Additional sparkle effect */}
          <Circle 
            cx={size * 0.43}
            cy={size * 0.43}
            r={size * 0.015}
            opacity={0.8}
          >
            <RadialGradient
              c={vec(size * 0.43, size * 0.43)}
              r={size * 0.015}
              colors={["white", "rgba(255,255,255,0)"]}
            />
          </Circle>
        </Canvas>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FlowerLogo; 