import { NextFunction, Request, Response } from "express";
import { verifyToken } from "./services/jwt";

export const authMiddleware = (req : Request, res : Response, next : NextFunction) => {
    
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = verifyToken(token);
        // req.user = decoded;
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};