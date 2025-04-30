import React from 'react';
import { Canvas, Image, Path } from '@shopify/react-native-skia';
import { width, height } from '../constants';
import { DrawingPath } from '../types';

interface DrawingCanvasProps {
    canvasRef: any;
    image: any;
    paths: DrawingPath[];
    currentPath: any;
    currentPaint: any;
    createPaint: (color: string, width: number, style: any) => any;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    canvasRef,
    image,
    paths,
    currentPath,
    currentPaint,
    createPaint,
}) => {
    
    return (
        <Canvas
            ref={canvasRef}
            style={{ width, height }}
        >
            <Image
                image={image}
                x={0}
                y={0}
                width={width}
                height={height}
                fit="cover"
            />

            {/* Render saved paths */}
            {paths?.map((item, index) => (
                <Path
                    key={index}
                    path={item.path}
                    paint={createPaint(item.color, item.strokeWidth, item.strokeStyle)}
                />
            ))}

            {/* Render current drawing path */}
            {currentPath && (
                <Path
                    path={currentPath}
                    paint={currentPaint}
                />
            )}
        </Canvas>
    );
};

export default DrawingCanvas; 