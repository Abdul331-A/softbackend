import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        media: [
            {
                mediaUrl: {
                    type: String,
                },
                thumbnailUrl: {
                    type: String,
                    default: null
                },
                mediaType: {
                    type: String,
                    enum: ["image", "video"],
                    default: "image"
                },
                public_id: {
                    type: String,
                }
            }
        ],
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

export const Post = mongoose.model("Post", postSchema);