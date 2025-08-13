import { Router } from "express";
import {prisma} from "@devboard/db/prismaClient"
import { z } from "zod";
import jwt from "jsonwebtoken";
import { jwt_secret } from "@devboard/common/config";
import { authMiddleware } from "./middlewares";
import { userSchema, loginSchema, boardSchema} from "@devboard/common/types";
import { signToken } from "./services/jwt";
import { createUser, getUser } from "./services/db";
import { comparePassword, hashPassword } from "./services/hash";

const router : Router = Router();


router.get('/', (req, res) => {
    res.status(200).send(`This is devboard backend, route : ${req.url}`);
});

router.post('/signup', async (req, res) => {
    const body : z.infer<typeof userSchema> = req.body;
    console.log(body);
    //return error if validation fails
    const parsedBody = userSchema.safeParse(body);
    if(!parsedBody.success){
        res.status(400).send('Invalid request body');
        return;
    }
    const existingUser = await getUser(body.username);
    if(existingUser){
        res.status(400).send('User already exists');
        return;
    }
    //hash password
    const hash = await hashPassword(body.password);
    if(!hash){
        console.log('Hashing password error at hashPassword');
        res.status(500).send('Internal Server Error');
        return;
    }
    //create user in db
    const newUser = await createUser({
        username: body.username,
        name: body.name,
        email: body.email,
        password: hash,
    });
    if(!newUser){
        console.log('DB call error at createUser');
        res.status(500).send('Internal Server Error');
        return;
    }
    //jwt token for password auth and middlewares  
    const token = signToken(newUser.id);
    if(!token){
        console.log('JWT token error at signToken');
        res.status(500).send('Internal Server Error');
        return;
    }
    console.log(newUser);
    console.log(token);
    console.log(`This is devboard backend, route : ${req.url}`)
    const {password, ...safeUser} = newUser
    res.status(200).send({ user: safeUser, token });
});
 
router.post('/login', async (req, res) => {

    //return error if validation fails
    const body : z.infer<typeof loginSchema> = req.body;
    const parsedBody = loginSchema.safeParse(body);
    if(!parsedBody.success){
        res.status(400).send('Invalid request body');
        return;
    }
    //check if user exists
    const user = await getUser(body.username);
    if(!user){
        res.status(404).send('User not found');
        return;
    }
    const verify = await comparePassword(body.password, user.password);
    if(!verify){
        res.status(401).send('Invalid username or password');
        return;
    }
    //jwt token for password auth and middlewares
    const token = signToken(user.id);
    if(!token){
        console.log('JWT token error at signToken');
        res.status(500).send('Internal Server Error');
        return;
    }
    console.log(user);
    console.log(token);
    console.log(`This is devboard backend, route : ${req.url}`)
    const {password, ...safeUser} = user
    res.status(200).send({ user: safeUser, token });
});

router.post('/create-board', authMiddleware, async (req, res) => {
    const { slug, admin, participants } = req.body;
    const parsedBody = boardSchema.safeParse(req.body);
    if(!parsedBody.success){
        res.status(400).send('Invalid request body');
        return;
    }
    const newBoard = await prisma.board.create({
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