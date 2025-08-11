import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwt_secret } from "./config";

export const authMiddleware = (req : Request, res : Response, next : NextFunction) => {
    // const token = req.headers['x-auth-token'];
    // if (!token) {
    //     return res.status(401).send('Unauthorized');
    // }
    const token = req.headers["authorization"];
    if(!token){
        return res.status(401).send('Unauthorized');
    }
    const decoded = jwt.verify(token, jwt_secret);
    console.log(decoded);
    if(!decoded){
        return res.status(403).send('Unauthorized');
    }
    next();
};