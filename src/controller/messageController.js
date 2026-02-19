import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

export const sendMessage = asyncHandler(async (req, res) => {
    const { content, conversationId } = req.body;

    if (!content || !conversationId) {
        console.log("Invalid data passed into request");
        return res.status(400).json({ message: "Content and ConversationId are required" });
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        conversation: conversationId,
    };

    try {
        var message = await Message.create(newMessage);
        message = await message.populate("sender", "username profilePic phoneNumber");
        message = await message.populate("conversation");
        message = await Conversation.populate(message, {
            path: "latestMessage.sender",
            select: "username profilePic phoneNumber"
        }); 
        await Conversation.findByIdAndUpdate(conversationId, { latestMessage: message });
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json(error);
    }
});