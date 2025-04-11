import React, { useState, useRef, useCallback, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, GestureResponderEvent } from 'react-native';
import { Canvas, Image, Path as SkiaPath, useCanvasRef, Skia, Group } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';

interface AdvancedImageEditorProps {
  image: any;
  width: number;
  height: number;
  onDrawingComplete?: (path: string) => void;
  currentTool?: string;
  color?: string;
  brushSize?: number;
}

interface PathData {
  path: string; // SVG path string
  color: string;
  strokeWidth: number;
  blendMode?: string;
}

// Define the ref type
export type AdvancedImageEditorRefType = {
  undoLastPath: () => boolean;
  clearAllPaths: () => boolean;
  getPaths: () => PathData[];
  getCanvasSnapshot: () => string | null;
};

// Export with forwardRef
export const AdvancedImageEditor = forwardRef<AdvancedImageEditorRefType, AdvancedImageEditorProps>(
  ({
    image,
    width,
    height,
    onDrawingComplete,
    currentTool = 'brush',
    color = '#FF3B30',
    brushSize = 5,
  }, ref) => {
    // State for drawing
    const [currentToolType, setCurrentToolType] = useState<'brush' | 'marker' | 'eraser' | 'neon'>('brush');
    const [paths, setPaths] = useState<PathData[]>([]);
    const [currentPath, setCurrentPath] = useState<PathData | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    // For drawing
    const pathRef = useRef(Skia.Path.Make());
    const canvasRef = useCanvasRef();
    const lastPoint = useRef({ x: 0, y: 0 });
    const pointsQueue = useRef<Array<{ x: number, y: number }>>([]);
    const animationFrameId = useRef<number | null>(null);

    // Handle external tool changes
    useEffect(() => {
      if (currentTool) {
        switch (currentTool) {
          case 'brush':
            setCurrentToolType('brush');
            break;
          case 'marker':
            setCurrentToolType('marker');
            break;
          case 'eraser':
            setCurrentToolType('eraser');
            break;
          case 'neon':
            setCurrentToolType('neon');
            break;
          default:
            // Keep current tool if not recognized
            break;
        }
      }
    }, [currentTool]);

    // Process touch points in animation frame for smooth drawing
    const processPoints = useCallback(() => {
      if (pointsQueue.current.length > 0 && isDrawing) {
        // Process all points in queue
        while (pointsQueue.current.length > 0) {
          const point = pointsQueue.current.shift();
          if (point) {
            // For smoother drawing, use quadratic curves instead of just lines
            if (lastPoint.current.x !== 0 && lastPoint.current.y !== 0) {
              // Calculate control point for quadratic curve
              const midX = (lastPoint.current.x + point.x) / 2;
              const midY = (lastPoint.current.y + point.y) / 2;
              
              pathRef.current.quadTo(
                lastPoint.current.x, 
                lastPoint.current.y, 
                midX, 
                midY
              );
            } else {
              // For the first point, just move to it
              pathRef.current.moveTo(point.x, point.y);
            }
            
            // Update last point
            lastPoint.current = { x: point.x, y: point.y };
          }
        }
        
        // Update current path data with the new path
        setCurrentPath({
          path: pathRef.current.toSVGString(),
          color: currentToolType === 'eraser' ? 'rgba(0,0,0,0)' : color,
          strokeWidth: currentToolType === 'marker' ? brushSize * 1.5 : brushSize,
          blendMode: currentToolType === 'neon' ? 'plus' : (currentToolType === 'eraser' ? 'clear' : undefined)
        });
        
        // Request next frame
        animationFrameId.current = requestAnimationFrame(processPoints);
      } else {
        animationFrameId.current = null;
      }
    }, [isDrawing, color, currentToolType, brushSize]);

    // Start drawing with optimized performance
    const startDrawing = useCallback((x: number, y: number) => {
      // Provide haptic feedback when starting to draw
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Reset the path and last point
      pathRef.current = Skia.Path.Make();
      lastPoint.current = { x, y };
      
      // Start drawing at this point
      pathRef.current.moveTo(x, y);
      
      // Initialize current path
      setCurrentPath({
        path: pathRef.current.toSVGString(),
        color: currentToolType === 'eraser' ? 'rgba(0,0,0,0)' : color,
        strokeWidth: currentToolType === 'marker' ? brushSize * 1.5 : brushSize,
        blendMode: currentToolType === 'neon' ? 'plus' : (currentToolType === 'eraser' ? 'clear' : undefined)
      });
      
      // Start drawing mode
      setIsDrawing(true);
      
      // Start animation frame for smooth drawing
      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(processPoints);
      }
    }, [color, currentToolType, brushSize, processPoints]);

    // Continue drawing with optimized performance
    const draw = useCallback((x: number, y: number) => {
      if (isDrawing) {
        // Add point to queue for processing
        pointsQueue.current.push({ x, y });
        
        // Ensure animation frame is running
        if (!animationFrameId.current) {
          animationFrameId.current = requestAnimationFrame(processPoints);
        }
      }
    }, [isDrawing, processPoints]);

    // End drawing with optimized performance
    const endDrawing = useCallback(() => {
      if (isDrawing && currentPath) {
        // Cancel any running animation frame
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
        
        // Process any remaining points
        while (pointsQueue.current.length > 0) {
          const point = pointsQueue.current.shift();
          if (point) {
            pathRef.current.lineTo(point.x, point.y);
          }
        }
        
        // Add the finished path to the paths array
        setPaths((prevPaths) => [...prevPaths, { ...currentPath }]);
        
        // Clear current path and reset drawing state
        setCurrentPath(null);
        setIsDrawing(false);
        lastPoint.current = { x: 0, y: 0 };
        
        // Notify parent component if needed
        if (onDrawingComplete) {
          onDrawingComplete(pathRef.current.toSVGString());
        }
        
        // Provide haptic feedback when finishing a drawing
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, [isDrawing, currentPath, onDrawingComplete]);

    // Extract touch coordinates from event
    const getTouchCoordinates = useCallback((event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      return { x: locationX, y: locationY };
    }, []);

    // Public method to undo last path (can be called from parent)
    const undoLastPath = useCallback(() => {
      setPaths((prevPaths) => {
        const newPaths = [...prevPaths];
        newPaths.pop();
        return newPaths;
      });
      return true;
    }, []);

    // Public method to clear all paths (can be called from parent)
    const clearAllPaths = useCallback(() => {
      setPaths([]);
      return true;
    }, []);
    
    // Public method to get all paths
    const getPaths = useCallback(() => {
      return paths;
    }, [paths]);

    // Get canvas snapshot
    const getCanvasSnapshot = useCallback(() => {
      if (canvasRef.current) {
        try {
          // Make a snapshot of the canvas with all layers
          const snapshot = canvasRef.current.makeImageSnapshot();
          if (snapshot) {
            // Convert to base64 data URL
            return snapshot.encodeToBase64();
          }
        } catch (error) {
          console.error('Error capturing canvas snapshot:', error);
        }
      }
      return null;
    }, [canvasRef]);

    // Define style for the Skia paths based on tool
    const getPathStyle = useCallback((path: PathData) => {
      if (!path.blendMode) return {};
      
      switch (path.blendMode) {
        case 'plus':
          return { blendMode: 'plus' as const };
        case 'clear':
          return { blendMode: 'clear' as const };
        default:
          return {};
      }
    }, []);

    // Expose methods to parent through ref
    useImperativeHandle(ref, () => ({
      undoLastPath,
      clearAllPaths,
      getPaths,
      getCanvasSnapshot
    }));

    return (
      <View style={styles.container}>
        {/* Main drawing canvas */}
        <Canvas
          style={[styles.canvas, { width, height }]}
          onTouchStart={(e) => {
            const { x, y } = getTouchCoordinates(e);
            startDrawing(x, y);
          }}
          onTouchMove={(e) => {
            const { x, y } = getTouchCoordinates(e);
            draw(x, y);
          }}
          onTouchEnd={endDrawing}
          ref={canvasRef}
        >
          {/* Only render the image once in the canvas */}
          {image && (
            <Image
              image={image}
              fit="contain"
              x={0}
              y={0}
              width={width}
              height={height}
            />
          )}
          
          <Group>
            {/* Render all saved paths */}
            {paths.map((pathData, index) => (
              <SkiaPath
                key={index}
                path={pathData.path}
                color={pathData.color}
                style="stroke"
                strokeWidth={pathData.strokeWidth}
                strokeJoin="round"
                strokeCap="round"
                antiAlias
                {...getPathStyle(pathData)}
              />
            ))}
            
            {/* Render current path being drawn */}
            {currentPath && (
              <SkiaPath
                path={currentPath.path}
                color={currentPath.color}
                style="stroke"
                strokeWidth={currentPath.strokeWidth}
                strokeJoin="round"
                strokeCap="round"
                antiAlias
                {...getPathStyle(currentPath)}
              />
            )}
          </Group>
        </Canvas>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  canvas: {
    flex: 1,
    backgroundColor: 'transparent',
  }
}); 