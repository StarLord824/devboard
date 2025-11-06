import jwt from "jsonwebtoken";
import { jwt_secret } from "@devboard/common/config";

export const signToken = (payload: {userId: string}) => {
    return jwt.sign(payload, jwt_secret, {expiresIn: '1h'});
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, jwt_secret);
}