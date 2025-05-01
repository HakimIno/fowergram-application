import { Skia, StrokeCap, StrokeJoin, PaintStyle, BlendMode } from '@shopify/react-native-skia';
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
 * Creates an eraser paint object with specified width
 */
export const createEraserPaint = (width: number) => {
    const paint = Skia.Paint();
    paint.setStrokeWidth(width);
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeCap(StrokeCap.Round);
    paint.setStrokeJoin(StrokeJoin.Round);
    paint.setAntiAlias(true);
    paint.setBlendMode(BlendMode.Clear);

    return paint;
};

export const createHeartPath = (size: number = 10) => {
    const path = Skia.Path.Make();
    const halfSize = size / 1.5;

    path.moveTo(halfSize, size * 0.2);

    // ครึ่งซ้ายของหัวใจ
    path.cubicTo(
        halfSize - size * 0.45, size * 0.1,
        halfSize - size * 0.55, size * 0.5,
        halfSize, size * 0.95
    );

    // ครึ่งขวาของหัวใจ
    path.cubicTo(
        halfSize + size * 0.55, size * 0.5,
        halfSize + size * 0.45, size * 0.1,
        halfSize, size * 0.2
    );

    // ปิด path เพื่อให้หัวใจสมบูรณ์
    path.close();

    return path;
};

/**
 * สร้าง path รูปดอกไม้ที่สวยงามมากขึ้น (ดอกไม้ 8 กลีบ)
 */
export const createBetterFlowerPath = (size: number = 10) => {
    const path = Skia.Path.Make();
    const center = size * 0.5;
    
    // สร้างดอกไม้แบบในภาพ (กลีบมน)
    const petalCount = 8; // จำนวนกลีบ
    const outerRadius = size * 0.8; // รัศมีถึงปลายกลีบ
    const innerRadius = size * 0.2; // รัศมีโคนกลีบ
    const centerRadius = size * 0.3; // รัศมีของเกสรตรงกลาง
    
    // วาดกลีบดอกไม้แบบมนๆ
    for (let i = 0; i < petalCount; i++) {
        const startAngle = (2 * Math.PI * i) / petalCount;
        const endAngle = (2 * Math.PI * (i + 1)) / petalCount;
        const midAngle = (startAngle + endAngle) / 2;
        
        // จุดที่กลีบเริ่มจากศูนย์กลาง
        const startX = center + innerRadius * Math.cos(startAngle);
        const startY = center + innerRadius * Math.sin(startAngle);
        
        // จุดปลายกลีบ
        const peakX = center + outerRadius * Math.cos(midAngle);
        const peakY = center + outerRadius * Math.sin(midAngle);
        
        // จุดที่กลีบจบที่ศูนย์กลาง
        const endX = center + innerRadius * Math.cos(endAngle);
        const endY = center + innerRadius * Math.sin(endAngle);
        
        // วาดกลีบที่มีความโค้งมน
        if (i === 0) {
            path.moveTo(startX, startY);
        } else {
            path.lineTo(startX, startY);
        }
        
        // ใช้ quadTo เพื่อให้กลีบโค้งมนแบบธรรมชาติ และปลายกลีบไม่แหลม
        const controlX1 = center + outerRadius * 0.7 * Math.cos(midAngle - 0.5);
        const controlY1 = center + outerRadius * 0.7 * Math.sin(midAngle - 0.5);
        
        path.quadTo(
            controlX1, controlY1,
            peakX, peakY
        );
        
        const controlX2 = center + outerRadius * 0.7 * Math.cos(midAngle + 0.5);
        const controlY2 = center + outerRadius * 0.7 * Math.sin(midAngle + 0.5);
        
        path.quadTo(
            controlX2, controlY2,
            endX, endY
        );
    }
    
    path.close();
    
    // เพิ่มวงกลมตรงกลางดอก (เกสร) สีส้ม
    path.addCircle(center, center, centerRadius);
    
    return path;
};

export const createBetterStarPath = (size: number = 10) => {
    const path = Skia.Path.Make();
    const center = size / 2;


    const numPetals = 5;
    const outerRadius = size * 0.5;
    const innerRadius = size * 0.18;
    const centerRadius = size * 0.15

    path.moveTo(center + outerRadius, center);

    for (let i = 0; i < numPetals * 2; i++) {
        const angle = (Math.PI * i) / numPetals;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        path.lineTo(x, y);
    }

    path.close();

    path.addCircle(center, center, centerRadius);

    return path;
};

/**
 * Apply different stroke styles to a paint object
 */
export const applyStrokeStyleToPaint = (paint: any, style: StrokeStyleType) => {
    switch (style) {
        case 'dashed':
            paint.setPathEffect(Skia.PathEffect.MakeDash([15, 10], 2));
            break;
        case 'dotted':
            paint.setPathEffect(Skia.PathEffect.MakeDash([2, 8], 2));
            break;
        case 'heart':
            const strokeWidth = paint.getStrokeWidth();
            const heartSize = Math.max(8, strokeWidth * 1.5);
            const spacing = Math.max(16, heartSize * 2);
            
            const heartPath = createHeartPath(heartSize);
            paint.setPathEffect(Skia.PathEffect.MakePath1D(
                heartPath,
                spacing,
                0,
                0
            ));
            break;
        case 'flower':
            // ใช้ path ดอกไม้ที่สวยงามขึ้น
            const strokeW = paint.getStrokeWidth();
            const flowerSize = Math.max(12, strokeW * 2.5);
            const flowerSpacing = Math.max(24, flowerSize * 2);
            
            // ใช้ฟังก์ชัน createBetterFlowerPath ที่ออกแบบใหม่
            const flowerPath = createBetterFlowerPath(flowerSize);
            paint.setPathEffect(Skia.PathEffect.MakePath1D(
                flowerPath,
                flowerSpacing,
                0,
                0
            ));
            break;
        case 'star':
            // ใช้ path รูปดาว
            const strokeWidth2 = paint.getStrokeWidth();
            const starSize = Math.max(10, strokeWidth2 * 2);
            const starSpacing = Math.max(20, starSize * 2);
            
            const starPath = createBetterStarPath(starSize);
            paint.setPathEffect(Skia.PathEffect.MakePath1D(
                starPath,
                starSpacing,
                0,
                0
            ));
            break;
        case 'solid':
        default:
            break;
    }
};

/**
 * Get distance between two points
 */
const getDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Get midpoint between two points
 */
const getMidPoint = (p1: Point, p2: Point): Point => {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    };
};

/**
 * Creates a smooth path from points using Catmull-Rom splines
 * for natural and fluid drawing
 */
export const createSmoothPath = (points: Point[], smoothingFactor?: number) => {
    if (points.length < 2) {
        const path = Skia.Path.Make();
        if (points.length === 1) {
            path.moveTo(points[0].x, points[0].y);
            path.lineTo(points[0].x + 0.1, points[0].y + 0.1);
        }
        return path;
    }

    const path = Skia.Path.Make();

    if (points.length <= 10) {
        path.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            path.lineTo(points[i].x, points[i].y);
        }
        return path;
    }

    let simplifiedPoints: Point[] = [];

    if (points.length > 100) {
        const step = Math.floor(points.length / 100);
        simplifiedPoints.push(points[0]);

        for (let i = step; i < points.length - step; i += step) {
            simplifiedPoints.push(points[i]);
        }

        simplifiedPoints.push(points[points.length - 1]);
    } else {
        simplifiedPoints = points;
    }

    path.moveTo(simplifiedPoints[0].x, simplifiedPoints[0].y);

    const tension = smoothingFactor !== undefined ? smoothingFactor : 0.4;

    for (let i = 1; i < simplifiedPoints.length - 1; i++) {
        const p0 = i === 1 ? simplifiedPoints[0] : simplifiedPoints[i - 1];
        const p1 = simplifiedPoints[i];
        const p2 = simplifiedPoints[i + 1];

        const mid1 = getMidPoint(p0, p1);
        const mid2 = getMidPoint(p1, p2);

        const ctrl1 = {
            x: mid1.x + (p1.x - mid1.x) * tension,
            y: mid1.y + (p1.y - mid1.y) * tension
        };

        const ctrl2 = {
            x: mid2.x - (p2.x - mid2.x) * tension,
            y: mid2.y - (p2.y - mid2.y) * tension
        };

        path.cubicTo(
            ctrl1.x, ctrl1.y,
            ctrl2.x, ctrl2.y,
            mid2.x, mid2.y
        );
    }

    const lastPoint = simplifiedPoints[simplifiedPoints.length - 1];
    path.lineTo(lastPoint.x, lastPoint.y);

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