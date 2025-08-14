import http from "http";
import jwt from "jsonwebtoken";
import { jwt_secret } from "@devboard/common/config";
import { WebSocket } from "ws";

interface JwtPayload {
    userId: string;
    iat: number;
    exp: number;
}
export const authMiddleware = (ws : WebSocket, request : http.IncomingMessage) : string | null => {
    const url = request.url;
    if(!url){
        return null;
    }
    const token = (new URLSearchParams(url.split("?")[1])).get("token");
    if(!token){
        return null;
    }
    try {
        const decoded = jwt.verify(token, jwt_secret) as JwtPayload;
        if(!decoded.userId){
            return null;
        }
        console.log(`Authenticated user: ${decoded.userId}`);
        return decoded.userId;
    } catch (error) {
        console.log(error);
        return null;
    }
};