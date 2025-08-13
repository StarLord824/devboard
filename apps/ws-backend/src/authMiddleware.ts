import http from "http";
import jwt from "jsonwebtoken";
import { jwt_secret } from "@devboard/common/config";
import { WebSocket } from "ws";

export const authMiddleware = (ws : WebSocket, request : http.IncomingMessage) : (string | null) => {
    const url = request.url;
    if(!url){
        return null;
    }
    const token = (new URLSearchParams(url.split("?")[1])).get("token");
    // console.log(token);
    if(!token){
        return null;
    }
    try {
        const decoded = jwt.verify(token, jwt_secret);
        console.log(decoded);
        if(!decoded || typeof decoded !== "object"){
            return null; 
        }
        if(!decoded.userId){
            return null;
        }
        return decoded.userId;
    } catch (error) {
        console.log(error);
        return null;
    }
};