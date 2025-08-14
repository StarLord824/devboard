import { z } from "zod";
import { loginSchema } from "@devboard/common/types";
import { signToken } from "../services/jwt";
import { getUser } from "../services/db";   
import { comparePassword } from "../services/hash";
import { Request, Response } from "express";

export default async (req: Request, res: Response) => {
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
    const token = signToken({userId: user.id});
    if(!token){
        console.log('JWT token error at signToken');
        res.status(500).send('Internal Server Error');
        return;
    }
    console.log(user);
    console.log(token);
    console.log(`This is devboard backend, route : ${req.url}`)
    const {password, ...safeUser} = user
    res.status(200).send({ token, user: safeUser });
}