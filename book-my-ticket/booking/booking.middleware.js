import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import ApiError from "../common/utils/ApiError.js";

const bookingMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return ApiError.handle(ApiError.unAuthorized("Authorization header with Bearer token is required"), res);
    }
    
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return ApiError.handle(ApiError.unAuthorized("Invalid or expired token"), res);
    }
}

export default bookingMiddleware;