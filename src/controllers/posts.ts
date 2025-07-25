import Post from "../models/Post";
import User from "../models/User";
import Comment from "../models/Comment";
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
        const newPost = new Post({
            title,
            text,
            imgUrl,
            author: req.userId,
        });
        await newPost.save();
        //если пользователь был удалён между операциями
        try {
            //Найди пользователя по userId и в массив posts добавь newPost._id.
            const updatedUser = await User.findByIdAndUpdate(req.userId, {
                $push: { posts: newPost._id },
            });
            if (!updatedUser) {
                await Post.findByIdAndDelete(newPost._id);
                return res
                    .status(404)
                    .json({ message: "User not found while linking post" });
            }
        } catch (err) {
            console.error("Error updating user:", err);
            await Post.findByIdAndDelete(newPost._id); // удаляем пост, если привязка не сработала
            return res
                .status(500)
                .json({ message: "Failed to link post to user" });
        }

        res.status(201).json(newPost);
    } catch (err) {
        console.error("Create post error:", err);
        res.status(500).json({ message: "Failed to create post" });
    }
};

export const updPostById = async (req: RequestCustom, res: Response) => {
    console.log("upd");
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const { title, text } = req.body;
        if (!title?.trim() || !text?.trim()) {
            return res
                .status(400)
                .json({ message: "Title and text are required" });
        }

        if (req.file) {
            try {
                await delImgFromCloudinary(post.imgUrl);
                post.imgUrl = await uploadImage(req.file.buffer);
            } catch (uploadErr) {
                console.error("Image upload error:", uploadErr);
                return res
                    .status(500)
                    .json({ message: "Failed to update image" });
            }
        }
        post.title = title;
        post.text = text;

        await post.save();

        res.status(200).json({ message: "Post was successfully updated" });
    } catch (err) {
        console.error("Error updating post by ID:", err);
        res.status(500).json({
            message: "Failed to update the post. Please try again later.",
        });
    }
};

export const getPostById = async (req: RequestCustom, res: Response) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id, // Поиск по ID поста
            { $inc: { views: 1 } }, // Увеличиваем количество просмотров на 1
            { new: true } // Возвращаем обновленный пост
        ).populate("author", "email -_id"); /* .populate({
            path: "comments", // Загружаем комментарии
            populate: {
                path: "author", // Загружаем авторов комментариев
                model: "User",
                select: "email -_id", // только email, без _id и лишнего
            },
        }); */ // Добавляем подгрузку комментариев
        /* Когда ты вызываешь .populate("comments") на запросе, Mongoose автоматически:
Смотрит на поле comments в найденном посте — там лежат ID комментариев.
Делает дополнительный запрос в коллекцию Comment и находит документы, у которых _id совпадает с этими ID.
Заменяет в ответе поле comments из массива ID на массив полных объектов комментариев. */
        console.log(post);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(post);
    } catch (err) {
        console.error("Error getting post by ID:", err);
        res.status(500).json({
            message: "Failed to get the post. Please try again later.",
        });
    }
};

export const getMyPosts = async (req: RequestCustom, res: Response) => {
    try {
        const posts = await Post.find({ author: req.userId }).sort({
            createdAt: -1,
        });
        console.log("User posts:", posts);
        res.status(200).json(posts);
    } catch (err) {
        console.error("Error getting posts", err);
        res.status(500).json({
            message: "Failed to get posts. Please try again later.",
        });
    }
};

export const getPosts = async (req: Request, res: Response) => {
    try {
        const pageParam = req.query.page;
        const page = typeof pageParam === "string" ? parseInt(pageParam) : 1;
        const currentPage = isNaN(page) ? 1 : page;
        const skip = (currentPage - 1) * 9;
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(9);
        const totalPosts = await Post.countDocuments();
        const popularPosts = await Post.find().sort({ views: -1 }).limit(4);
        res.status(200).json({
            posts,
            popularPosts,
            totalPages: Math.ceil(totalPosts / 9),
        });
    } catch (err) {
        console.error("Error getting all posts", err);
        res.status(500).json({
            message: "Failed to get all posts. Please try again later.",
        });
    }
};

const delImgFromCloudinary = async (imgUrl: string) => {
    const publicId = imgUrl.split("/").pop()?.split(".")[0]; // Извлекаем public_id из URL
    if (!publicId) {
        throw new Error("Invalid image URL: cannot extract public ID");
    }
    const fullPublicId = `avtovibe_images/${publicId}`;

    try {
        const result = await cloudinary.uploader.destroy(fullPublicId);

        if (result.result === "ok") {
            console.log("Image deleted successfully from Cloudinary");
        } else {
            console.error("Failed to delete image from Cloudinary:", result);
            throw new Error("Failed to delete image from Cloudinary");
        }
    } catch (err) {
        console.error("Error deleting image from Cloudinary:", err);
        throw err;
    }
};

export const delPostById = async (req: RequestCustom, res: Response) => {
    console.log("del");
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        await delImgFromCloudinary(post.imgUrl);
        await Post.findByIdAndDelete(req.params.id);
        await User.findByIdAndUpdate(req.userId, {
            $pull: { posts: req.params.id },
        });
        await Comment.deleteMany({ postId: req.params.id });

        res.status(200).json({ message: "Post was successfully deleted" });
    } catch (err) {
        console.error("Error deleting post by ID:", err);
        res.status(500).json({
            message: "Failed to delete the post. Please try again later.",
        });
    }
};
