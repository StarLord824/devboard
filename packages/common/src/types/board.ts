import {z} from 'zod';

export const boardSchema= z.object({
    slug: z.string().min(2).max(15),
    admin: z.string(),
    participants: z.array(z.string()),
    chats: z.array(z.string())
})

export type BoardSchemaType = z.infer<typeof boardSchema>;