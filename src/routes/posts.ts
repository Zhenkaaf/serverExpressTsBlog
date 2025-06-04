import { Router } from "express";
import { checkAuth } from "../utils/checkAuth";
import {
    createPost,
    delPostById,
    getMyPosts,
    getPostById,
    getPosts,
    updPostById,
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
router.get("/posts", getPosts);
router.get("/:id", getPostById);
router.delete("/:id", checkAuth, delPostById);
router.put(
    "/:id",
    checkAuth,
    upload.single("image"),
    handleFileUploadError,
    updPostById
);

export default router;

/* Если файл загружен успешно, upload.single("file") завершится, и Express пойдёт дальше к следующему middleware (handleFileUploadError пропускается).
Если ошибка (например, большой файл), Express пропустит обработчик успешного запроса и вызовет handleFileUploadError.
handleFileUploadError отправляет res.status(...), и Express завершает обработку запроса. */
