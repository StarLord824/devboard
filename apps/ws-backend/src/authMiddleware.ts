import http from "http";
import jwt from "jsonwebtoken";
import { jwt_secret } from "./config";
import { WebSocket } from "ws";

export const authMiddleware = (ws : WebSocket, request : http.IncomingMessage) => {
    const url = request.url;
    if(!url){
        ws.close();
        return;
    }
    const token = (new URLSearchParams(url.split("?")[1])).get("token");
    // console.log(token);
    if(!token){
        ws.close();
        return;
    }
    const decoded = jwt.verify(token, jwt_secret);
    console.log(decoded);
    if(!decoded){
        ws.close();
        return; 
    }
};