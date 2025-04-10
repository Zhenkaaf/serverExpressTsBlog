import Post from "../models/Post";
import User from "../models/User";
import { Request, Response } from "express";
import { RequestCustom } from "../types/express";
import { v2 as cloudinary } from "cloudinary";

/*Когда вы импортируете модуль, весь код в этом модуле выполняется немедленно. Это не значит,
 что код будет выполнен только при запросе. код cloudinary.config() находится в самом начале модуля, 
и он выполняется сразу при импорте, даже если вы еще не вызываете никаких функцийю
Первоначальный импорт: Когда вы импортируете cloudinary в файл,
 все его зависимости и конфигурации, такие как cloudinary.config(),
  выполняются сразу, потому что импортированные модули выполняются при первом вызове. */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (fileBuffer: Buffer) => {
    const options = {
        folder: "avtovibe_images",
        use_filename: true,
        unique_filename: true,
    };

    return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) {
                    reject(error); // Если ошибка, отклоняем промис
                } else if (result && result.secure_url) {
                    resolve(result.secure_url); // Если успех, разрешаем промис с URL
                } else {
                    reject(new Error("Upload failed, secure_url not found")); // Если result есть, но secure_url отсутствует
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};

export const createPost = async (req: RequestCustom, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const { title, text } = req.body;
        if (!title?.trim() || !text?.trim()) {
            return res
                .status(400)
                .json({ message: "Title and text are required" });
        }
        // Загружаем изображение в Cloudinary
        const imgUrl = await uploadImage(req.file.buffer);
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const newPost = new Post({
            title,
            text,
            imgUrl,
            authorId: req.userId,
        });
        await newPost.save();
        //например, если пользователь был удалён между операциями
        try {
            await User.findByIdAndUpdate(req.userId, {
                $push: { posts: newPost },
            });
        } catch (updateErr) {
            console.error("User update failed:", updateErr);
            await Post.findByIdAndDelete(newPost._id); // удаляем пост, если привязка не сработала
            throw updateErr; // пробрасываем ошибку дальше
        }

        res.status(201).json(newPost);
    } catch (err) {
        console.error("Create post error:", err);
        res.status(500).json({ message: "Failed to create post" });
    }
};
