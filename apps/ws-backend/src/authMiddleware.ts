import http from "http";
import jwt from "jsonwebtoken";
import { jwt_secret } from "@devboard/common/config";
import { WebSocket } from "ws";

export const authMiddleware = (ws : WebSocket, request : http.IncomingMessage) : (string | null) => {
    const url = request.url;
    if(!url){
        ws.close();
        return null;
    }
    const token = (new URLSearchParams(url.split("?")[1])).get("token");
    // console.log(token);
    if(!token){
        ws.close();
        return null;
    }
    const decoded = jwt.verify(token, jwt_secret);
    console.log(decoded);
    if(!decoded || typeof decoded !== "object"){
        ws.close();
        return null; 
    }
    if(!decoded.userId){
        ws.close();
        return null;
    }
    return decoded.userId;
};