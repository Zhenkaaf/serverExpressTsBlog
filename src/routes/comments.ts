import { Router } from "express";
import { checkAuth } from "../utils/checkAuth";
import { createComment } from "../controllers/comments";
const router = Router();

//http://localhost:5000/api/comment/add-comment
router.post("/add-comment", checkAuth, createComment);

export default router;
