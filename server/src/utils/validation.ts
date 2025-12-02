import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "date" | "email";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: string[];
  custom?: (value: any) => boolean;
  message?: string;
}

export const validateRequest = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const data = req.body;

    rules.forEach((rule) => {
      const value = data[rule.field];

      // Check if required
      if (rule.required && (!value || (typeof value === "string" && value.trim() === ""))) {
        errors.push(rule.message || `${rule.field} is required`);
        return;
      }

      // Skip validation if field is not present and not required
      if (!rule.required && (value === undefined || value === null)) {
        return;
      }

      // Type validation
      if (rule.type && value !== undefined && value !== null) {
        switch (rule.type) {
          case "string":
            if (typeof value !== "string") {
              errors.push(rule.message || `${rule.field} must be a string`);
              return;
            }
            break;
          case "number":
            if (typeof value !== "number" || isNaN(value)) {
              errors.push(rule.message || `${rule.field} must be a number`);
              return;
            }
            break;
          case "date":
            if (!(value instanceof Date) && isNaN(Date.parse(value))) {
              errors.push(rule.message || `${rule.field} must be a valid date`);
              return;
            }
            break;
          case "email":
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (typeof value !== "string" || !emailRegex.test(value)) {
              errors.push(rule.message || `${rule.field} must be a valid email`);
              return;
            }
            break;
        }
      }

      // String length validation
      if (typeof value === "string") {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(rule.message || `${rule.field} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(rule.message || `${rule.field} must be at most ${rule.maxLength} characters`);
        }
      }

      // Number range validation
      if (typeof value === "number") {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(rule.message || `${rule.field} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(rule.message || `${rule.field} must be at most ${rule.max}`);
        }
      }

      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(rule.message || `${rule.field} must be one of: ${rule.enum.join(", ")}`);
      }

      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        errors.push(rule.message || `${rule.field} is invalid`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }

    next();
  };
};

// Common validation rules
export const authValidationRules: ValidationRule[] = [
  { field: "email", required: true, type: "email" },
  { field: "password", required: true, type: "string", minLength: 6 },
];

export const registerValidationRules: ValidationRule[] = [
  { field: "email", required: true, type: "email" },
  { field: "password", required: true, type: "string", minLength: 6 },
  { field: "name", required: true, type: "string", minLength: 2, maxLength: 50 },
];

export const paymentValidationRules: ValidationRule[] = [
  { field: "type", required: true, enum: ["to_pay", "to_receive"] },
  { field: "personName", required: true, type: "string", minLength: 2, maxLength: 100 },
  { field: "amount", required: true, type: "number", min: 0 },
  { field: "dueDate", required: true, type: "date" },
  { field: "description", type: "string", maxLength: 500 },
];

export const updatePaymentValidationRules: ValidationRule[] = [
  { field: "type", enum: ["to_pay", "to_receive"] },
  { field: "personName", type: "string", minLength: 2, maxLength: 100 },
  { field: "amount", type: "number", min: 0 },
  { field: "dueDate", type: "date" },
  { field: "description", type: "string", maxLength: 500 },
];

export const profileValidationRules: ValidationRule[] = [
  { field: "name", type: "string", minLength: 2, maxLength: 50 },
  { field: "email", type: "email" },
];

export const passwordValidationRules: ValidationRule[] = [
  { field: "currentPassword", required: true, type: "string", minLength: 6 },
  { field: "newPassword", required: true, type: "string", minLength: 6 },
];
