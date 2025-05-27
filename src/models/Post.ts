import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        imgUrl: {
            type: String,
            default: "",
        },
        views: {
            type: Number,
            default: 0,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    },
    { timestamps: true }
);

export default mongoose.model("Post", PostSchema);

//PostSchema поля author и comments — это ссылки на другие документы в базе данных, то есть они создают связи между коллекциями.
/* type: mongoose.Schema.Types.ObjectId — это означает, что в поле author хранится ObjectId (уникальный идентификатор) документа из другой коллекции.

ref: "User" — указывает, на какую коллекцию ссылается это поле. В данном случае — на коллекцию users. */
