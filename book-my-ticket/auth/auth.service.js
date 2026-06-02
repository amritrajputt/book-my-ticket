import pool from "../db/index.js";
import bcrypt from "bcrypt";
import ApiError from "../common/utils/ApiError.js";
import { generateAccessToken, generateRefreshToken, generateResetPasswordToken } from "../common/utils/jwt.token.js";
import sendMail from "../common/utils/email.js";

class AuthService {
    static async register({ firstName, lastName, email, password }) {
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            throw ApiError.badRequest("User with this email already exists. Please login instead.");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userResult = await pool.query("Insert into users(first_name, last_name, email, password, salt) values($1, $2, $3, $4, $5) RETURNING id, email", [firstName, lastName, email, hashedPassword, salt]);

        const accessToken = generateAccessToken({ id: userResult.rows[0].id, email: userResult.rows[0].email });
        const refreshToken = generateRefreshToken({ id: userResult.rows[0].id });

        const resetToken = generateResetPasswordToken();
        await pool.query("UPDATE users SET refresh_token = $1, reset_password_token = $2, reset_password_token_expires_at = NOW() + INTERVAL '1 hour' WHERE id = $3", [refreshToken, resetToken, userResult.rows[0].id]);

        const verificationLink = `http://localhost:8080/auth/verify?token=${resetToken}`;
        await sendMail({
            to: email,
            subject: "Verify Your Email - Book My Ticket",
            text: `Hi ${firstName},\n\nPlease verify your email by clicking the following link: ${verificationLink}\n\nThank you!`,
            html: `<p>Hi <b>${firstName}</b>,</p><p>Please verify your email by clicking the link below:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>Thank you!</p>`
        });

        return { id: userResult.rows[0].id, email: userResult.rows[0].email, firstName, lastName, accessToken, refreshToken, resetPasswordToken: resetToken };
    }

    static async login({ email, password }) {
        const userResult = await pool.query("SELECT id, email, first_name, last_name, password, salt, email_verified FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            throw ApiError.unAuthorized("Invalid email or password");
        }
        const user = userResult.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw ApiError.unAuthorized("Invalid email or password");
        }
        const accessToken = generateAccessToken({ id: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ id: user.id });
        await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, user.id]);

        if (!user.email_verified) {
            throw ApiError.unAuthorized("Please verify your email address.");
        }

        return { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, accessToken, refreshToken };
    }

    static async logout(refreshToken) {
        const userResult = await pool.query(
            "SELECT id FROM users WHERE refresh_token = $1",
            [refreshToken]
        );

        if (userResult.rows.length === 0) {
            throw ApiError.unAuthorized("Invalid or expired refresh token");
        }

        const user = userResult.rows[0];
        await pool.query(
            "UPDATE users SET refresh_token = NULL WHERE id = $1",
            [user.id]
        );

        return { message: "Logout successful" };
    }

    static async verifyEmail(token) {
        const userResult = await pool.query(
            "SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_token_expires_at > NOW()",
            [token]
        );

        if (userResult.rows.length === 0) {
            throw ApiError.badRequest("Invalid or expired verification token");
        }

        const user = userResult.rows[0];

        await pool.query(
            "UPDATE users SET email_verified = true, reset_password_token = NULL, reset_password_token_expires_at = NULL WHERE id = $1",
            [user.id]
        );

        return { message: "Email verified successfully" };
    }

    static async forgotPassword(email) {
        const userResult = await pool.query(
            "SELECT id, email, first_name, last_name, email_verified FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            throw ApiError.notFound("User with this email not found");
        }

        const user = userResult.rows[0];

        if (!user.email_verified) {
            throw ApiError.badRequest("Please verify your email address before resetting the password");
        }

        const resetToken = generateResetPasswordToken();
        const expirationTime = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(
            "UPDATE users SET reset_password_token = $1, reset_password_token_expires_at = $2 WHERE id = $3",
            [resetToken, expirationTime, user.id]
        );

        const resetLink = `http://localhost:8080/auth/reset-password?token=${resetToken}`;

        await sendMail({
            to: user.email,
            subject: "Reset Your Password",
            text: `Hi ${user.first_name},\n\nPlease click the link below to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.`,
            html: `<p>Hi <b>${user.first_name}</b>,</p><p>Please click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link will expire in 1 hour.</p>`
        });

        return { message: "Password reset link has been sent to your email address." };
    }

    static async generateNewAccessToken(refreshToken) {
        const userResult = await pool.query(
            "SELECT id FROM users WHERE refresh_token = $1",
            [refreshToken]
        );

        if (userResult.rows.length === 0) {
            throw ApiError.unAuthorized("Invalid or expired refresh token");
        }

        const user = userResult.rows[0];
        const accessToken = generateAccessToken({ id: user.id, email: user.email });
        return { accessToken };
    }
    static async resetPassword(token, password) {
        const userResult = await pool.query(
            "SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_token_expires_at > NOW()",
            [token]
        );

        if (userResult.rows.length === 0) {
            throw ApiError.badRequest("Invalid or expired reset token");
        }

        const user = userResult.rows[0];
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query(
            "UPDATE users SET password = $1, salt = $2, reset_password_token = NULL, reset_password_token_expires_at = NULL WHERE id = $3",
            [hashedPassword, salt, user.id]
        );

        return { message: "Password reset successful. You can now login with your new password." };
    }
}

export default AuthService;