import { Router } from "express";
import {prisma} from "@devboard/db/prismaClient"
import { z } from "zod";
import jwt from "jsonwebtoken";
import { jwt_secret } from "@devboard/common/config";
import { authMiddleware } from "./middlewares";
import { userSchema, loginSchema, boardSchema} from "@devboard/common/types";

const router : Router = Router();

type UserSchemaType = z.infer<typeof userSchema>;
type LoginSchemaType = z.infer<typeof loginSchema>;
type BoardSchemaType = z.infer<typeof boardSchema>;

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
        prisma.user.create({
            data: {
                username: body.username,
                name: body.name,
                email: body.email,
                password: body.password,
            }
        }).then((user: UserSchemaType) => {
            res.status(200).send(`This is devboard backend, route : ${req.url}, user : ${user}`);
        }).catch((err) => {
            res.status(500).send('Internal Server Error, error: ' + err);
        });
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
        prisma.user.findUnique({
            where: {
                username: body.username,
            }
        }).then((user: UserSchemaType | null) => {
            if(!user){
                res.status(404).send('User not found');
                return;
            }
            res.status(200).send(`This is devboard backend, route : ${req.url}, user : ${user}`);
        }).catch((err) => {
            res.status(500).send('Internal Server Error, error: ' + err);
        });
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