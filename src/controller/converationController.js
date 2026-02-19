import asyncHandler from "express-async-handler";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

export const accessConversation = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("userId params not sent with request");

        return res.status(400).json({ message: "UserId is required" });
    }

    var isConversation = await Conversation.find({
        $and: [
            { participants: { $elemMatch: { $eq: req.user._id } } },
            { participants: { $elemMatch: { $eq: userId } } }
        ]
    }).populate("participants", "-password -otp -resetOtp -resetOtpExpire -__v -updatedAt -createdAt -otpVerified")
    isConversation = await Conversation.populate(isConversation, {
        path: "latestMessage.sender",
        select: "username profilePic phoneNumber"
    })

    if (isConversation.length > 0) {
        res.send(isConversation[0]);
    } else {
        var ConversationData = {
            chatName: "sender",
            isGroupChat: false,
            participants: [req.user._id, userId],
        };

    }
    try {
        const createdConversation = await Conversation.create(ConversationData);
        const FullConversation = await Conversation.findOne({ _id: createdConversation._id }).populate("participants", "-password -otp -resetOtp -resetOtpExpire -__v -updatedAt -createdAt -otpVerified");
        return res.status(200).json(FullConversation);

    } catch (error) {
        res.status(500).json(error);
    }

});

export const fetchConversations = asyncHandler(async (req, res) => {
    try {
        Conversation.find({ participants: { $elemMatch: { $eq: req.user._id } } })
            .populate("participants", "-password -otp -resetOtp -resetOtpExpire -__v -updatedAt -createdAt -otpVerified -location -category -isOtpVerified -isPasswordCreated -bio")
            .populate("groupAdmin", "-password -otp -resetOtp -resetOtpExpire -__v -updatedAt -createdAt -otpVerified -location -category -isOtpVerified -isPasswordCreated -bio")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "username profilePic phoneNumber"
                });
                res.status(200).json(results);
            });
    } catch (error) {
        res.status(500).json(error);
        throw new Error(error.message);
    }
});

export const createGroupConversation = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
    }
    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        const groupConversation = await Conversation.create({
            chatName: req.body.name,
            participants: users,
            isGroupChat: true,
            groupAdmin: req.user
        });

        const fullGroupConversation = await Conversation.findOne({ _id: groupConversation._id })
            .populate("participants", "-password -otp -resetOtp -resetOtpExpire -__v -updatedAt -createdAt -otpVerified -location -category -isOtpVerified -isPasswordCreated -bio")
            .populate("groupAdmin", "-password -otp -resetOtp -resetOtpExpire -__v -updatedAt -createdAt -otpVerified -location -category -isOtpVerified -isPasswordCreated -bio");
        res.status(200).json(fullGroupConversation);
    } catch (error) {
        res.status(500).json(error);
        throw new Error(error.message);
    }
});

export const renameGroup = asyncHandler(async (req, res) => {
    const { conversationId, chatName } = req.body;

    const updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
            chatName: chatName,
        },
        {
            new: true,
        }
    )
        .populate("participants", "-password -otp -resetOtp -resetOtpExpire -__v -updatedAt -createdAt -otpVerified -location -category -isOtpVerified -isPasswordCreated -bio")
        .populate("groupAdmin", "-password -otp -resetOtp -resetOtpExpire -__v -updatedAt -createdAt -otpVerified -location -category -isOtpVerified -isPasswordCreated -bio");

    if (!updatedConversation) {
        res.status(404).json({ message: "Conversation Not Found" });
    } else {
        res.status(200).json({ message: "Group Renamed Successfully", conversation: updatedConversation });
    }
});

export const addToGroup = asyncHandler(async (req, res) => {
    const { conversationId, userId } = req.body;

    // check if the requester is admin
    const added = await Conversation.findByIdAndUpdate(
        conversationId,
        {
            $push: { participants: userId },
        },
        {
            new: true,
        }
    )
        .populate("participants", "-password -otp -resetOtp -resetOtpExpire -__v -updatedAt -createdAt -otpVerified -location -category -isOtpVerified -isPasswordVerified -bio")
        .populate("groupAdmin", "-password -otp -resetOtp -resetOtpExpire -__v -updatedAt -createdAt -otpVerified -location -category -isOtpVerified -isPasswordCreated -bio");

    if (!added) {
        res.status(404).json({ message: "Conversation Not Found" });
    } else {
        res.status(200).json({ message: "User Added Successfully", conversation: added });
    }

});
export const removeUserFromGroup = asyncHandler(async (req, res) => {
    const { conversationId, userId } = req.body;

    // check if the requester is admin
    const removed = await Conversation.findByIdAndUpdate(
        conversationId,
        {
            $pull: { participants: userId },
        },
        {
            new: true,
        }
    )
        .populate("participants", "-password -otp -resetOtp -resetOtpExpire -__v -updatedAt -createdAt -otpVerified -location -category -isOtpVerified -isPasswordVerified -bio")
        .populate("groupAdmin", "-password -otp -resetOtp -resetOtpExpire -__v -updatedAt -createdAt -otpVerified -location -category -isOtpVerified -isPasswordCreated -bio");

    if (!removed) {
        res.status(404).json({ message: "Conversation Not Found" });
    } else {
        res.status(200).json({ message: "User Removed Successfully", conversation: removed });
    }

});