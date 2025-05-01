import React, { useMemo } from 'react';
import { Canvas, Image, Path, Group } from '@shopify/react-native-skia';
import { width, height } from '../constants';
import { DrawingPath, ToolMode } from '../types';
import { createPaint, createEraserPaint } from '../DrawingUtils';

interface DrawingCanvasProps {
    canvasRef: any;
    image: any;
    paths: DrawingPath[];
    currentPath: any;
    currentPaint: any;
    toolMode?: ToolMode;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    canvasRef,
    image,
    paths,
    currentPath,
    currentPaint,
    toolMode = 'draw',
}) => {
    // Memoize paths to prevent unnecessary re-renders
    const memoizedPaths = useMemo(() => {
        return paths.map((item, index) => {
            const paint = item.mode === 'erase' 
                ? createEraserPaint(item.strokeWidth)
                : createPaint(item.color, item.strokeWidth, item.strokeStyle);
            
            return (
                <Path
                    key={`path-${index}`}
                    path={item.path}
                    paint={paint}
                />
            );
        });
    }, [paths]);

    // Optimize image dimensions to fit screen
    const imageHeight = useMemo(() => height * 0.65, []);
    const canvasHeight = useMemo(() => height * 0.65, []);

    return (
        <Canvas
            ref={canvasRef}
            style={{ width, height: canvasHeight }}
        >
            <Image
                image={image}
                x={0}
                y={0}
                width={width}
                height={imageHeight}
                fit="fitHeight"
            />

            <Group
                layer={true}
                blendMode={toolMode === 'erase' ? "clear" : "srcOver"}
            >
                {memoizedPaths}

                {/* เส้นที่กำลังวาดในปัจจุบัน */}
                {currentPath && (
                    <Path
                        path={currentPath}
                        paint={currentPaint}
                    />
                )}
            </Group>
        </Canvas>
    );
};

export default React.memo(DrawingCanvas);