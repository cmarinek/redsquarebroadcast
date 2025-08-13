import { useState, useCallback } from 'react';
import { z } from 'zod';
import { formatZodErrors, ValidationError } from '@/utils/validation';

export function useFormValidation<T extends Record<string, any>>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((field: string, value: any, data: T) => {
    try {
      schema.parse(data);
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => err.path.includes(field));
        if (fieldError) {
          setErrors(prev => ({ ...prev, [field]: fieldError.message }));
          return false;
        }
      }
      return true;
    }
  }, [schema]);

  const validateForm = useCallback((data: T) => {
    try {
      schema.parse(data);
      setErrors({});
      return { success: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatZodErrors(error);
        const errorMap = formattedErrors.reduce((acc, err) => ({
          ...acc,
          [err.field]: err.message
        }), {});
        setErrors(errorMap);
        return { success: false, errors: errorMap };
      }
      return { success: false, errors: { _form: 'Validation failed' } };
    }
  }, [schema]);

  const markFieldAsTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const getFieldError = useCallback((field: string) => {
    return touched[field] ? errors[field] : undefined;
  }, [errors, touched]);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    markFieldAsTouched,
    resetValidation,
    getFieldError,
    hasErrors: Object.keys(errors).some(key => errors[key]),
    isFieldTouched: (field: string) => touched[field]
  };
}