import { Router } from "express";
import { checkAuth } from "../utils/checkAuth";
import { createPost } from "../controllers/posts";
import { upload, handleFileUploadError } from "../utils/multerConfig";
const router = Router();

//http://localhost:5000/api/post/create-post
router.post(
    "/create-post",
    checkAuth,
    upload.single("image"),
    handleFileUploadError,
    createPost
);

export default router;

/* Если файл загружен успешно, upload.single("file") завершится, и Express пойдёт дальше к следующему middleware (handleFileUploadError пропускается).
Если ошибка (например, большой файл), Express пропустит обработчик успешного запроса и вызовет handleFileUploadError.
handleFileUploadError отправляет res.status(...), и Express завершает обработку запроса. */
