"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    posts: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Post" }],
    //В этом поле posts мы храним массив ObjectId из другой коллекции — Post.
    //ref используется в Mongoose, чтобы связывать одну коллекцию с другой
    //с помощью ref: "Post" мы говорим Mongoose, к каким документам относятся эти ObjectId
    resetPasswordCode: { type: String }, // код сброса
    resetPasswordExpires: { type: Date }, // время истечения
    isResetCodeVerified: { type: Boolean },
}, { timestamps: true });
exports.default = mongoose_1.default.model("User", UserSchema);
