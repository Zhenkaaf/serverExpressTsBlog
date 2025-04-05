import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { RequestCustom } from "../types/express";

interface DecodedToken extends JwtPayload {
    id: string;
}

export const checkAuth = (
    req: RequestCustom,
    res: Response,
    next: NextFunction
): void => {
    const token = (req.headers.authorization || "").split(" ")[1];
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        res.status(500).json({ message: "JWT secret is not set" });
        return;
    }
    console.log("token*****", token);
    if (token) {
        try {
            const decodedJWT = jwt.verify(token, JWT_SECRET) as DecodedToken;
            if (!decodedJWT.id) {
                console.log("Invalid token");
                res.status(403).json({ message: "Invalid token" });
                return;
            }
            req.userId = decodedJWT.id;
            next();
        } catch (err: any) {
            console.log("Invalid or expired token. Access denied");
            res.status(403).json({
                message: "Invalid or expired token. Access denied",
            });
            return;
        }
    } else {
        console.log("You don't have access, token is missing");
        res.status(403).json({
            message: "You don't have access, token is missing",
        });
        return;
    }
};

/* Middleware — это функции, которые обрабатывают запросы и могут изменять их (например, добавлять данные в объект запроса req, изменять ответ res, или выполнить другие операции).
Когда middleware завершает свою работу, оно вызывает next(), чтобы передать управление следующему middleware. */
