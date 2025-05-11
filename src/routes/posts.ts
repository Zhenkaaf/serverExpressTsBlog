import { Router } from "express";
import { checkAuth } from "../utils/checkAuth";
import {
    createPost,
    delPostById,
    getAllPosts,
    getMyPosts,
    getPostById,
} from "../controllers/posts";
import { upload, handleFileUploadError } from "../utils/multerConfig";
const router = Router();

//https://serverexpresstsblog.onrender.com
//http://localhost:5000/api/post/create-post
router.post(
    "/create-post",
    checkAuth,
    upload.single("image"),
    handleFileUploadError,
    createPost
);
/*  upload.single("image")---Ищет поле с именем "image" в FormData.
Проверяет файл (тип, размер).
Сохраняет файл в req.file.
Остальные поля (title, text) будут лежать в req.body. */

router.get("/my-posts", checkAuth, getMyPosts);
router.get("/posts", getAllPosts);
router.get("/:id", checkAuth, getPostById);
router.delete("/:id", checkAuth, delPostById);

export default router;

/* Если файл загружен успешно, upload.single("file") завершится, и Express пойдёт дальше к следующему middleware (handleFileUploadError пропускается).
Если ошибка (например, большой файл), Express пропустит обработчик успешного запроса и вызовет handleFileUploadError.
handleFileUploadError отправляет res.status(...), и Express завершает обработку запроса. */
