export const jwt_secret = process.env.JWT_SECRET || 'secret';

export const ws_backend_url = process.env.WS_Backend_URL || 'ws://localhost:8080';
export const http_backend_url = process.env.HTTP_Backend_URL || 'http://localhost:8000';
// import { z } from "zod";

// const configSchema = z.object({
//     JWT_SECRET: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
// });

// export const env = configSchema.parse(process.env);
// let env : z.infer<typeof configSchema>;
// try {
//     env = configSchema.parse(process.env);
// } catch (error) {
//     console.log(`$error : ${error} Please put the value in .env file`);
//     // process.exit(1);
// }