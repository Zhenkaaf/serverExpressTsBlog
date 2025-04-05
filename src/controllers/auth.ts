import User from "../models/User";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RequestCustom } from "../types/express";

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
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const newUser = new User({
            email,
            password: hash,
        });
        const token = jwt.sign(
            {
                id: newUser._id,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
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
            { expiresIn: "1h" }
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
