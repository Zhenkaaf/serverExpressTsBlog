import Post from "../models/Post";
import { Response } from "express";
import { RequestCustom } from "../types/express";
import Comment from "../models/Comment";
import mongoose from "mongoose";

/* export const createComment = async (req: RequestCustom, res: Response) => {
    try {
        const { comment, postId } = req.body;
        if (!comment?.trim()) {
            return res
                .status(400)
                .json({ message: "Comment text is required." });
        }
        if (!postId) {
            return res.status(400).json({ message: "Post ID is missing." });
        }
        const isPostExist = await Post.findById(postId);
        if (!isPostExist) {
            return res.status(404).json({
                message: "Post not found. It may have been deleted.",
            });
        }
        const newComment = new Comment({
            comment,
            postId,
            authorId: req.userId,
        });
        await newComment.save();
        //если post был удалён между операциями
        try {
            const updatedPost = await Post.findByIdAndUpdate(postId, {
                $push: { comments: newComment._id },
            });
            if (!updatedPost) {
                await Comment.findByIdAndDelete(newComment._id);
                return res.status(404).json({
                    message: "Post not found while associating comment.",
                });
            }
        } catch (err) {
            console.error("Error updating post:", err);
            await Comment.findByIdAndDelete(newComment._id); // удаляем коммент, если привязка не сработала
            return res
                .status(500)
                .json({ message: "Failed to link comment to post" });
        }

        res.status(201).json(newComment);
    } catch (err) {
        console.error("Error creating comment:", err);
        res.status(500).json({ message: "Failed to create comment" });
    }
}; */

export const createComment = async (req: RequestCustom, res: Response) => {
    const session = await mongoose.startSession();

    try {
        const { comment, postId } = req.body;
        if (!comment?.trim()) {
            return res
                .status(400)
                .json({ message: "Comment text is required." });
        }
        if (!postId) {
            return res.status(400).json({ message: "Post ID is missing." });
        }

        session.startTransaction();

        // Проверяем, что пост существует (в транзакции)
        const isPostExist = await Post.findById(postId).session(session);
        if (!isPostExist) {
            await session.abortTransaction();
            session.endSession();
            return res
                .status(404)
                .json({ message: "Post not found. It may have been deleted." });
        }

        // Создаем новый комментарий в рамках сессии
        const newComment = new Comment({
            comment,
            postId,
            author: req.userId,
        });
        await newComment.save({ session });

        // Добавляем ссылку на комментарий в пост
        await Post.findByIdAndUpdate(
            postId,
            { $push: { comments: newComment._id } },
            { session }
        );

        // Если все успешно — коммитим транзакцию
        await session.commitTransaction();
        session.endSession();

        res.status(201).json(newComment);
    } catch (err) {
        // При ошибке откатываем транзакцию
        await session.abortTransaction();
        session.endSession();

        console.error("Error creating comment:", err);
        res.status(500).json({ message: "Failed to create comment" });
    }
};
