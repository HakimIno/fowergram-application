import { useCallback, useRef, useState, useMemo } from 'react';
import { useCanvasRef, Skia, SkPath } from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';
import { Point, DrawingPath, StrokeStyleType } from '../types';
import { createPaint, createSmoothPath, createSimplePath } from '../DrawingUtils';

export const useDrawing = (initialColor: string = '#FF0000', initialWidth: number = 4) => {
    // Refs
    const canvasRef = useCanvasRef();
    const pointsRef = useRef<Point[]>([]);
    const pointsQueue = useRef<Point[]>([]);
    const pathRef = useRef<SkPath | null>(null);
    const animationFrameId = useRef<number | null>(null);

    // State
    const [paths, setPaths] = useState<DrawingPath[]>([]);
    const [currentPath, setCurrentPath] = useState<SkPath | null>(null);
    const [redoPaths, setRedoPaths] = useState<DrawingPath[]>([]);
    const [currentColor, setCurrentColor] = useState(initialColor);
    const [strokeWidth, setStrokeWidth] = useState(initialWidth);
    const [strokeStyle, setStrokeStyle] = useState<StrokeStyleType>('solid');

    // For tracking in gesture worklets
    const isDrawing = useSharedValue(false);
    const lastPoint = useSharedValue<Point | null>(null);

    // Create paint for current drawing
    const currentPaint = useMemo(() => {
        return createPaint(currentColor, strokeWidth, strokeStyle);
    }, [currentColor, strokeWidth, strokeStyle]);

    // Process points in animation frame for smoother drawing
    const processPoints = useCallback(() => {
        // Use a local variable for isDrawing.value to avoid direct reading during rendering
        const currentIsDrawing = isDrawing.value;

        if (pointsQueue.current.length > 0 && currentIsDrawing) {
            // Process all points in queue at once
            const newPoints = [...pointsQueue.current];
            pointsQueue.current = [];

            // Add to our total points array
            pointsRef.current = [...pointsRef.current, ...newPoints];

            // Create a path with all points for real-time drawing preview
            if (pathRef.current && pointsRef.current.length > 0) {
                // Use simple lines for performance during drawing
                const path = createSimplePath(pointsRef.current);
                setCurrentPath(path);
            }

            // Request next frame if still drawing
            if (currentIsDrawing) {
                animationFrameId.current = requestAnimationFrame(processPoints);
            }
        } else {
            animationFrameId.current = null;
        }
    }, [isDrawing]);

    const onTouchStart = useCallback((x: number, y: number) => {
        isDrawing.value = true;
        lastPoint.value = { x, y };
        pointsRef.current = [{ x, y }];
        pointsQueue.current = [];

        // Clear redo stack when starting a new drawing
        setRedoPaths([]);

        // Initialize the path
        const path = Skia.Path.Make();
        path.moveTo(x, y);
        pathRef.current = path;
        setCurrentPath(path);

        // Start animation frame for processing points
        if (!animationFrameId.current) {
            animationFrameId.current = requestAnimationFrame(processPoints);
        }
    }, [processPoints]);

    const onTouchMove = useCallback((x: number, y: number) => {
        // Get the current value from shared values to avoid reading during render
        const currentIsDrawing = isDrawing.value;
        const currentLastPoint = lastPoint.value;

        if (!currentIsDrawing || !currentLastPoint) return;

        // Add point to queue for processing in animation frame
        pointsQueue.current.push({ x, y });
        lastPoint.value = { x, y };

        // Ensure animation frame is running
        if (!animationFrameId.current) {
            animationFrameId.current = requestAnimationFrame(processPoints);
        }
    }, [processPoints, isDrawing, lastPoint]);

    const onTouchEnd = useCallback(() => {
        // Get the current value from shared values to avoid reading during render
        const currentIsDrawing = isDrawing.value;

        if (currentIsDrawing && pointsRef.current.length > 0) {
            // Cancel animation frame
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }

            // Create the final smooth path only when touch ends
            const finalPath = createSmoothPath(pointsRef.current);

            // Add to paths
            setPaths(prevPaths => [
                ...(prevPaths || []),
                {
                    path: finalPath,
                    color: currentColor,
                    strokeWidth: strokeWidth,
                    strokeStyle: strokeStyle
                }
            ]);

            setCurrentPath(null);
            pathRef.current = null;
            pointsRef.current = [];
            pointsQueue.current = [];
        }

        isDrawing.value = false;
        lastPoint.value = null;
    }, [currentColor, strokeWidth, strokeStyle]);

    // Action handlers
    const undoLastPath = useCallback(() => {
        if (paths.length > 0) {
            const pathsCopy = [...paths];
            const lastPath = pathsCopy.pop();
            if (lastPath) {
                setRedoPaths(prevRedoPaths => [...prevRedoPaths, lastPath]);
                setPaths(pathsCopy);
            }
        }
    }, [paths]);

    const redoLastPath = useCallback(() => {
        if (redoPaths.length > 0) {
            const redoPathsCopy = [...redoPaths];
            const pathToRedo = redoPathsCopy.pop();
            if (pathToRedo) {
                setPaths(prevPaths => [...prevPaths, pathToRedo]);
                setRedoPaths(redoPathsCopy);
            }
        }
    }, [redoPaths]);

    const clearCanvas = useCallback(() => {
        setPaths([]);
        setCurrentPath(null);
        setRedoPaths([]);
    }, []);

    return {
        canvasRef,
        paths,
        currentPath,
        currentPaint,
        createPaint,
        isDrawing,
        currentColor,
        setCurrentColor,
        strokeWidth,
        setStrokeWidth,
        strokeStyle,
        setStrokeStyle,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        undoLastPath,
        redoLastPath,
        clearCanvas,
        canUndoPath: paths.length > 0,
        canRedoPath: redoPaths.length > 0,
    };
}; 