import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    message: {
        type: String,
        required: true
    },
    // type of messages
    type: {
        type: String,
        enum: ["text", "image", "video", "audio"],
        default: "text"
    },
    // url for media
    fileUrl: {
        type: String,
        default: ""
    },
    isRead: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });

export const Message = mongoose.model("Message", MessageSchema);

