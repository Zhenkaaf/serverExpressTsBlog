import { Router } from "express";
import { register, login, getProfile } from "../controllers/auth";
import { checkAuth } from "../utils/checkAuth";
const router = Router();

//http://localhost:5000/api/auth/register
router.post("/register", register);
router.post("/login", login);
router.get("/profile", checkAuth, getProfile);
export default router;
