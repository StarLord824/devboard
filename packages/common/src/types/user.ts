import {z} from 'zod';

export const userSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/), //username check
    name: z.string().min(3).max(20), //name check
    email: z.email(), //email check
    password: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/) //password check
})

export type UserSchemaType = z.infer<typeof userSchema>;