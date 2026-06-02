import express from "express";
import AuthController from "./auth.contoller.js";
import AuthMiddleWare from "../common/middleware/auth.middleware.js";
import RegisterDto from "../common/dto/RegisterDto.js";
import LoginDto from "../common/dto/LoginDto.js";

const router = express.Router();

router.post("/register", AuthMiddleWare(RegisterDto), AuthController.register);
router.post("/login", AuthMiddleWare(LoginDto), AuthController.login);
router.get("/verify", AuthController.verifyEmail);
router.post("/generate-new-access-token", AuthController.generateNewAccessToken);
router.post("/logout", AuthController.logout);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

export default router;