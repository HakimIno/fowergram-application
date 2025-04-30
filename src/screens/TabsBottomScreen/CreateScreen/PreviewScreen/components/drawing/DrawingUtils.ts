import { Skia, StrokeCap, StrokeJoin, PaintStyle } from '@shopify/react-native-skia';
import { Point, StrokeStyleType } from './types';

/**
 * Creates a paint object with specified properties
 */
export const createPaint = (color: string, width: number, style: StrokeStyleType) => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(color));
    paint.setStrokeWidth(width);
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeCap(StrokeCap.Round);
    paint.setStrokeJoin(StrokeJoin.Round);
    paint.setAntiAlias(true);

    // Apply stroke style
    applyStrokeStyleToPaint(paint, style);

    return paint;
};

/**
 * Apply different stroke styles to a paint object
 */
export const applyStrokeStyleToPaint = (paint: any, style: StrokeStyleType) => {
    switch (style) {
        case 'dashed':
            paint.setPathEffect(Skia.PathEffect.MakeDash([15, 10], 0));
            break;
        case 'dotted':
            paint.setPathEffect(Skia.PathEffect.MakeDash([2, 8], 0));
            break;
        case 'solid':
        default:
            break;
    }
};

/**
 * Creates a smooth path from points using Quadratic Bezier curves
 */
export const createSmoothPath = (points: Point[]) => {
    if (points.length < 2) {
        const path = Skia.Path.Make();
        if (points.length === 1) {
            path.moveTo(points[0].x, points[0].y);
            path.lineTo(points[0].x + 0.1, points[0].y + 0.1);
        }
        return path;
    }

    const path = Skia.Path.Make();
    path.moveTo(points[0].x, points[0].y);

    // Use quadratic bezier curves for more natural lines
    for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];

        if (i < points.length - 1) {
            const p2 = points[i + 1];

            // Calculate control point based on the next point for smoother curves
            const controlPoint = {
                x: p1.x + (p2.x - p0.x) * 0.2,
                y: p1.y + (p2.y - p0.y) * 0.2
            };

            path.quadTo(p1.x, p1.y, controlPoint.x, controlPoint.y);
        } else {
            // For the last point, just draw a line to it
            path.lineTo(p1.x, p1.y);
        }
    }

    return path;
};

/**
 * Creates a simple path with straight lines between points
 */
export const createSimplePath = (points: Point[]) => {
    if (points.length < 1) return Skia.Path.Make();
    
    const path = Skia.Path.Make();
    path.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        path.lineTo(points[i].x, points[i].y);
    }

    return path;
}; 