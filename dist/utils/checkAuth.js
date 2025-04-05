"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const checkAuth = (req, res, next) => {
    const token = (req.headers.authorization || "").split(" ")[1];
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        res.status(500).json({ message: "JWT secret is not set" });
        return;
    }
    console.log(token);
    if (token) {
        try {
            const decodedJWT = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (!decodedJWT.id) {
                res.status(403).json({ message: "Invalid token" });
                return;
            }
            req.userId = decodedJWT.id;
            next();
        }
        catch (err) {
            res.status(403).json({
                message: "You don't have access",
            });
            return;
        }
    }
    else {
        res.status(403).json({
            message: "You don't have access, token is missing",
        });
        return;
    }
};
exports.checkAuth = checkAuth;
/* Middleware — это функции, которые обрабатывают запросы и могут изменять их (например, добавлять данные в объект запроса req, изменять ответ res, или выполнить другие операции).
Когда middleware завершает свою работу, оно вызывает next(), чтобы передать управление следующему middleware. */
