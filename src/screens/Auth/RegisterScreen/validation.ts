import { z } from 'zod';

// สร้าง validation schema ด้วย Zod
export const registerSchema = z.object({
    username: z
        .string()
        .min(1, 'กรุณากรอกชื่อผู้ใช้')
        .min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
        .regex(/^[a-zA-Z0-9_]+$/, 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข หรือ _ เท่านั้น'),
    email: z
        .string()
        .min(1, 'กรุณากรอกอีเมล')
        .email('รูปแบบอีเมลไม่ถูกต้อง'),
    password: z
        .string()
        .min(1, 'กรุณากรอกรหัสผ่าน')
        .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
});

// ประเภทข้อมูลจาก schema
export type RegisterFormValues = z.infer<typeof registerSchema>;

// ฟังก์ชันช่วยสำหรับการ validate field เดียว
export const validateSingleField = (field: keyof RegisterFormValues, formValues: RegisterFormValues) => {
    const fieldValidators = {
        username: () => registerSchema.pick({ username: true }),
        email: () => registerSchema.pick({ email: true }),
        password: () => registerSchema.pick({ password: true })
    };

    return fieldValidators[field]().safeParse(formValues);
};

// ฟังก์ชันสำหรับการ validate ทั้งฟอร์ม
export const validateForm = (formValues: RegisterFormValues) => {
    return registerSchema.safeParse(formValues);
}; 