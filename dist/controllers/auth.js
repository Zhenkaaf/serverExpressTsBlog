"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewPassword = exports.verifyCode = exports.resetPassword = exports.getProfile = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const isUserEmailExist = yield User_1.default.findOne({ email });
        if (isUserEmailExist) {
            res.status(409).json({
                errors: { email: `User with email: ${email} already exists` },
            });
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const newUser = new User_1.default({
            email,
            password: hashedPassword,
        });
        const token = jsonwebtoken_1.default.sign({
            id: newUser._id,
        }, process.env.JWT_SECRET, { expiresIn: "1d" });
        yield newUser.save();
        //toObject() потому что newUser — это объект Mongoose, а не обычный JavaScript-объект.
        //.toObject() преобразует Mongoose-документ в обычный JavaScript-объект.
        const _a = newUser.toObject(), { password: passFromDB } = _a, userInfo = __rest(_a, ["password"]);
        res.status(201).json({
            userInfo,
            token,
            message: "New user registered successfully",
        });
    }
    catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Registration failed" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({
                errors: { email: `User with email: ${email} doesn't exist` },
            });
            return;
        }
        const isPasswordCorrect = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({
                errors: { password: "Password isn't correct" },
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
        }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const _a = user.toObject(), { password: passFromDB } = _a, userInfo = __rest(_a, ["password"]);
        res.json({
            token,
            userInfo,
            message: "You successfully logged in",
        });
    }
    catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Login failed" });
    }
});
exports.login = login;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.userId);
        console.log("user*************", user);
        if (!user) {
            res.status(404).json({
                message: `Such user doesn't exist`,
            });
            return;
        }
        const _a = user.toObject(), { password: passFromDB } = _a, userInfo = __rest(_a, ["password"]);
        res.status(200).json({
            userInfo,
        });
    }
    catch (err) {
        console.error("getProfile error:", err);
        res.status(500).json({ message: "Failed to get user profile" });
    }
});
exports.getProfile = getProfile;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    if (!email) {
        return res
            .status(400)
            .json({ message: "To reset password email is required" });
    }
    try {
        const user = yield User_1.default.findOne({ email: email });
        console.log("user---", user);
        if (!user) {
            return res
                .status(404)
                .json({ message: "User with such email not found" });
        }
        // Генерация кода
        const resetCode = crypto_1.default.randomInt(100000, 999999).toString(); // 6-значный код
        const resetCodeExpires = new Date(Date.now() + 3 * 60 * 1000); // метку +3мин. от сейчас
        // Сохраняем токен и время в документе пользователя
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = resetCodeExpires;
        yield user.save();
        // Создание transporter
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.sendgrid.net",
            port: 587,
            auth: {
                user: "apikey", // стандарт для SendGrid SMTP
                pass: process.env.SENDGRID_API_KEY, // ключ SendGrid
            },
        });
        console.log("************************55", process.env.RESET_PASSWORD_URL);
        const resetUrl = `${process.env.RESET_PASSWORD_URL}?email=${encodeURIComponent(email)}`;
        // Отправка письма
        yield transporter.sendMail({
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
    }
    catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ message: "Server reset password error" });
    }
});
exports.resetPassword = resetPassword;
const verifyCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield User_1.default.findOne({ email: email });
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
        yield User_1.default.updateOne({ _id: user._id }, {
            $set: { isResetCodeVerified: true },
            $unset: { resetPasswordCode: "", resetPasswordExpires: "" },
        });
        if (!process.env.RESET_PASSWORD_SECRET) {
            throw new Error("RESET_PASSWORD_SECRET is not defined in .env");
        }
        const resetToken = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.RESET_PASSWORD_SECRET, { expiresIn: "30m" });
        return res.status(200).json({
            message: "Code verified successfully",
            resetToken,
        });
    }
    catch (err) {
        console.error("Verify code error:", err);
        res.status(500).json({ message: "Server verify code error" });
    }
});
exports.verifyCode = verifyCode;
const createNewPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const decoded = jsonwebtoken_1.default.verify(resetToken, process.env.RESET_PASSWORD_SECRET);
        const user = yield User_1.default.findById(decoded.userId);
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
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
        yield User_1.default.updateOne({ _id: decoded.userId }, {
            $set: {
                password: hashedPassword,
            },
            $unset: {
                isResetCodeVerified: "",
            },
        });
        /* user.password = hashedPassword;
        delete user.isResetCodeVerified;-- не работает
        await user.save(); */
        return res.status(200).json({
            message: "Password updated successfully",
        });
    }
    catch (err) {
        console.error("Create new password error:", err);
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                message: "Reset token has expired",
            });
        }
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                message: "Invalid reset token",
            });
        }
        return res.status(500).json({
            message: "Failed to create new password",
        });
    }
});
exports.createNewPassword = createNewPassword;
