import {z} from "zod";

export const parsedDataSchema = z.object({
  type: z.string(),
  message: z.string(),
  boardId: z.string(),
  userId: z.string(),
  slug: z.string(),
});

export const userStateSchema = z.object({
  userId: z.string(),
  WebSocket : z.any(), // Accept any type (WebSocket instance)
  boards : z.array(z.string()),
})
const boardStateSchema = z.object({
  boardId: z.string(),
  users : z.array(z.string()),
})