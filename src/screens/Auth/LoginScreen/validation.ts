import { z } from 'zod';

// Define validation schema using Zod
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'กรุณากรอกชื่อผู้ใช้หรืออีเมล'),
  password: z
    .string()
    .min(1, 'กรุณากรอกรหัสผ่าน')
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
});

// Type from schema
export type LoginFormValues = z.infer<typeof loginSchema>;

// Helper function for validating a single field
export const validateSingleField = (field: keyof LoginFormValues, formValues: LoginFormValues) => {
  const fieldValidators = {
    identifier: () => loginSchema.pick({ identifier: true }),
    password: () => loginSchema.pick({ password: true })
  };

  return fieldValidators[field]().safeParse(formValues);
};

// Function for validating the entire form
export const validateForm = (formValues: LoginFormValues) => {
  return loginSchema.safeParse(formValues);
}; 