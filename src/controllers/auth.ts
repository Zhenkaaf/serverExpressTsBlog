import User from "../models/User";
import { RequestCustom } from "../types/express";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { JwtPayload } from "jsonwebtoken";

interface IResetTokenPayload extends JwtPayload {
    userId: string;
}

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const isUserEmailExist = await User.findOne({ email });
        if (isUserEmailExist) {
            res.status(409).json({
                errors: { email: `User with email: ${email} already exists` },
            });
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
        });
        const token = jwt.sign(
            {
                id: newUser._id,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "1d" }
        );
        await newUser.save();

        //toObject() потому что newUser — это объект Mongoose, а не обычный JavaScript-объект.
        //.toObject() преобразует Mongoose-документ в обычный JavaScript-объект.
        const { password: passFromDB, ...userInfo } = newUser.toObject();
        res.status(201).json({
            userInfo,
            token,
            message: "New user registered successfully",
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Registration failed" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({
                errors: { email: `User with email: ${email} doesn't exist` },
            });
            return;
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({
                errors: { password: "Password isn't correct" },
            });
            return;
        }
        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "1d" }
        );
        const { password: passFromDB, ...userInfo } = user.toObject();
        res.json({
            token,
            userInfo,
            message: "You successfully logged in",
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Login failed" });
    }
};

export const getProfile = async (req: RequestCustom, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        console.log("user*************", user);
        if (!user) {
            res.status(404).json({
                message: `Such user doesn't exist`,
            });
            return;
        }

        const { password: passFromDB, ...userInfo } = user.toObject();
        res.status(200).json({
            userInfo,
        });
    } catch (err) {
        console.error("getProfile error:", err);
        res.status(500).json({ message: "Failed to get user profile" });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const email = req.body.email;
    if (!email) {
        return res
            .status(400)
            .json({ message: "To reset password email is required" });
    }
    try {
        const user = await User.findOne({ email: email });
        console.log("user---", user);
        if (!user) {
            return res
                .status(404)
                .json({ message: "User with such email not found" });
        }

        // Генерация кода
        const resetCode = crypto.randomInt(100000, 999999).toString(); // 6-значный код
        const resetCodeExpires = new Date(Date.now() + 3 * 60 * 1000); // метку +3мин. от сейчас
        // Сохраняем токен и время в документе пользователя
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = resetCodeExpires;
        await user.save();
        // Создание transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.sendgrid.net",
            port: 587,
            auth: {
                user: "apikey", // стандарт для SendGrid SMTP
                pass: process.env.SENDGRID_API_KEY, // ключ SendGrid
            },
        });
        console.log(
            "************************55",
            process.env.RESET_PASSWORD_URL
        );
        const resetUrl = `${process.env.RESET_PASSWORD_URL}?email=${encodeURIComponent(email)}`;

        // Отправка письма
        await transporter.sendMail({
            from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
            to: email,
            subject: "Password Reset Code",
            html: `
            <div>
                <p>Your password reset code is: <b>${resetCode}</b> It is valid for 3 minutes.</p>
                <p><a href="${resetUrl}" target="_blank">AUTOVIBE</a></p>
                <hr />
                <p>If you didn't request a password reset, please ignore this email.</p>
                <p style="font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Autovibe. All rights reserved.</p>
            </div>
            `,
        });

        return res
            .status(200)
            .json({ message: `Password reset code has been sent to ${email}` });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ message: "Server reset password error" });
    }
};

export const verifyCode = async (req: Request, res: Response) => {
    const { code, email } = req.body;
    if (!email) {
        return res
            .status(400)
            .json({ message: "To verify code email is required" });
    }
    if (!code) {
        return res.status(400).json({ message: "Code is required" });
    }
    try {
        const user = await User.findOne({ email: email });
        console.log("user---", user);
        if (!user) {
            return res
                .status(404)
                .json({ message: "User with such email not found" });
        }
        if (!user.resetPasswordCode || !user.resetPasswordExpires) {
            return res.status(400).json({
                message: "No reset code found. Please request a new one.",
            });
        }
        if (user.resetPasswordExpires < new Date()) {
            return res.status(400).json({
                message: "Reset code has expired. Please request a new one.",
            });
        }
        if (user.resetPasswordCode !== code) {
            return res
                .status(400)
                .json({ message: "Invalid code. Please check and try again" });
        }
        await User.updateOne(
            { _id: user._id },
            {
                $set: { isResetCodeVerified: true },
                $unset: { resetPasswordCode: "", resetPasswordExpires: "" },
            }
        );

        if (!process.env.RESET_PASSWORD_SECRET) {
            throw new Error("RESET_PASSWORD_SECRET is not defined in .env");
        }
        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.RESET_PASSWORD_SECRET,
            { expiresIn: "30m" }
        );

        return res.status(200).json({
            message: "Code verified successfully",
            resetToken,
        });
    } catch (err) {
        console.error("Verify code error:", err);
        res.status(500).json({ message: "Server verify code error" });
    }
};

export const createNewPassword = async (req: Request, res: Response) => {
    const { newPassword, resetToken } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: "Password is required" });
    }
    if (!resetToken) {
        return res.status(400).json({ message: "Reset token is required" });
    }
    if (!process.env.RESET_PASSWORD_SECRET) {
        return res.status(500).json({
            message: "RESET_PASSWORD_SECRET is not configured",
        });
    }

    try {
        const decoded = jwt.verify(
            resetToken,
            process.env.RESET_PASSWORD_SECRET
        ) as IResetTokenPayload;

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        if (!user.isResetCodeVerified) {
            return res.status(403).json({
                message: "Reset code was not verified",
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await User.updateOne(
            { _id: decoded.userId },
            {
                $set: {
                    password: hashedPassword,
                },
                $unset: {
                    isResetCodeVerified: "",
                },
            }
        );
        /* user.password = hashedPassword;
        delete user.isResetCodeVerified;-- не работает
        await user.save(); */

        return res.status(200).json({
            message: "Password updated successfully",
        });
    } catch (err) {
        console.error("Create new password error:", err);

        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: "Reset token has expired",
            });
        }

        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: "Invalid reset token",
            });
        }

        return res.status(500).json({
            message: "Failed to create new password",
        });
    }
};
