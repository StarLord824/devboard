import { z } from "zod";
import { userSchema } from "@devboard/common/types";
import { signToken } from "../services/jwt";
import { createUser, getUser } from "../services/db";
import { hashPassword } from "../services/hash";
import { Request, Response } from "express";

export default async (req: Request, res: Response) => {
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
    const token = signToken({userId: newUser.id});
    if(!token){
        console.log('JWT token error at signToken');
        res.status(500).send('Internal Server Error');
        return;
    }
    console.log(newUser);
    console.log(token);
    console.log(`This is devboard backend, route : ${req.url}`)
    const {password, ...safeUser} = newUser
    res.status(200).send({ token, user: safeUser });
}