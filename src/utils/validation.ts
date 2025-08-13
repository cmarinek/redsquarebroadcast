import { z } from 'zod';

// Screen Registration Validation
export const screenRegistrationSchema = z.object({
  screen_name: z.string().min(1, "Screen name is required").max(100, "Screen name too long"),
  address: z.string().min(1, "Address is required").max(200, "Address too long"),
  city: z.string().min(1, "City is required").max(100, "City too long"),
  location_lat: z.string().optional().refine(val => !val || !isNaN(Number(val)), "Invalid latitude"),
  location_lng: z.string().optional().refine(val => !val || !isNaN(Number(val)), "Invalid longitude"),
  price_per_hour: z.string().min(1, "Price is required").refine(val => {
    const num = Number(val);
    return !isNaN(num) && num > 0 && num <= 10000;
  }, "Price must be between $1 and $10,000"),
  availability_start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  availability_end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
}).refine(data => {
  if (data.availability_start && data.availability_end) {
    const start = parseInt(data.availability_start.split(':')[0]);
    const end = parseInt(data.availability_end.split(':')[0]);
    return start < end;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["availability_end"]
});

// Content Upload Validation
export const contentUploadSchema = z.object({
  file: z.object({
    name: z.string().min(1, "File name required"),
    size: z.number().max(50 * 1024 * 1024, "File too large (max 50MB)"),
    type: z.enum(['image/jpeg', 'image/png', 'image/gif', 'video/mp4'], {
      errorMap: () => ({ message: "Unsupported file type" })
    })
  })
});

// Booking Validation
export const bookingSchema = z.object({
  selectedDate: z.date({
    required_error: "Date is required",
    invalid_type_error: "Invalid date"
  }).refine(date => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: "Cannot book in the past"
  }),
  selectedStartTime: z.string().min(1, "Start time is required").regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  duration: z.number().min(1, "Duration must be at least 1 hour").max(24, "Duration cannot exceed 24 hours")
});

// User Profile Validation
export const profileSchema = z.object({
  display_name: z.string().min(1, "Display name is required").max(50, "Display name too long"),
  avatar_url: z.string().url("Invalid URL").optional().or(z.literal(""))
});

// Generic Form Error Handling
export interface ValidationError {
  field: string;
  message: string;
}

export function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
}

export function validateField<T>(schema: z.ZodSchema<T>, data: any, field: string): string | null {
  try {
    schema.parse(data);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(err => err.path.includes(field));
      return fieldError?.message || null;
    }
    return "Validation error";
  }
}

// Content Moderation Checks
export const moderationChecks = {
  filename: (filename: string): string[] => {
    const issues: string[] = [];
    const inappropriate = /\b(spam|hack|virus|malware|porn|xxx|sex|drug|illegal)\b/i;
    
    if (inappropriate.test(filename)) {
      issues.push('Filename contains inappropriate content');
    }
    
    if (filename.length > 255) {
      issues.push('Filename too long');
    }
    
    return issues;
  },
  
  fileSize: (size: number, type: string): string[] => {
    const issues: string[] = [];
    const maxSizes = {
      'image/jpeg': 10 * 1024 * 1024, // 10MB
      'image/png': 10 * 1024 * 1024,  // 10MB
      'image/gif': 5 * 1024 * 1024,   // 5MB
      'video/mp4': 50 * 1024 * 1024   // 50MB
    };
    
    const maxSize = maxSizes[type as keyof typeof maxSizes];
    if (maxSize && size > maxSize) {
      issues.push(`File too large for ${type} (max ${Math.round(maxSize / 1024 / 1024)}MB)`);
    }
    
    return issues;
  }
};