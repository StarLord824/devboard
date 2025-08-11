import { Router } from "express";
// import {prisma} from "@devboard/db"
import { z } from "zod";
import jwt from "jsonwebtoken";
import { jwt_secret } from "./config";
import { authMiddleware } from "./middlewares";

const router : Router = Router();

const userSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/), //username check
    name: z.string().min(3).max(20), //name check
    email: z.string().min(3).max(20).email(), //email check
    password: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/) //password check
})

router.get('/', (req, res) => {
    res.status(200).send(`This is devboard backend, route : ${req.url}`);
});

router.post('signup', (req, res) => {
    const body : z.infer<typeof userSchema> = req.body;
    console.log(body);
    //return error if validation fails
    if(!userSchema.safeParse(body)){
        res.status(400).send('Invalid request body');
        return;
    }
    //jwt token for password auth and middlewares
    jwt.sign(body.password, jwt_secret, (err: Error | null, token: string | undefined) => {
            if(err){
            res.status(500).send('Internal Server Error');
            return;
        }
        res.status(200).send(`This is devboard backend, route : ${req.url}`);
    });
});
 
router.post('login', (req, res) => {

    const body : z.infer<typeof userSchema> = req.body;

    //return error if validation fails
    if(!userSchema.safeParse(body)){
        res.status(400).send('Invalid request body');
        return;
    }
    jwt.verify(body.password, jwt_secret, {}, (err: Error | null, decoded: string | jwt.JwtPayload | undefined) => {
        if(err || !decoded){
            res.status(401).send('Unauthorized');
            return;
        }
        res.status(200).send(`This is devboard backend, route : ${req.url}`);
    });
});


// //auth middleware
// router.use( (req, res, next) => {
//     const token = req.headers['x-auth-token'];
//     if (!token) {
//         return res.status(401).send('Unauthorized');
//     }
//     next();
// });

router.get('create-board', authMiddleware,  (req, res) => {
    const { username, password } = req.body;
    res.status(200).send(`This is devboard backend, route : ${req.url}`);
});

export default router;