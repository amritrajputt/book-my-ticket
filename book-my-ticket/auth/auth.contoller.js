import AuthService from "./auth.service.js";
import ApiError from "../common/utils/ApiError.js";
import ApiResponse from "../common/utils/ApiResponse.js";

class AuthController {
    static async register(req, res) {
        try {
            const { firstName, lastName, email, password } = req.body;
            const result = await AuthService.register({ firstName, lastName, email, password });

            const apiResponse = ApiResponse.created(result, "User registered successfully. Please verify your email.");
            return res.status(apiResponse.statusCode).json(apiResponse);
        } catch (error) {
            return ApiError.handle(error, res);
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login({ email, password });

            const apiResponse = ApiResponse.success(result, "Login successful");
            return res.status(apiResponse.statusCode).json(apiResponse);
        } catch (error) {
            return ApiError.handle(error, res);
        }
    }

    static async verifyEmail(req, res) {
        try {
            const { token } = req.query;
            if (!token) {
                throw ApiError.badRequest("Verification token is required");
            }

            await AuthService.verifyEmail(token);

            return res.status(200).send(`
                <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                    <h1 style="color: #4CAF50;">✔ Email Verified Successfully!</h1>
                    <p>Your email has been verified. You can now log in to your account.</p>
                </div>
            `);
        } catch (error) {
            return ApiError.handle(error, res);
        }
    }

    static async logout(req, res) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw ApiError.unAuthorized("Authorization token is required");
            }

            const refreshToken = authHeader.split(" ")[1];
            const result = await AuthService.logout(refreshToken);

            const apiResponse = ApiResponse.success(null, result.message);
            return res.status(apiResponse.statusCode).json(apiResponse);
        } catch (error) {
            return ApiError.handle(error, res);
        }
    }

    static async generateNewAccessToken(req, res) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw ApiError.unAuthorized("Authorization token is required");
            }

            const refreshToken = authHeader.split(" ")[1];
            const result = await AuthService.generateNewAccessToken(refreshToken);

            const apiResponse = ApiResponse.success(result, "New access token generated successfully");
            return res.status(apiResponse.statusCode).json(apiResponse);
        } catch (error) {
            return ApiError.handle(error, res);
        }
    }

    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                throw ApiError.badRequest("Email is required");
            }

            const result = await AuthService.forgotPassword(email);

            const apiResponse = ApiResponse.success(null, result.message);
            return res.status(apiResponse.statusCode).json(apiResponse);
        } catch (error) {
            return ApiError.handle(error, res);
        }
    }

    static async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                throw ApiError.badRequest("Token and password are required");
            }

            const result = await AuthService.resetPassword(token, password);

            const apiResponse = ApiResponse.success(null, result.message);
            return res.status(apiResponse.statusCode).json(apiResponse);
        } catch (error) {
            return ApiError.handle(error, res);
        }
    }
}

export default AuthController;
