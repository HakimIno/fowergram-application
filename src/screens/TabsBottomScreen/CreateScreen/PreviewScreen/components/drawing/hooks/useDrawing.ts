import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { useCanvasRef, Skia, SkPath, BlendMode } from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';
import { Point, DrawingPath, StrokeStyleType, ToolMode } from '../types';
import { createPaint, createSmoothPath, createSimplePath, createEraserPaint } from '../DrawingUtils';

export const useDrawing = (initialColor: string = '#FF0000', initialWidth: number = 4) => {
    // Refs
    const canvasRef = useCanvasRef();
    const pointsRef = useRef<Point[]>([]);
    const pointsQueue = useRef<Point[]>([]);
    const pathRef = useRef<SkPath | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const velocityRef = useRef<number>(0);
    const prevPointRef = useRef<Point | null>(null);

    // State
    const [paths, setPaths] = useState<DrawingPath[]>([]);
    const [currentPath, setCurrentPath] = useState<SkPath | null>(null);
    const [redoPaths, setRedoPaths] = useState<DrawingPath[]>([]);
    const [currentColor, setCurrentColor] = useState(initialColor);
    const [strokeWidth, setStrokeWidth] = useState(initialWidth);
    const [strokeStyle, setStrokeStyle] = useState<StrokeStyleType>('solid');
    const [toolMode, setToolMode] = useState<ToolMode>('draw');

    const isDrawing = useSharedValue(false);
    const lastPoint = useSharedValue<Point | null>(null);

    // Clean up animation frame on unmount
    useEffect(() => {
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        };
    }, []);

    const currentPaint = useMemo(() => {
        const paint = createPaint(currentColor, strokeWidth, strokeStyle);
        if (toolMode === 'erase') {
            paint.setBlendMode(BlendMode.Clear);
        }
        
        return paint;
    }, [currentColor, strokeWidth, strokeStyle, toolMode]);

    const calculateSmoothingFactor = useCallback((velocity: number) => {
        const baseSmoothing = Math.max(0.1, Math.min(0.5, strokeWidth / 20));
        const velocityFactor = Math.max(0.1, Math.min(0.9, 500 / (velocity + 200)));
        
        return baseSmoothing * velocityFactor;
    }, [strokeWidth]);

    const shouldAddPoint = useCallback((newPoint: Point): boolean => {
        if (!prevPointRef.current) return true;
        
        const prev = prevPointRef.current;
        const dx = newPoint.x - prev.x;
        const dy = newPoint.y - prev.y;
        const distanceSquared = dx * dx + dy * dy;
        
        const minDistanceThreshold = Math.max(1, Math.min(5, strokeWidth / 4));
        
        return distanceSquared > minDistanceThreshold * minDistanceThreshold;
    }, [strokeWidth]);

    const processPoints = useCallback((timestamp: number) => {
        const currentIsDrawing = isDrawing.value;

        if (pointsQueue.current.length > 0 && currentIsDrawing) {
            if (lastTimeRef.current > 0) {
                const deltaTime = timestamp - lastTimeRef.current;
                const deltaPoints = pointsQueue.current.length;
                velocityRef.current = (deltaPoints / deltaTime) * 1000;
            }
            lastTimeRef.current = timestamp;

            const newPoints = [...pointsQueue.current];
            pointsQueue.current = [];

            for (const point of newPoints) {
                if (shouldAddPoint(point)) {
                    pointsRef.current.push(point);
                    prevPointRef.current = point;
                }
            }

            if (pathRef.current && pointsRef.current.length > 0) {
                const path = createSimplePath(pointsRef.current);
                setCurrentPath(path);
            }

            if (currentIsDrawing) {
                animationFrameId.current = requestAnimationFrame(processPoints);
            }
        } else {
            animationFrameId.current = null;
        }
    }, [isDrawing, shouldAddPoint]);

    const onTouchStart = useCallback((x: number, y: number) => {
        isDrawing.value = true;
        const startPoint = { x, y };
        lastPoint.value = startPoint;
        pointsRef.current = [startPoint];
        prevPointRef.current = startPoint;
        pointsQueue.current = [];
        lastTimeRef.current = 0;
        velocityRef.current = 0;

        setRedoPaths([]);

        const path = Skia.Path.Make();
        path.moveTo(x, y);
        pathRef.current = path;
        setCurrentPath(path);

        if (!animationFrameId.current) {
            animationFrameId.current = requestAnimationFrame(processPoints);
        }
    }, [processPoints]);

    const onTouchMove = useCallback((x: number, y: number) => {
        const currentIsDrawing = isDrawing.value;
        const currentLastPoint = lastPoint.value;

        if (!currentIsDrawing || !currentLastPoint) return;

        const newPoint = { x, y };
        const dx = newPoint.x - currentLastPoint.x;
        const dy = newPoint.y - currentLastPoint.y;
        const distSquared = dx * dx + dy * dy;
        
        if (distSquared > 1) {
            pointsQueue.current.push(newPoint);
            lastPoint.value = newPoint;
        }

        if (!animationFrameId.current) {
            animationFrameId.current = requestAnimationFrame(processPoints);
        }
    }, [processPoints, isDrawing, lastPoint]);

    const onTouchEnd = useCallback(() => {
        const currentIsDrawing = isDrawing.value;

        if (currentIsDrawing && pointsRef.current.length > 0) {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }

            const smoothingFactor = calculateSmoothingFactor(velocityRef.current);
            
            let finalPath;
            if (pointsRef.current.length < 3) {
                finalPath = createSimplePath(pointsRef.current);
            } else {
                finalPath = createSmoothPath(pointsRef.current, smoothingFactor);
            }

            setPaths(prevPaths => [
                ...(prevPaths || []),
                {
                    path: finalPath,
                    color: currentColor,
                    strokeWidth: strokeWidth,
                    strokeStyle: strokeStyle,
                    mode: toolMode
                }
            ]);

            setCurrentPath(null);
            pathRef.current = null;
            pointsRef.current = [];
            pointsQueue.current = [];
            prevPointRef.current = null;
        }

        isDrawing.value = false;
        lastPoint.value = null;
    }, [currentColor, strokeWidth, strokeStyle, toolMode, calculateSmoothingFactor]);

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
        toolMode,
        setToolMode,
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