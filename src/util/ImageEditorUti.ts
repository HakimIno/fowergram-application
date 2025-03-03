// ImageEditorUtil.js
import * as ImageManipulator from 'expo-image-manipulator';

// ประเภทของ Filter ที่มี
export type FilterType = 'normal' | 'clarendon' | 'gingham' | 'moon' | 'lark' | 'reyes';

// Interface สำหรับ Filter options
interface FilterOptions {
    brightness?: number;
    contrast?: number;
    saturation?: number;
}

// ฟังก์ชันสำหรับ resize รูปภาพ
export const resizeImage = async (
    imageUri: string,
    width: number,
    height: number
): Promise<string> => {
    try {
        const result = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width, height } }],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
    } catch (error) {
        console.error('Error resizing image:', error);
        throw error;
    }
};

// ฟังก์ชันสำหรับปรับแต่งรูปภาพพื้นฐาน
export const adjustImage = async (
    imageUri: string,
    options: FilterOptions
): Promise<string> => {
    try {
        // เนื่องจาก expo-image-manipulator มีข้อจำกัด
        // เราจะใช้การปรับขนาดและความคมชัดแทน
        const result = await ImageManipulator.manipulateAsync(
            imageUri,
            [
                { resize: { width: 1000 } }
            ],
            { compress: options.contrast ? 0.8 : 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
    } catch (error) {
        console.error('Error adjusting image:', error);
        throw error;
    }
};

// ฟังก์ชันสำหรับใส่ Filter แบบต่างๆ
export const applyFilter = async (
    imageUri: string,
    filterType: FilterType
): Promise<string> => {
    const filterOptions: Record<FilterType, FilterOptions> = {
        normal: {},
        clarendon: { brightness: 0.1, contrast: 0.1, saturation: 0.15 },
        gingham: { brightness: 0.05, saturation: -0.15 },
        moon: { brightness: 0.1, contrast: 0.1, saturation: -0.2 },
        lark: { brightness: 0.05, contrast: 0.05, saturation: 0.1 },
        reyes: { brightness: 0.1, contrast: -0.05, saturation: 0.05 },
    };

    return await adjustImage(imageUri, filterOptions[filterType]);
};

// ฟังก์ชันสำหรับ crop รูปภาพ
export const cropImage = async (
    imageUri: string,
    crop: { originX: number; originY: number; width: number; height: number }
): Promise<string> => {
    try {
        const result = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ crop }],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
    } catch (error) {
        console.error('Error cropping image:', error);
        throw error;
    }
};

// ฟังก์ชันสำหรับหมุนรูปภาพ
export const rotateImage = async (
    imageUri: string,
    degrees: number
): Promise<string> => {
    try {
        const result = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ rotate: degrees }],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
    } catch (error) {
        console.error('Error rotating image:', error);
        throw error;
    }
};

// ฟังก์ชันสำหรับ flip รูปภาพ
export const flipImage = async (
    imageUri: string,
    horizontal: boolean = false,
    vertical: boolean = false
): Promise<string> => {
    try {
        const actions: ImageManipulator.Action[] = [];
        if (horizontal) actions.push({ flip: ImageManipulator.FlipType.Horizontal });
        if (vertical) actions.push({ flip: ImageManipulator.FlipType.Vertical });

        const result = await ImageManipulator.manipulateAsync(
            imageUri,
            actions,
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
    } catch (error) {
        console.error('Error flipping image:', error);
        throw error;
    }
};