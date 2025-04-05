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
exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const isUserNameExist = yield User_1.default.findOne({ username });
        if (isUserNameExist) {
            res.status(409).json({
                message: "This username already exists",
            });
            return;
        }
        const salt = bcryptjs_1.default.genSaltSync(10);
        const hash = bcryptjs_1.default.hashSync(password, salt);
        const newUser = new User_1.default({
            username,
            password: hash,
        });
        yield newUser.save();
        //toObject() используется, потому что newUser — это объект Mongoose, а не обычный JavaScript-объект.
        const _a = newUser.toObject(), { password: passFromDB } = _a, restDataAboutUser = __rest(_a, ["password"]);
        res.status(201).json({
            restDataAboutUser,
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
        const { username, password } = req.body;
        const user = yield User_1.default.findOne({ username });
        if (!user) {
            res.status(404).json({
                massage: `User with username: ${username} doesn't exist`,
            });
            return;
        }
        const isPasswordCorrect = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({
                message: "Password isn't correct",
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
        }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const _a = user.toObject(), { password: passFromDB } = _a, restDataAboutUser = __rest(_a, ["password"]);
        res.json({
            token,
            restDataAboutUser,
            message: "You successfully logged in",
        });
    }
    catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "LogIn failed" });
    }
});
exports.login = login;
/* export const getProfile = async (req: Request, res: Response) => {
    const userId3 = (req as Request & { userId?: string }).userId;
    console.log("333333", req, userId3);
    const userId = (req as Request & { userId?: string }).userId;
    console.log("ssssssssssssssssssss", req.userId);
    console.log("dddddddddddd", (req as any).userId);

    try {
        const user = await User.findById(req.userId);
        const user1 = await User.findById(req.userId as string);
    } catch (err) {}
};
 */
