import { Router } from "express";
import {prisma} from "@devboard/db/prismaClient"
import { z } from "zod";
import jwt from "jsonwebtoken";
import { jwt_secret } from "@devboard/common/config";
import { authMiddleware } from "./middlewares";
import { userSchema, loginSchema, boardSchema} from "@devboard/common/types";

const router : Router = Router();

type UserSchemaType = z.infer<typeof userSchema>;

router.get('/', (req, res) => {
    res.status(200).send(`This is devboard backend, route : ${req.url}`);
});

router.post('/signup', (req, res) => {
    // res.send("This is devboard backend, route : /api/v1/users/signup");
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
 
router.post('/login', (req, res) => {

    const body : z.infer<typeof loginSchema> = req.body;

    //return error if validation fails
    if(!loginSchema.safeParse(body)){
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
                password: body.password,
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
    });
});

router.post('/create-board', authMiddleware,  (req, res) => {
    const { slug, admin, participants } = req.body;
    if(!boardSchema.safeParse({slug, admin, participants})){
        res.status(400).send('Invalid request body');
        return;
    }
    prisma.board.create({
        data: {
            slug,
            admin,  
            participants,
            // Chats: [],
        }
    })
    res.status(200).send(`This is devboard backend, route : ${req.url}`);
});

export default router;