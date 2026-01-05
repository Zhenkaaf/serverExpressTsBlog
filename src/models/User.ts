import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
        //В этом поле posts мы храним массив ObjectId из другой коллекции — Post.
        //ref используется в Mongoose, чтобы связывать одну коллекцию с другой
        //с помощью ref: "Post" мы говорим Mongoose, к каким документам относятся эти ObjectId
        resetPasswordCode: { type: String }, // код сброса
        resetPasswordExpires: { type: Date }, // время истечения
        isResetCodeVerified: { type: Boolean },
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);
