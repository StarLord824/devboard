import {z} from 'zod';

export const loginSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/), //username check
    password: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/) //password check
})
export const userSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/), //username check
    name: z.string().min(3).max(20), //name check
    email: z.email(), //email check
    password: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/) //password check
})
export const boardSchema= z.object({
    name: z.string().min(2).max(15),
    description: z.string().min(2).max(30),
    isPublic: z.boolean(),
})
// export type LoginSchemaType = z.infer<typeof loginSchema>;
// export type UserSchemaType = z.infer<typeof userSchema>;
// export type BoardSchemaType = z.infer<typeof boardSchema>;