import jwt from "jsonwebtoken";
import { jwt_secret } from "@devboard/common/config";

export const signToken = (hashPassword: string) => {
    return jwt.sign({hashPassword}, jwt_secret, {expiresIn: '1h'});
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, jwt_secret);
}