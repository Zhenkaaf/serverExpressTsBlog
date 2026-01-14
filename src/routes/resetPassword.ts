import { Router } from "express";
import {
    createNewPassword,
    resetPassword,
    verifyCode,
} from "../controllers/resetPassword";
const router = Router();

//http://localhost:5000/api/reset-password/reset-password
router.post("/reset-password", resetPassword);

//http://localhost:5000/api/reset-password/verify-code
router.post("/verify-code", verifyCode);

//http://localhost:5000/api/reset-password/create-new-password
router.post("/create-new-password", createNewPassword);
export default router;
