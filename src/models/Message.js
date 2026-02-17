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
    messageType: {
        type: String,
        enum: ["text", "image", "video", "audio", "location", "contact", "files"],
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
    seen: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });


export const Message = mongoose.model("Message", MessageSchema);

