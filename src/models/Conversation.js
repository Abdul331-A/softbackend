import mongoose from "mongoose";


const conversationSchema = new mongoose.Schema({

    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    chatName: {
        type: String,
        trim: true
    },
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
     groupAdmin: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        default: ""
    },
    groupDescription: {
        type: String,
        default: ""
    },
    groupPicture: {
        type: String,
        default: ""
    },
    



}, { timestamps: true });

 const Conversation = mongoose.model("Conversation", conversationSchema);

 export default Conversation;

