import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(3).max(50),
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    avatar_color_id: z.number().int().min(1).max(8).optional(),
    about: z.string().max(200).optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
});
