export const jwt_secret = process.env.JWT_SECRET || 'secret';

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