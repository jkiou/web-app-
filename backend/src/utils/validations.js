import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be under 50 characters').trim(),
    email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required')
  })
};

export const createTaskSchema = {
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters').trim(),
    description: z.string().max(500, 'Description must be under 500 characters').optional().nullable(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM')
  })
};

export const updateTaskSchema = {
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters').trim().optional(),
    description: z.string().max(500, 'Description must be under 500 characters').optional().nullable(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional()
  })
};

export const updateUserRoleSchema = {
  body: z.object({
    role: z.enum(['USER', 'ADMIN'], { errorMap: () => ({ message: "Role must be 'USER' or 'ADMIN'" }) })
  })
};
