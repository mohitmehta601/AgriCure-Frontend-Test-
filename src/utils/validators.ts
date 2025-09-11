import { z } from 'zod';

// Strong password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Email validation (RFC compliant)
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

// Mobile number validation (E.164 format)
export const mobileSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Please enter a valid mobile number with country code (e.g., +919876543210)')
  .min(10, 'Mobile number is too short')
  .max(16, 'Mobile number is too long');

// Product ID validation
export const productIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{3,32}$/, 'Product ID must be 3-32 characters and contain only letters, numbers, underscores, and hyphens')
  .min(3, 'Product ID must be at least 3 characters')
  .max(32, 'Product ID must be at most 32 characters');

// Full name validation
export const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .max(60, 'Full name must be at most 60 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces');

// OTP validation
export const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

// Signup form validation
export const signupSchema = z.object({
  productId: productIdSchema,
  fullName: fullNameSchema,
  mobile: mobileSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login form validation
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or mobile number is required'),
  password: z.string().min(1, 'Password is required')
});

// OTP verification validation
export const otpVerifySchema = z.object({
  otp: otpSchema,
  type: z.enum(['email', 'sms']),
  email: emailSchema.optional(),
  phone: mobileSchema.optional()
}).refine((data) => {
  if (data.type === 'email' && !data.email) {
    return false;
  }
  if (data.type === 'sms' && !data.phone) {
    return false;
  }
  return true;
}, {
  message: "Email is required for email verification, phone is required for SMS verification"
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type OtpVerifyFormData = z.infer<typeof otpVerifySchema>;