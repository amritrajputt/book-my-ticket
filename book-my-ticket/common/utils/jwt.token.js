import crypto from "crypto";
import jwt from "jsonwebtoken";
import ApiError from "./ApiError.js";

const generateAccessToken = (payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
    return accessToken;
}
const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return decoded;
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token");
    }
}

const generateRefreshToken = (payload) => {
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" })
    return refreshToken;
}
const verifyRefreshToken = (token) => {

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        return decoded;
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
}

const generateResetPasswordToken = () => {
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    return resetPasswordToken;
}
export{
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    generateResetPasswordToken
}