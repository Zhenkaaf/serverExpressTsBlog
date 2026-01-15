import User from "../models/User";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import sgMail from "../services/sendgrid";

interface IResetTokenPayload extends JwtPayload {
    userId: string;
}

export const resetPassword = async (req: Request, res: Response) => {
    const email = req.body.email;
    if (!email) {
        return res
            .status(400)
            .json({ message: "To reset password email is required" });
    }
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res
                .status(404)
                .json({ message: "User with such email not found" });
        }

        // Генерация кода
        const resetCode = crypto.randomInt(100000, 999999).toString(); // 6-значный код
        const resetCodeExpires = new Date(Date.now() + 3 * 60 * 1000); // метку +3мин. от сейчас
        // Сохраняем токен и время в документе пользовател
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = resetCodeExpires;
        await user.save();
        const resetUrl = `${process.env.RESET_PASSWORD_URL}?email=${encodeURIComponent(email)}`;

        try {
            await sgMail.send({
                to: email,
                from: {
                    email: process.env.FROM_EMAIL!,
                    name: process.env.FROM_NAME!,
                },
                subject: "Password Reset Code",
                html: `
            <div>
                <p>Your password reset code is: <b>${resetCode}</b></p>
                <p>It is valid for 3 minutes.</p>
                <p>
                    <a href="${resetUrl}" target="_blank">AUTOVIBE</a>
                </p>
                <hr />
                <p style="font-size: 12px; color: #999;">
                    &copy; ${new Date().getFullYear()} Autovibe
                </p>
            </div>
        `,
            });
        } catch (error) {
            console.error("SENDGRID ERROR:", error);
            return res.status(500).json({
                message: "Failed to send reset email",
            });
        }

        return res.status(200).json({
            message: `Password reset code has been sent to ${email}, to ${resetUrl}`,
        });
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
                .json({ message: "User with such email wasn't found" });
        }
        if (!user.resetPasswordCode || !user.resetPasswordExpires) {
            return res.status(400).json({
                message:
                    "You haven't requested a password reset yet. Please request a code to continue.",
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
            message: "Your password has been updated successfully",
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
