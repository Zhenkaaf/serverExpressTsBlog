import { Router } from "express";
import {
    register,
    login,
    getProfile,
    resetPassword,
    verifyCode,
    createNewPassword,
} from "../controllers/auth";
import { checkAuth } from "../utils/checkAuth";
const router = Router();

//http://localhost:5000/api/auth/register
router.post("/register", register);
router.post("/login", login);
router.get("/profile", checkAuth, getProfile);
router.post("/reset-password", resetPassword);
router.post("/verify-code", verifyCode);
router.post("/create-new-password", createNewPassword);
export default router;
