import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        mediaUrl: {
            type: String,
            required: true
        },
        mediaType: {
            type: String,
            enum: ["image", "video"],
            default: "image"
        },
        caption: {
            type: String,
            trim: true
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        createdAt: {
            type: Date,
            default: Date.now
        }

    }

)

export const Post=mongoose.model("Post",postSchema);