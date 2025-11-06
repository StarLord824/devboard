import {z} from 'zod';

export const loginSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/), //username check
    password: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/) //password check
})